import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

// load .env.local BEFORE importing the db
config({ path: ".env.local" });

const demoUsers = [
  { name: "Admin User", email: "admin@aurum.test", password: "Admin@12345", role: "admin" },
  { name: "Staff User", email: "staff@aurum.test", password: "Staff@12345", role: "staff" },
  { name: "Customer User", email: "customer@aurum.test", password: "Customer@12345", role: "customer" },
  { name: "Karim Hossain", email: "karim@aurum.test", password: "Karim@12345", role: "customer" },
];

const demoPins = [
  { email: "customer@aurum.test", pin: "1234" },
  { email: "karim@aurum.test", pin: "5678" },
];

const demoAccounts = [
  { owner: "customer@aurum.test", number: "AB-1001", type: "savings", balance: "5000.00" },
  { owner: "customer@aurum.test", number: "AB-1002", type: "current", balance: "1200.00" },
  { owner: "karim@aurum.test", number: "AB-2001", type: "savings", balance: "3000.00" },
];

async function main() {
  const { db } = await import("@/db");
  const {
    user,
    customerProfiles,
    bankAccounts,
    transactions,
    bankSettings,
    loans,
    loanInstallments,
  } = await import("@/db/schema");
  const { auth } = await import("@/lib/auth");
  const { hashPin } = await import("@/lib/pin");

  // 1. Users
  for (const demo of demoUsers) {
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, demo.email));

    if (existing.length > 0) {
      console.log(`skipped user ${demo.email} (already exists)`);
      continue;
    }

    await auth.api.signUpEmail({
      body: { name: demo.name, email: demo.email, password: demo.password },
    });

    await db
      .update(user)
      .set({ role: demo.role })
      .where(eq(user.email, demo.email));

    console.log(`created user ${demo.email} (${demo.role})`);
  }

  // 2. Transaction PINs (hashed)
  for (const demo of demoPins) {
    const [owner] = await db
      .select()
      .from(user)
      .where(eq(user.email, demo.email));

    await db
      .insert(customerProfiles)
      .values({
        userId: owner.id,
        pinHash: await hashPin(demo.pin),
        verificationStatus: "verified",
      })
      .onConflictDoNothing();

    console.log(`PIN ready for ${demo.email}`);
  }

  // 3. Bank settings (one row only)
  await db.insert(bankSettings).values({ id: 1 }).onConflictDoNothing();
  console.log("bank settings ready");

  // 4. Bank accounts, each with an opening deposit transaction
  for (const demo of demoAccounts) {
    const [owner] = await db
      .select()
      .from(user)
      .where(eq(user.email, demo.owner));

    const created = await db
      .insert(bankAccounts)
      .values({
        userId: owner.id,
        accountNumber: demo.number,
        type: demo.type,
        balance: demo.balance,
      })
      .onConflictDoNothing()
      .returning();

    if (created.length === 0) {
      console.log(`skipped account ${demo.number} (already exists)`);
      continue;
    }

    await db.insert(transactions).values({
      txnRef: `TXN-SEED-${demo.number}`,
      type: "deposit",
      receiverAccountId: created[0].id,
      amount: demo.balance,
      status: "completed",
      description: "Opening balance",
      idempotencyKey: `seed-${demo.number}`,
    });

    console.log(`created account ${demo.number} with ${demo.balance}`);
  }

  // 5. Active demo loan for customer@aurum.test with 2 paid installments
  const [customerUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, "customer@aurum.test"));

  const [customerAccount] = await db
    .select()
    .from(bankAccounts)
    .where(
      and(
        eq(bankAccounts.userId, customerUser.id),
        eq(bankAccounts.accountNumber, "AB-1001")
      )
    );

  const [adminUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, "admin@aurum.test"));

  const loanAmount = "6000.00";
  const durationMonths = 6;
  const monthlyPayment = "1000.00";
  // First 2 installments paid ($2000.00 total), remaining balance is $4000.00
  const remainingBalance = "4000.00";

  // Check if seed loan already exists for idempotency
  const existingLoans = await db
    .select()
    .from(loans)
    .where(
      and(
        eq(loans.userId, customerUser.id),
        eq(loans.description, "Demo personal loan (seed)")
      )
    );

  let seedLoan = existingLoans[0];

  if (!seedLoan) {
    // 1. Disbursement transaction
    const [disbTxn] = await db
      .insert(transactions)
      .values({
        txnRef: "TXN-SEED-LOAN-DISBURSE",
        type: "loan_disbursement",
        receiverAccountId: customerAccount.id,
        amount: loanAmount,
        status: "completed",
        description: "Disbursement for personal loan",
        idempotencyKey: "seed-loan-disbursement-1",
      })
      .onConflictDoNothing()
      .returning();

    const disbTxnId = disbTxn?.id;

    // 2. Insert active loan
    const [createdLoan] = await db
      .insert(loans)
      .values({
        userId: customerUser.id,
        accountId: customerAccount.id,
        type: "personal",
        amount: loanAmount,
        durationMonths,
        monthlyIncome: "5000.00",
        employmentStatus: "employed",
        description: "Demo personal loan (seed)",
        status: "active",
        interestRate: "0.00",
        monthlyPayment,
        remainingBalance,
        reviewedBy: adminUser.id,
        disbursementTransactionId: disbTxnId,
        reviewedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      })
      .returning();

    seedLoan = createdLoan;
    console.log("created demo loan for customer@aurum.test");

    // 3. Create installment schedule (6 months)
    const baseDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    for (let i = 1; i <= durationMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const isPaid = i <= 2;
      let repaymentTxnId: string | null = null;

      if (isPaid) {
        const [repayTxn] = await db
          .insert(transactions)
          .values({
            txnRef: `TXN-SEED-LOAN-REPAY-${i}`,
            type: "loan_repayment",
            senderAccountId: customerAccount.id,
            receiverAccountId: null,
            amount: monthlyPayment,
            fee: "0.00",
            status: "completed",
            description: `Loan repayment installment ${i} of ${durationMonths}`,
            idempotencyKey: `seed-loan-repay-${seedLoan.id}-${i}`,
          })
          .returning();

        repaymentTxnId = repayTxn.id;
      }

      await db.insert(loanInstallments).values({
        loanId: seedLoan.id,
        installmentNumber: i,
        dueDate,
        amount: monthlyPayment,
        status: isPaid ? "paid" : "due",
        paidAt: isPaid ? dueDate : null,
        transactionId: repaymentTxnId,
      });
    }

    console.log("created 6 installment rows (2 paid, 4 due) for demo loan");
  } else {
    console.log("demo loan already exists (skipping)");
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
