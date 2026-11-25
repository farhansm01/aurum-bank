import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts, bankSettings, moneyRequests } from "@/db/schema";

// An error we want to show to the customer
export class RequestError extends Error {}

function toCents(value: string) {
  return Math.round(Number(value) * 100);
}

export type CreateRequestInput = {
  userId: string; // the logged-in customer, taken from the session
  accountNumber: string;
  type: string; // "deposit" or "withdrawal"
  amount: string; // like "2000" or "2000.50"
  description?: string;
};

export async function createMoneyRequest(input: CreateRequestInput) {
  // 1. Check the input
  if (input.type !== "deposit" && input.type !== "withdrawal") {
    throw new RequestError("Invalid request type.");
  }

  const amount = input.amount.trim();
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(amount) || toCents(amount) <= 0) {
    throw new RequestError("Enter a valid amount.");
  }
  const cents = toCents(amount);

  // 2. The account must belong to this customer (the userId is in the query)
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

  // 3. Bank settings
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

  // 4. A withdrawal needs enough balance (checked again at approval)
  if (input.type === "withdrawal") {
    const available = toCents(account.balance) - toCents(settings.minBalance);
    if (cents > available) {
      throw new RequestError("Not enough balance.");
    }
  }

  // 5. Save the request as pending. No money moves here.
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