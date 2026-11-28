import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts, user } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import AccountFreezeAction from "@/components/dashboard/AccountFreezeAction";

export default async function AdminAccountsPage() {
  await requireRole(["admin"]);

  const accounts = await db
    .select({
      id: bankAccounts.id,
      accountNumber: bankAccounts.accountNumber,
      type: bankAccounts.type,
      balance: bankAccounts.balance,
      status: bankAccounts.status,
      dailyLimit: bankAccounts.dailyLimit,
      singleLimit: bankAccounts.singleLimit,
      createdAt: bankAccounts.createdAt,
      ownerName: user.name,
      ownerEmail: user.email,
    })
    .from(bankAccounts)
    .innerJoin(user, eq(bankAccounts.userId, user.id))
    .orderBy(desc(bankAccounts.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Bank Accounts Management
        </h1>
        <p className="text-sm text-muted">
          Inspect customer balances, daily transaction thresholds, and freeze/unfreeze accounts.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-xs">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-line bg-page text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="px-5 py-3.5">Account Number</th>
              <th className="px-5 py-3.5">Owner</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Balance</th>
              <th className="px-5 py-3.5">Daily Limit</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted">
                  No bank accounts found.
                </td>
              </tr>
            ) : (
              accounts.map((a) => (
                <tr key={a.id} className="hover:bg-page/50">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-primary">
                    {a.accountNumber}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-primary">{a.ownerName}</p>
                    <p className="text-xs text-muted">{a.ownerEmail}</p>
                  </td>
                  <td className="px-5 py-4 capitalize text-muted">{a.type}</td>
                  <td className="px-5 py-4 font-bold text-primary">
                    ${money(a.balance)}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted">
                    ${money(a.dailyLimit)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-4">
                    <AccountFreezeAction
                      accountId={a.id}
                      currentStatus={a.status}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
