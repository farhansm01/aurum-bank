import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { loans } from "@/db/schema";
import { requireApiRole } from "@/lib/session";

// GET /api/loans
// Returns loan applications for the logged-in customer.
export async function GET() {
  const check = await requireApiRole(["customer"]);
  if (check.error) return check.error;

  try {
    const rows = await db
      .select({
        id: loans.id,
        type: loans.type,
        amount: loans.amount,
        durationMonths: loans.durationMonths,
        status: loans.status,
        interestRate: loans.interestRate,
        monthlyPayment: loans.monthlyPayment,
        remainingBalance: loans.remainingBalance,
        createdAt: loans.createdAt,
      })
      .from(loans)
      .where(eq(loans.userId, check.session.user.id))
      .orderBy(desc(loans.createdAt));

    return Response.json({ loans: rows });
  } catch (error) {
    console.error("Failed to load loans:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
