import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { loans } from "@/db/schema";
import { requireApiRole } from "@/lib/session";
import { LoanError, applyLoan } from "@/features/loans/loans.service";

// GET /api/loans - list customer loans
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

// POST /api/loans - submit new loan application
export async function POST(request: Request) {
  const check = await requireApiRole(["customer"]);
  if (check.error) return check.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request payload." }, { status: 400 });
  }

  try {
    const created = await applyLoan({
      userId: check.session.user.id,
      accountNumber: String(body.accountNumber ?? ""),
      type: String(body.type ?? ""),
      amount: String(body.amount ?? ""),
      durationMonths: Number(body.durationMonths ?? 12),
      monthlyIncome: String(body.monthlyIncome ?? ""),
      employmentStatus: String(body.employmentStatus ?? ""),
      description: body.description ? String(body.description) : undefined,
    });

    return Response.json({ loan: created }, { status: 201 });
  } catch (error) {
    if (error instanceof LoanError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Loan application error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
