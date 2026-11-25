import { requireApiRole } from "@/lib/session";
import { LoanError, reviewLoan } from "@/features/loans/loans.service";

// PATCH /api/loans/[id] - Admin approves or rejects loan
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireApiRole(["admin"]);
  if (check.error) return check.error;

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request payload." }, { status: 400 });
  }

  try {
    const result = await reviewLoan({
      reviewerId: check.session.user.id,
      loanId: id,
      action: body.action as "approve" | "reject",
      interestRate: body.interestRate ? String(body.interestRate) : undefined,
    });

    return Response.json({ loan: result });
  } catch (error) {
    if (error instanceof LoanError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Loan review error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
