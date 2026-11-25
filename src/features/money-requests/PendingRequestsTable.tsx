import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts, moneyRequests, user } from "@/db/schema";
import { formatDate, money } from "@/lib/format";
import ReviewButtons from "./ReviewButtons";

export default async function PendingRequestsTable() {
  const rows = await db
    .select({
      id: moneyRequests.id,
      type: moneyRequests.type,
      amount: moneyRequests.amount,
      description: moneyRequests.description,
      createdAt: moneyRequests.createdAt,
      accountNumber: bankAccounts.accountNumber,
      customerName: user.name,
    })
    .from(moneyRequests)
    .innerJoin(bankAccounts, eq(moneyRequests.accountId, bankAccounts.id))
    .innerJoin(user, eq(moneyRequests.requestedBy, user.id))
    .where(eq(moneyRequests.status, "pending"))
    .orderBy(asc(moneyRequests.createdAt));

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Account</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Note</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-muted">
                No pending requests.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 text-muted">
                {formatDate(r.createdAt)}
              </td>
              <td className="px-4 py-3">{r.customerName}</td>
              <td className="px-4 py-3 capitalize">{r.type}</td>
              <td className="px-4 py-3">{r.accountNumber}</td>
              <td className="px-4 py-3 font-medium">${money(r.amount)}</td>
              <td className="px-4 py-3 text-muted">{r.description ?? "-"}</td>
              <td className="px-4 py-3">
                <ReviewButtons
                  id={r.id}
                  summary={`${r.type} of $${money(r.amount)} for ${r.customerName}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}