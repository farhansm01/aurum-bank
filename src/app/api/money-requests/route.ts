import { requireApiRole } from "@/lib/session";
import {
  RequestError,
  createMoneyRequest,
} from "@/features/money-requests/money-requests.service";

export async function POST(request: Request) {
  // 1. Only a logged-in customer can send a request
  const check = await requireApiRole(["customer"]);
  if (check.error) return check.error;

  // 2. Read the request
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // 3. Call the service
  try {
    const created = await createMoneyRequest({
      userId: check.session.user.id, // from the session, never from the request
      accountNumber: String(body.accountNumber ?? ""),
      type: String(body.type ?? ""),
      amount: String(body.amount ?? ""),
      description: body.description ? String(body.description) : undefined,
    });

    return Response.json({
      request: {
        id: created.id,
        type: created.type,
        amount: created.amount,
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof RequestError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}