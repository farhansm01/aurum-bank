import { desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { requireRole } from "@/lib/session";
import AdvancedTransactionsTable from "@/components/dashboard/AdvancedTransactionsTable";

export default async function AdminTransactionsPage() {
  await requireRole(["admin"]);

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
        title="Master Financial Ledger"
        subtitle="Global search, status filtering, amount/date sorting, and export for bank administrators."
        pageSize={12}
      />
    </div>
  );
}
