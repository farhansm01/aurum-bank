import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bankAccounts,
  bankSettings,
  loanInstallments,
  loans,
  transactions,
  user,
} from "@/db/schema";
import {
  checkPin,
  makeTxnRef,
  toCents,
} from "@/features/transactions/transactions.service";

export class LoanError extends Error {}

export type ApplyLoanInput = {
  userId: string;
  accountNumber: string;
  type: string;
  amount: string;
  durationMonths: number;
  monthlyIncome: string;
  employmentStatus: string;
  description?: string;
};

// 1. Customer applies for a loan
export async function applyLoan(input: ApplyLoanInput) {
  const allowedTypes = ["personal", "home", "car", "education", "business"];
  if (!allowedTypes.includes(input.type)) {
    throw new LoanError("Invalid loan type.");
  }

  const allowedEmployment = [
    "employed",
    "self_employed",
    "business_owner",
    "student",
    "unemployed",
  ];
  if (!allowedEmployment.includes(input.employmentStatus)) {
    throw new LoanError("Invalid employment status.");
  }

  const amount = input.amount.trim();
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(amount) || toCents(amount) <= 0) {
    throw new LoanError("Enter a valid loan amount.");
  }

  const income = input.monthlyIncome.trim();
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(income) || toCents(income) <= 0) {
    throw new LoanError("Enter a valid monthly income.");
  }

  if (input.durationMonths < 1 || input.durationMonths > 120) {
    throw new LoanError("Loan duration must be between 1 and 120 months.");
  }

  // Account must belong to customer and be active
  const [account] = await db
    .select()
    .from(bankAccounts)
    .where(
      and(
        eq(bankAccounts.accountNumber, input.accountNumber.trim().toUpperCase()),
        eq(bankAccounts.userId, input.userId)
      )
    );

  if (!account) {
    throw new LoanError("Receiving bank account not found.");
  }

  if (account.status !== "active") {
    throw new LoanError("Selected receiving bank account is not active.");
  }

  const [created] = await db
    .insert(loans)
    .values({
      userId: input.userId,
      accountId: account.id,
      type: input.type,
      amount: amount,
      durationMonths: input.durationMonths,
      monthlyIncome: income,
      employmentStatus: input.employmentStatus,
      description: input.description?.trim().slice(0, 300) || null,
      status: "pending",
      remainingBalance: amount,
    })
    .returning();

  return created;
}

export type ReviewLoanInput = {
  reviewerId: string;
  loanId: string;
  action: "approve" | "reject";
  interestRate?: string; // e.g. "8.5"
};

// 2. Admin reviews (approves with disbursement + installment schedule or rejects)
export async function reviewLoan(input: ReviewLoanInput) {
  if (input.action !== "approve" && input.action !== "reject") {
    throw new LoanError("Invalid review action.");
  }

  return db.transaction(async (tx) => {
    const [loan] = await tx
      .select()
      .from(loans)
      .where(eq(loans.id, input.loanId))
      .for("update");

    if (!loan) {
      throw new LoanError("Loan application not found.");
    }

    if (loan.status !== "pending" && loan.status !== "under_review") {
      throw new LoanError("This loan application has already been processed.");
    }

    if (loan.userId === input.reviewerId) {
      throw new LoanError("Self-approval is forbidden.");
    }

    // Rejection: simply mark rejected, no funds moved
    if (input.action === "reject") {
      const [rejected] = await tx
        .update(loans)
        .set({
          status: "rejected",
          reviewedBy: input.reviewerId,
          reviewedAt: new Date(),
        })
        .where(eq(loans.id, loan.id))
        .returning();

      return rejected;
    }

    // Approval: disburse funds directly to customer account and generate installment schedule
    const [account] = await tx
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.id, loan.accountId))
      .for("update");

    if (!account || account.status !== "active") {
      throw new LoanError("Disbursement receiving account is not active.");
    }

    // Credit account balance with the loan principal
    await tx
      .update(bankAccounts)
      .set({
        balance: sql`${bankAccounts.balance} + ${loan.amount}::numeric`,
        updatedAt: new Date(),
      })
      .where(eq(bankAccounts.id, account.id));

    // Record disbursement transaction
    const [txn] = await tx
      .insert(transactions)
      .values({
        txnRef: makeTxnRef(),
        type: "loan_disbursement",
        receiverAccountId: account.id,
        amount: loan.amount,
        status: "completed",
        description: `Loan disbursement for ${loan.type} loan`,
        idempotencyKey: `loan-disburse:${loan.id}`,
      })
      .returning();

    // Calculate schedule
    // Keep existing interest rate rule or fallback to 0.00
    const interestRateStr = input.interestRate || loan.interestRate || "0.00";
    const totalPrincipalCents = toCents(loan.amount);
    const months = loan.durationMonths;
    const rateNum = Number(interestRateStr);

    // Total interest and total payable calculation
    const totalInterestCents = Math.round(totalPrincipalCents * (rateNum / 100));
    const totalPayableCents = totalPrincipalCents + totalInterestCents;

    const baseMonthlyCents = Math.floor(totalPayableCents / months);
    const remainderCents = totalPayableCents - baseMonthlyCents * months;

    const approvalDate = new Date();
    const installmentInserts = [];

    for (let i = 1; i <= months; i++) {
      const installmentAmountCents =
        i === months ? baseMonthlyCents + remainderCents : baseMonthlyCents;
      const installmentAmount = (installmentAmountCents / 100).toFixed(2);

      const dueDate = new Date(approvalDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      installmentInserts.push({
        loanId: loan.id,
        installmentNumber: i,
        dueDate,
        amount: installmentAmount,
        status: "due",
      });
    }

    // Insert installments
    await tx.insert(loanInstallments).values(installmentInserts);

    const monthlyPaymentStr = (baseMonthlyCents / 100).toFixed(2);
    const totalPayableStr = (totalPayableCents / 100).toFixed(2);

    // Mark loan approved and active with remaining balance set to total payable
    const [approved] = await tx
      .update(loans)
      .set({
        status: "active",
        interestRate: interestRateStr,
        monthlyPayment: monthlyPaymentStr,
        remainingBalance: totalPayableStr,
        reviewedBy: input.reviewerId,
        reviewedAt: approvalDate,
        disbursementTransactionId: txn.id,
      })
      .where(eq(loans.id, loan.id))
      .returning();

    return approved;
  });
}

