import { requireApiRole } from "@/lib/session";
import { LoanError, repayNextInstallment } from "@/features/loans/loans.service";
import { TransferError } from "@/features/transactions/transactions.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Only customer can repay their loan
  const check = await requireApiRole(["customer"]);
  if (check.error) return check.error;

  const { id } = await params;

  // 2. Read request body
  let body: {
    fromAccountNumber?: string;
    pin?: string;
    idempotencyKey?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request payload." }, { status: 400 });
  }

  // 3. Call repayment service
  try {
    const txn = await repayNextInstallment({
      userId: check.session.user.id,
      loanId: id,
      fromAccountNumber: String(body.fromAccountNumber ?? ""),
      pin: String(body.pin ?? ""),
      idempotencyKey: String(body.idempotencyKey ?? ""),
    });

    return Response.json({
      success: true,
      transaction: {
        txnRef: txn.txnRef,
        amount: txn.amount,
        status: txn.status,
        createdAt: txn.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof LoanError || error instanceof TransferError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    console.error("Loan repayment failure:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
