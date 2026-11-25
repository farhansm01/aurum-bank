import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts, moneyRequests } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { formatDate, money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import RequestForm from "@/features/money-requests/RequestForm";

export default async function RequestsPage() {
  const session = await requireRole(["customer"]);

  // this customer's own, active accounts
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

  // this customer's own requests, newest first
  const requests = await db
    .select({
      id: moneyRequests.id,
      type: moneyRequests.type,
      amount: moneyRequests.amount,
      status: moneyRequests.status,
      description: moneyRequests.description,
      createdAt: moneyRequests.createdAt,
      accountNumber: bankAccounts.accountNumber,
    })
    .from(moneyRequests)
    .innerJoin(bankAccounts, eq(moneyRequests.accountId, bankAccounts.id))
    .where(eq(moneyRequests.requestedBy, session.user.id))
    .orderBy(desc(moneyRequests.createdAt))
    .limit(20);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Deposit & Withdrawal Requests
        </h1>
        <p className="text-sm text-muted">
          Submit deposit or withdrawal requests for bank staff review and processing.
        </p>
      </div>

      {/* Submission Form */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8 max-w-2xl">
        <h2 className="text-lg font-bold text-primary mb-4">New Request</h2>
        <RequestForm accounts={accounts} />
      </div>

      {/* History Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary">My Request History</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-xs">
          <table className="w-full min-w-[550px] text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Account</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted">
                    No requests submitted yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-page/50">
                    <td className="px-5 py-4 text-xs text-muted">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-5 py-4 capitalize font-medium text-primary">
                      {r.type}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">
                      {r.accountNumber}
                    </td>
                    <td className="px-5 py-4 font-bold text-primary">
                      ${money(r.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
