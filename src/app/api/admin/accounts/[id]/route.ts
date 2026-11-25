import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";
import { requireApiRole } from "@/lib/session";

// PATCH /api/admin/accounts/[id]
// Allows Admin to freeze or unfreeze a bank account, or update limits
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
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (body.status) {
      if (body.status !== "active" && body.status !== "frozen") {
        return Response.json({ error: "Status must be active or frozen." }, { status: 400 });
      }
      updateData.status = body.status;
    }

    if (body.dailyLimit) {
      updateData.dailyLimit = String(body.dailyLimit);
    }

    if (body.singleLimit) {
      updateData.singleLimit = String(body.singleLimit);
    }

    const [updated] = await db
      .update(bankAccounts)
      .set(updateData)
      .where(eq(bankAccounts.id, id))
      .returning();

    return Response.json({ account: updated });
  } catch (error) {
    console.error("Account management error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
