import { desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { formatDate, money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export default async function StaffTransactionsPage() {
  await requireRole(["staff"]);

  const allTxns = await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Transaction Monitoring
        </h1>
        <p className="text-sm text-muted">
          Review system transactions and audit logs across all customer accounts.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-xs">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-line bg-page text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="px-5 py-3.5">Reference ID</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Description</th>
              <th className="px-5 py-3.5">Amount</th>
              <th className="px-5 py-3.5">Fee</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {allTxns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted">
                  No transactions recorded.
                </td>
              </tr>
            ) : (
              allTxns.map((t) => (
                <tr key={t.id} className="hover:bg-page/50">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-primary">
                    {t.txnRef}
                  </td>
                  <td className="px-5 py-4 capitalize text-muted">
                    {t.type.replace("_", " ")}
                  </td>
                  <td className="px-5 py-4 text-primary max-w-xs truncate">
                    {t.description || "-"}
                  </td>
                  <td className="px-5 py-4 font-bold text-primary">
                    ${money(t.amount)}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted">
                    ${money(t.fee)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-5 py-4 text-xs text-muted">
                    {formatDate(t.createdAt)}
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
