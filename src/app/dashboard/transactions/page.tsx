import { desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts, transactions } from "@/db/schema";
import { requireRole } from "@/lib/session";
import AdvancedTransactionsTable from "@/components/dashboard/AdvancedTransactionsTable";

export default async function CustomerTransactionsPage() {
  const session = await requireRole(["customer"]);

  // 1. Get user accounts
  const userAccounts = await db
    .select({ id: bankAccounts.id })
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, session.user.id));

  const accountIds = userAccounts.map((a) => a.id);

  // 2. Get the transactions of those accounts (none if the user has no account)
  const rows =
    accountIds.length === 0
      ? []
      : await db
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
          .where(
            or(
              inArray(transactions.senderAccountId, accountIds),
              inArray(transactions.receiverAccountId, accountIds),
            ),
          )
          .orderBy(desc(transactions.createdAt));

  return (
    <div className="space-y-6">
      <AdvancedTransactionsTable
        transactions={rows}
        title="My Transactions Ledger"
        subtitle="Search, filter, sort by date or amount, and export your personal account statements."
        pageSize={10}
      />
    </div>
  );
}