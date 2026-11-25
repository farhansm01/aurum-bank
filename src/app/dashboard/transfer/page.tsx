import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";
import { requireRole } from "@/lib/session";
import TransferForm from "@/features/transactions/TransferForm";

export default async function TransferPage() {
  const session = await requireRole(["customer"]);

  // only this customer's own, active accounts
  const accounts = await db
    .select({
      accountNumber: bankAccounts.accountNumber,
      type: bankAccounts.type,
      balance: bankAccounts.balance,
    })
    .from(bankAccounts)
    .where(
      and(
        eq(bankAccounts.userId, session.user.id),
        eq(bankAccounts.status, "active"),
      ),
    )
    .orderBy(bankAccounts.accountNumber);

  return (
    <main className="mx-auto max-w-xl p-4 sm:p-6">
      <Link href="/dashboard" className="text-sm text-gold hover:underline">
        Back to dashboard
      </Link>
      <h1 className="mt-3 font-heading text-3xl font-bold text-primary">
        Send money
      </h1>
      <p className="mt-1 text-sm text-muted">
        Send to your own account or to another Aurum customer.
      </p>
      <div className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8">
        <TransferForm accounts={accounts} />
      </div>
    </main>
  );
}