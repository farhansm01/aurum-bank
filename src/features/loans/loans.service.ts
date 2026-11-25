import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts, loans, transactions, user } from "@/db/schema";
import { makeTxnRef, toCents } from "@/features/transactions/transactions.service";

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

// 2. Admin reviews (approves with disbursement or rejects)
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

    // Approval: disburse funds directly to customer account
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

    // Mark loan approved and active
    const [approved] = await tx
      .update(loans)
      .set({
        status: "active",
        interestRate: input.interestRate || "7.50",
        reviewedBy: input.reviewerId,
        reviewedAt: new Date(),
        disbursementTransactionId: txn.id,
      })
      .where(eq(loans.id, loan.id))
      .returning();

    return approved;
  });
}
