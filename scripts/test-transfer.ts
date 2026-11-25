import { randomUUID } from "crypto";
import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  const { db } = await import("@/db");
  const { user, bankAccounts } = await import("@/db/schema");
  const { transfer } = await import(
    "@/features/transactions/transactions.service"
  );

  const [rahim] = await db
    .select()
    .from(user)
    .where(eq(user.email, "customer@aurum.test"));

  async function showBalances(label: string) {
    const rows = await db
      .select()
      .from(bankAccounts)
      .orderBy(bankAccounts.accountNumber);
    console.log(
      label,
      rows.map((r) => `${r.accountNumber}=${r.balance}`).join("  "),
    );
  }

  async function attempt(label: string, amount: string, pin: string) {
    try {
      const t = await transfer({
        userId: rahim.id,
        fromAccountNumber: "AB-1001",
        toAccountNumber: "AB-2001",
        amount,
        pin,
        idempotencyKey: randomUUID(),
      });
      console.log(`OK   ${label}: ${t.txnRef}`);
    } catch (e) {
      console.log(`FAIL ${label}: ${(e as Error).message}`);
    }
  }

  await showBalances("before:");
  await attempt("500 with the right PIN", "500.00", "1234");
  await attempt("500 with a wrong PIN", "500.00", "9999");
  await attempt("9000 (more than the balance)", "9000.00", "1234");
  await showBalances("after: ");

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});