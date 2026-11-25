import { randomInt } from "crypto";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bankAccounts,
  bankSettings,
  customerProfiles,
  transactions,
  user,
} from "@/db/schema";
import { verifyPin } from "@/lib/pin";

// An error we want to show to the customer
export class TransferError extends Error {}

const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCK_MINUTES = 15;

// "5000.00" -> 500000 (whole cents, safe to compare)
function toCents(value: string) {
  return Math.round(Number(value) * 100);
}

function makeTxnRef() {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `TXN-${day}-${randomInt(100000, 1000000)}`;
}

export type TransferInput = {
  userId: string; // the logged-in customer, taken from the session
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: string; // like "500" or "500.50"
  pin: string;
  description?: string;
  idempotencyKey: string;
};

async function checkPin(userId: string, pin: string) {
  const [profile] = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId));

  if (!profile?.pinHash) {
    throw new TransferError("Set your transaction PIN first.");
  }

  if (profile.pinLockedUntil && profile.pinLockedUntil > new Date()) {
    throw new TransferError("Your PIN is locked. Try again later.");
  }

  const isRight = await verifyPin(pin, profile.pinHash);

  if (!isRight) {
    const attempts = profile.pinFailedAttempts + 1;
    const shouldLock = attempts >= MAX_PIN_ATTEMPTS;

    await db
      .update(customerProfiles)
      .set({
        pinFailedAttempts: shouldLock ? 0 : attempts,
        pinLockedUntil: shouldLock
          ? new Date(Date.now() + PIN_LOCK_MINUTES * 60 * 1000)
          : null,
      })
      .where(eq(customerProfiles.userId, userId));

    throw new TransferError(
      shouldLock
        ? `Too many wrong PINs. Locked for ${PIN_LOCK_MINUTES} minutes.`
        : "Wrong PIN.",
    );
  }

  // right PIN: clear old wrong attempts
  if (profile.pinFailedAttempts > 0) {
    await db
      .update(customerProfiles)
      .set({ pinFailedAttempts: 0, pinLockedUntil: null })
      .where(eq(customerProfiles.userId, userId));
  }
}

export async function transfer(input: TransferInput) {
  // 1. Check the input
  const amount = input.amount.trim();
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(amount) || toCents(amount) <= 0) {
    throw new TransferError("Enter a valid amount.");
  }
  if (!/^\d{4}$/.test(input.pin)) {
    throw new TransferError("PIN must be 4 digits.");
  }
  if (!input.idempotencyKey) {
    throw new TransferError("Missing request key.");
  }

  const from = input.fromAccountNumber.trim().toUpperCase();
  const to = input.toAccountNumber.trim().toUpperCase();
  if (from === to) {
    throw new TransferError("You cannot send money to the same account.");
  }

  // 2. Check the PIN (outside the money transaction)
  await checkPin(input.userId, input.pin);

  // 3. The money transaction: everything succeeds, or nothing changes
  return db.transaction(async (tx) => {
    // lock both accounts (always in the same order, so two transfers never block each other)
    const locked = await tx
      .select()
      .from(bankAccounts)
      .where(inArray(bankAccounts.accountNumber, [from, to]))
      .orderBy(bankAccounts.id)
      .for("update");

    const sender = locked.find((a) => a.accountNumber === from);
    const receiver = locked.find((a) => a.accountNumber === to);

    // the sender account must belong to the logged-in customer
    if (!sender || sender.userId !== input.userId) {
      throw new TransferError("Your account was not found.");
    }
    if (!receiver) {
      throw new TransferError("Recipient account not found.");
    }

    // same request sent twice? return the first result, move no money
    const key = `${input.userId}:${input.idempotencyKey}`;
    const [existing] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.idempotencyKey, key));
    if (existing) return existing;

    // account status
    if (sender.status !== "active") {
      throw new TransferError("Your account is frozen.");
    }
    const [receiverOwner] = await tx
      .select({ status: user.status })
      .from(user)
      .where(eq(user.id, receiver.userId));
    if (receiver.status !== "active" || receiverOwner?.status !== "active") {
      throw new TransferError("The recipient account is not available.");
    }

    // bank settings
    const [settings] = await tx
      .select()
      .from(bankSettings)
      .where(eq(bankSettings.id, 1));
    if (!settings) {
      throw new TransferError("Bank settings are missing.");
    }

    // single transaction limit
    const cents = toCents(amount);
    const singleMax = Math.min(
      toCents(sender.singleLimit),
      toCents(settings.maxSingleTransaction),
    );
    if (cents > singleMax) {
      throw new TransferError("Amount is above the single transaction limit.");
    }

    // daily limit: what this account already sent today, plus this transfer
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const [today] = await tx
      .select({ total: sql<string>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.senderAccountId, sender.id),
          eq(transactions.type, "transfer"),
          eq(transactions.status, "completed"),
          gte(transactions.createdAt, startOfDay),
        ),
      );

    const dailyMax = Math.min(
      toCents(sender.dailyLimit),
      toCents(settings.dailyTransferLimit),
    );
    if (toCents(String(today.total)) + cents > dailyMax) {
      throw new TransferError("This would pass your daily transfer limit.");
    }

    // balance (the fee and the minimum balance count too)
    const needed =
      cents + toCents(settings.transferFee) + toCents(settings.minBalance);
    if (toCents(sender.balance) < needed) {
      throw new TransferError("Not enough balance.");
    }

    // move the money (the math happens inside the database)
    await tx
      .update(bankAccounts)
      .set({
        balance: sql`${bankAccounts.balance} - ${amount}::numeric - ${settings.transferFee}::numeric`,
        updatedAt: new Date(),
      })
      .where(eq(bankAccounts.id, sender.id));

    await tx
      .update(bankAccounts)
      .set({
        balance: sql`${bankAccounts.balance} + ${amount}::numeric`,
        updatedAt: new Date(),
      })
      .where(eq(bankAccounts.id, receiver.id));

    // write the history row
    const [created] = await tx
      .insert(transactions)
      .values({
        txnRef: makeTxnRef(),
        type: "transfer",
        senderAccountId: sender.id,
        receiverAccountId: receiver.id,
        amount,
        fee: settings.transferFee,
        status: "completed",
        description: input.description?.trim().slice(0, 200) || null,
        idempotencyKey: key,
      })
      .returning();

    return created;
  });
}