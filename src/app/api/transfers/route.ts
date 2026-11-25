import { requireApiRole } from "@/lib/session";
import {
  TransferError,
  transfer,
} from "@/features/transactions/transactions.service";

export async function POST(request: Request) {
  // 1. Only a logged-in customer can transfer
  const check = await requireApiRole(["customer"]);
  if (check.error) return check.error;

  // 2. Read the request
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // 3. Call the transfer function
  try {
    const result = await transfer({
      userId: check.session.user.id, // from the session, never from the request
      fromAccountNumber: String(body.fromAccountNumber ?? ""),
      toAccountNumber: String(body.toAccountNumber ?? ""),
      amount: String(body.amount ?? ""),
      pin: String(body.pin ?? ""),
      description: body.description ? String(body.description) : undefined,
      idempotencyKey: String(body.idempotencyKey ?? ""),
    });

    return Response.json({
      transaction: {
        txnRef: result.txnRef,
        amount: result.amount,
        status: result.status,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    // an error meant for the customer, like "Wrong PIN."
    if (error instanceof TransferError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    // anything else is our bug: do not show details to the user
    console.error(error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}