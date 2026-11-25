import { desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts, transactions } from "@/db/schema";
import { requireApiRole } from "@/lib/session";

// GET /api/transactions
// Returns recent transactions for the logged-in customer's accounts.
export async function GET(request: Request) {
  const check = await requireApiRole(["customer"]);
  if (check.error) return check.error;

  try {
    // 1. Find all accounts belonging to this customer
    const userAccounts = await db
      .select({ id: bankAccounts.id })
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, check.session.user.id));

    const accountIds = userAccounts.map((a) => a.id);

    if (accountIds.length === 0) {
      return Response.json({ transactions: [] });
    }

    // 2. Optional: check if query param ?accountId is provided and valid
    const { searchParams } = new URL(request.url);
    const filterAccountId = searchParams.get("accountId");

    const targetIds =
      filterAccountId && accountIds.includes(filterAccountId)
        ? [filterAccountId]
        : accountIds;

    // 3. Select transactions where sender or receiver is one of customer's accounts
    const rows = await db
      .select({
        id: transactions.id,
        txnRef: transactions.txnRef,
        type: transactions.type,
        senderAccountId: transactions.senderAccountId,
        receiverAccountId: transactions.receiverAccountId,
        amount: transactions.amount,
        fee: transactions.fee,
        status: transactions.status,
        description: transactions.description,
        flagged: transactions.flagged,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(
        or(
          inArray(transactions.senderAccountId, targetIds),
          inArray(transactions.receiverAccountId, targetIds)
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(20);

    return Response.json({ transactions: rows });
  } catch (error) {
    console.error("Failed to load transactions:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
