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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Send Money
        </h1>
        <p className="text-sm text-muted">
          Transfer money instantly between your own accounts or to another Aurum customer.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8">
        <TransferForm accounts={accounts} />
      </div>
    </div>
  );
}
