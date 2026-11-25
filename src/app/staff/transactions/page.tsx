import { desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { requireRole } from "@/lib/session";
import AdvancedTransactionsTable from "@/components/dashboard/AdvancedTransactionsTable";

export default async function StaffTransactionsPage() {
  await requireRole(["staff"]);

  const allTxns = await db
    .select({
      id: transactions.id,
      txnRef: transactions.txnRef,
      type: transactions.type,
      amount: transactions.amount,
      fee: transactions.fee,
      status: transactions.status,
      description: transactions.description,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .orderBy(desc(transactions.createdAt));

  return (
    <div className="space-y-6">
      <AdvancedTransactionsTable
        transactions={allTxns}
        title="Staff Transaction Auditing"
        subtitle="Search, filter, sort, and inspect all customer transactions across the bank."
        pageSize={12}
      />
    </div>
  );
}
