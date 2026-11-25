import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { ArrowLeftRight, PlusCircle } from "lucide-react";

export default async function CustomerAccountsPage() {
  const session = await requireRole(["customer"]);

  const accounts = await db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, session.user.id))
    .orderBy(bankAccounts.accountNumber);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            My Bank Accounts
          </h1>
          <p className="text-sm text-muted">
            Manage and view balances across all your Aurum accounts.
          </p>
        </div>
        <Link
          href="/dashboard/transfer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          <ArrowLeftRight size={16} />
          <span>Transfer Funds</span>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="flex flex-col justify-between rounded-2xl border border-line bg-card p-6 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-muted">
                  {a.type} Account
                </span>
                <StatusBadge status={a.status} />
              </div>

              <div className="mt-4">
                <span className="text-xs text-muted">Available Balance</span>
                <p className="text-3xl font-bold text-primary">
                  ${money(a.balance)}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-page p-3 font-mono text-xs text-muted flex items-center justify-between">
                <span>Account No:</span>
                <span className="font-bold text-primary">{a.accountNumber}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-line space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>Daily Limit:</span>
                <span className="font-medium text-primary">${money(a.dailyLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Single Txn Limit:</span>
                <span className="font-medium text-primary">${money(a.singleLimit)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