export type RepayInstallmentInput = {
  userId: string;
  loanId: string;
  fromAccountNumber: string;
  pin: string;
  idempotencyKey: string;
};

// 3. Customer repays the next due installment
export async function repayNextInstallment(input: RepayInstallmentInput) {
  // a. Validate inputs
  if (!/^\d{4}$/.test(input.pin)) {
    throw new LoanError("PIN must be 4 digits.");
  }
  if (!input.idempotencyKey || !input.idempotencyKey.trim()) {
    throw new LoanError("Missing request key.");
  }
  if (!input.loanId || !/^[0-9a-f-]{36}$/i.test(input.loanId)) {
    throw new LoanError("Loan not found.");
  }

  // b. Verify PIN outside the database money transaction (with failed-attempts lockout)
  await checkPin(input.userId, input.pin);

  // c. Atomic database transaction
  return db.transaction(async (tx) => {
    // 1. Lock loan row
    const [loan] = await tx
      .select()
      .from(loans)
      .where(eq(loans.id, input.loanId))
      .for("update");

    if (!loan || loan.userId !== input.userId) {
      throw new LoanError("Loan not found.");
    }

    if (loan.status !== "active") {
      throw new LoanError("This loan is not currently active.");
    }

    // 2. Lock paying account
    const fromAcctNum = input.fromAccountNumber.trim().toUpperCase();
    const [account] = await tx
      .select()
      .from(bankAccounts)
      .where(
        and(
          eq(bankAccounts.accountNumber, fromAcctNum),
          eq(bankAccounts.userId, input.userId)
        )
      )
      .for("update");

    if (!account) {
      throw new LoanError("Payment bank account not found.");
    }

    if (account.status !== "active") {
      throw new LoanError("Payment bank account is frozen or inactive.");
    }

    // 3. Lock next due installment (lowest installmentNumber with status "due")
    const [nextInstallment] = await tx
      .select()
      .from(loanInstallments)
      .where(
        and(
          eq(loanInstallments.loanId, loan.id),
          eq(loanInstallments.status, "due")
        )
      )
      .orderBy(asc(loanInstallments.installmentNumber))
      .limit(1)
      .for("update");

    if (!nextInstallment) {
      throw new LoanError("No due installments remaining for this loan.");
    }

    // 4. Idempotency check: `${userId}:${idempotencyKey}`
    const key = `${input.userId}:${input.idempotencyKey.trim()}`;
    const [existingTxn] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.idempotencyKey, key));

    if (existingTxn) {
      return existingTxn;
    }

    // 5. Balance check against minimum balance setting
    const [settings] = await tx
      .select()
      .from(bankSettings)
      .where(eq(bankSettings.id, 1));

    if (!settings) {
      throw new LoanError("Bank settings are missing.");
    }

    const installmentCents = toCents(nextInstallment.amount);
    const minBalanceCents = toCents(settings.minBalance);
    const currentBalanceCents = toCents(account.balance);

    if (currentBalanceCents - installmentCents < minBalanceCents) {
      throw new LoanError("Not enough balance to pay this installment.");
    }

    // 6. Subtract amount with SQL arithmetic
    await tx
      .update(bankAccounts)
      .set({
        balance: sql`${bankAccounts.balance} - ${nextInstallment.amount}::numeric`,
        updatedAt: new Date(),
      })
      .where(eq(bankAccounts.id, account.id));

    // 7. Insert transactions row: type "loan_repayment"
    const txnRef = makeTxnRef();
    const [txn] = await tx
      .insert(transactions)
      .values({
        txnRef,
        type: "loan_repayment",
        senderAccountId: account.id,
        receiverAccountId: null,
        amount: nextInstallment.amount,
        fee: "0.00",
        status: "completed",
        description: `Loan repayment installment ${nextInstallment.installmentNumber} of ${loan.durationMonths}`,
        idempotencyKey: key,
      })
      .returning();

    // 8. Mark installment as paid
    const now = new Date();
    await tx
      .update(loanInstallments)
      .set({
        status: "paid",
        paidAt: now,
        transactionId: txn.id,
      })
      .where(eq(loanInstallments.id, nextInstallment.id));

    // 9. Check if any due installments remain after this one
    const [remainingDue] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(loanInstallments)
      .where(
        and(
          eq(loanInstallments.loanId, loan.id),
          eq(loanInstallments.status, "due")
        )
      );

    const dueCount = Number(remainingDue?.count || 0);

    if (dueCount === 0) {
      // Loan is completely paid off
      await tx
        .update(loans)
        .set({
          status: "completed",
          remainingBalance: "0.00",
        })
        .where(eq(loans.id, loan.id));
    } else {
      // Deduct from remaining balance with SQL arithmetic
      await tx
        .update(loans)
        .set({
          remainingBalance: sql`greatest(0, ${loans.remainingBalance} - ${nextInstallment.amount}::numeric)`,
        })
        .where(eq(loans.id, loan.id));
    }

    return txn;
  });
}

