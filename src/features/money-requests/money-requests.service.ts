import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bankAccounts,
  bankSettings,
  moneyRequests,
  transactions,
  user,
} from "@/db/schema";
import {
  makeTxnRef,
  toCents,
} from "@/features/transactions/transactions.service";

// An error we want to show to the user
export class RequestError extends Error {}

// ---------------------------------------------------------
// 1. Customer sends a request (nothing moves yet)
// ---------------------------------------------------------

export type CreateRequestInput = {
  userId: string; // the logged-in customer, taken from the session
  accountNumber: string;
  type: string; // "deposit" or "withdrawal"
  amount: string; // like "2000" or "2000.50"
  description?: string;
};

export async function createMoneyRequest(input: CreateRequestInput) {
  if (input.type !== "deposit" && input.type !== "withdrawal") {
    throw new RequestError("Invalid request type.");
  }

  const amount = input.amount.trim();
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(amount) || toCents(amount) <= 0) {
    throw new RequestError("Enter a valid amount.");
  }
  const cents = toCents(amount);

  // the account must belong to this customer (the userId is in the query)
  const accountNumber = input.accountNumber.trim().toUpperCase();
  const [account] = await db
    .select()
    .from(bankAccounts)
    .where(
      and(
        eq(bankAccounts.accountNumber, accountNumber),
        eq(bankAccounts.userId, input.userId),
      ),
    );

  if (!account) {
    throw new RequestError("Account not found.");
  }
  if (account.status !== "active") {
    throw new RequestError("This account is frozen.");
  }

  const [settings] = await db
    .select()
    .from(bankSettings)
    .where(eq(bankSettings.id, 1));

  if (!settings) {
    throw new RequestError("Bank settings are missing.");
  }
  if (cents > toCents(settings.maxSingleTransaction)) {
    throw new RequestError("Amount is above the single transaction limit.");
  }

  // a withdrawal needs enough balance (checked again at approval)
  if (input.type === "withdrawal") {
    const available = toCents(account.balance) - toCents(settings.minBalance);
    if (cents > available) {
      throw new RequestError("Not enough balance.");
    }
  }

  const [created] = await db
    .insert(moneyRequests)
    .values({
      accountId: account.id,
      type: input.type,
      amount,
      description: input.description?.trim().slice(0, 200) || null,
      status: "pending",
      requestedBy: input.userId,
    })
    .returning();

  return created;
}

// ---------------------------------------------------------
// 2. Staff or admin approves or rejects
// ---------------------------------------------------------

export type ReviewInput = {
  reviewerId: string; // the logged-in staff or admin, taken from the session
  requestId: string;
  action: string; // "approve" or "reject"
};

export async function reviewMoneyRequest(input: ReviewInput) {
  if (input.action !== "approve" && input.action !== "reject") {
    throw new RequestError("Invalid action.");
  }
  if (!/^[0-9a-f-]{36}$/i.test(input.requestId)) {
    throw new RequestError("Request not found.");
  }

  return db.transaction(async (tx) => {
    // lock the request row: a second reviewer must wait, then sees it is done
    const [req] = await tx
      .select()
      .from(moneyRequests)
      .where(eq(moneyRequests.id, input.requestId))
      .for("update");

    if (!req) {
      throw new RequestError("Request not found.");
    }
    if (req.status !== "pending") {
      throw new RequestError("This request was already reviewed.");
    }
    if (req.requestedBy === input.reviewerId) {
      throw new RequestError("You cannot review your own request.");
    }

    // ----- reject: no money moves -----
    if (input.action === "reject") {
      const [rejected] = await tx
        .update(moneyRequests)
        .set({
          status: "rejected",
          reviewedBy: input.reviewerId,
          reviewedAt: new Date(),
        })
        .where(eq(moneyRequests.id, req.id))
        .returning();

      return rejected;
    }

    // ----- approve -----
    const [account] = await tx
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.id, req.accountId))
      .for("update");

    if (!account) {
      throw new RequestError("Account not found.");
    }
    if (account.status !== "active") {
      throw new RequestError("This account is frozen.");
    }

    const [owner] = await tx
      .select({ status: user.status })
      .from(user)
      .where(eq(user.id, account.userId));
    if (owner?.status !== "active") {
      throw new RequestError("The account owner is not active.");
    }

    const [settings] = await tx
      .select()
      .from(bankSettings)
      .where(eq(bankSettings.id, 1));
    if (!settings) {
      throw new RequestError("Bank settings are missing.");
    }

    const cents = toCents(req.amount);

    // check the balance again: it may have changed since the request
    if (req.type === "withdrawal") {
      const available =
        toCents(account.balance) - toCents(settings.minBalance);
      if (cents > available) {
        throw new RequestError("Not enough balance for this withdrawal.");
      }
    }

    // change the balance (the math happens inside the database)
    await tx
      .update(bankAccounts)
      .set({
        balance:
          req.type === "deposit"
            ? sql`${bankAccounts.balance} + ${req.amount}::numeric`
            : sql`${bankAccounts.balance} - ${req.amount}::numeric`,
        updatedAt: new Date(),
      })
      .where(eq(bankAccounts.id, account.id));

    // write the history row
    const [created] = await tx
      .insert(transactions)
      .values({
        txnRef: makeTxnRef(),
        type: req.type,
        senderAccountId: req.type === "withdrawal" ? account.id : null,
        receiverAccountId: req.type === "deposit" ? account.id : null,
        amount: req.amount,
        status: "completed",
        description:
          req.description ?? (req.type === "deposit" ? "Deposit" : "Withdrawal"),
        // one request can create only one transaction
        idempotencyKey: `request:${req.id}`,
      })
      .returning();

    const [approved] = await tx
      .update(moneyRequests)
      .set({
        status: "approved",
        reviewedBy: input.reviewerId,
        reviewedAt: new Date(),
        transactionId: created.id,
      })
      .where(eq(moneyRequests.id, req.id))
      .returning();

    return approved;
  });
}