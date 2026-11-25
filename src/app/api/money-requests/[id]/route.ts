import { requireApiRole } from "@/lib/session";
import {
  RequestError,
  reviewMoneyRequest,
} from "@/features/money-requests/money-requests.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Only staff or admin can review
  const check = await requireApiRole(["staff", "admin"]);
  if (check.error) return check.error;

  const { id } = await params;

  // 2. Read the request
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // 3. Call the service
  try {
    const result = await reviewMoneyRequest({
      reviewerId: check.session.user.id, // from the session, never from the request
      requestId: id,
      action: String(body.action ?? ""),
    });

    return Response.json({
      request: {
        id: result.id,
        status: result.status,
        reviewedAt: result.reviewedAt,
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