export type LoanDetailViewer = {
  id: string;
  role: string;
};

// 4. Read loan detail with strict ownership checks
export async function getLoanDetail(input: {
  loanId: string;
  viewer: LoanDetailViewer;
}) {
  if (!input.loanId || !/^[0-9a-f-]{36}$/i.test(input.loanId)) {
    return null;
  }

  const [loan] = await db
    .select({
      id: loans.id,
      userId: loans.userId,
      accountId: loans.accountId,
      type: loans.type,
      amount: loans.amount,
      durationMonths: loans.durationMonths,
      monthlyIncome: loans.monthlyIncome,
      employmentStatus: loans.employmentStatus,
      description: loans.description,
      status: loans.status,
      interestRate: loans.interestRate,
      monthlyPayment: loans.monthlyPayment,
      remainingBalance: loans.remainingBalance,
      disbursementTransactionId: loans.disbursementTransactionId,
      createdAt: loans.createdAt,
      reviewedAt: loans.reviewedAt,
      accountNumber: bankAccounts.accountNumber,
      accountType: bankAccounts.type,
      applicantName: user.name,
      applicantEmail: user.email,
    })
    .from(loans)
    .innerJoin(bankAccounts, eq(loans.accountId, bankAccounts.id))
    .innerJoin(user, eq(loans.userId, user.id))
    .where(eq(loans.id, input.loanId));

  if (!loan) {
    return null;
  }

  // Customer can only view their own loan
  if (input.viewer.role === "customer" && loan.userId !== input.viewer.id) {
    return null;
  }

  // Fetch installments ordered by installmentNumber
  const installments = await db
    .select()
    .from(loanInstallments)
    .where(eq(loanInstallments.loanId, loan.id))
    .orderBy(asc(loanInstallments.installmentNumber));

  // Fetch repayment history (transactions linked to installments)
  const paidTxnIds = installments
    .map((inst) => inst.transactionId)
    .filter((id): id is string => Boolean(id));

  let repaymentTransactions: {
    id: string;
    txnRef: string;
    amount: string;
    status: string;
    createdAt: Date;
    fromAccountNumber?: string | null;
  }[] = [];

  if (paidTxnIds.length > 0) {
    const txnRows = await db
      .select({
        id: transactions.id,
        txnRef: transactions.txnRef,
        amount: transactions.amount,
        status: transactions.status,
        createdAt: transactions.createdAt,
        fromAccountNumber: bankAccounts.accountNumber,
      })
      .from(transactions)
      .leftJoin(bankAccounts, eq(transactions.senderAccountId, bankAccounts.id))
      .where(sql`${transactions.id} in ${paidTxnIds}`)
      .orderBy(asc(transactions.createdAt));

    repaymentTransactions = txnRows;
  }

  // Fetch disbursement transaction if present
  let disbursementTransaction = null;
  if (loan.disbursementTransactionId) {
    const [disb] = await db
      .select({
        id: transactions.id,
        txnRef: transactions.txnRef,
        amount: transactions.amount,
        status: transactions.status,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(eq(transactions.id, loan.disbursementTransactionId));

    disbursementTransaction = disb || null;
  }

  return {
    loan,
    installments,
    repaymentTransactions,
    disbursementTransaction,
  };
}
