import { config } from "dotenv";
import { eq } from "drizzle-orm";

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
  const { user, customerProfiles, bankAccounts, transactions, bankSettings } =
    await import("@/db/schema");
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

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});