import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";
import { requireApiRole } from "@/lib/session";

// GET /api/accounts
// Returns the list of bank accounts owned by the logged-in customer.
export async function GET() {
  const check = await requireApiRole(["customer"]);
  if (check.error) return check.error;

  try {
    const accounts = await db
      .select({
        id: bankAccounts.id,
        accountNumber: bankAccounts.accountNumber,
        type: bankAccounts.type,
        balance: bankAccounts.balance,
        status: bankAccounts.status,
      })
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, check.session.user.id))
      .orderBy(bankAccounts.accountNumber);

    return Response.json({ accounts });
  } catch (error) {
    console.error("Failed to load accounts:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
