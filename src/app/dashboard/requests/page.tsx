import Link from "next/link";
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
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link href="/dashboard" className="text-sm text-gold hover:underline">
        Back to dashboard
      </Link>
      <h1 className="mt-3 font-heading text-3xl font-bold text-primary">
        Deposit and withdrawal
      </h1>
      <p className="mt-1 text-sm text-muted">
        Send a request. Our staff reviews it and approves or rejects it.
      </p>

      <div className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8">
        <RequestForm accounts={accounts} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-primary">My requests</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No requests yet.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-muted">
                  {formatDate(r.createdAt)}
                </td>
                <td className="px-4 py-3 capitalize">{r.type}</td>
                <td className="px-4 py-3">{r.accountNumber}</td>
                <td className="px-4 py-3 font-medium">${money(r.amount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}