import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";
import { requireApiRole } from "@/lib/session";

const MONEY = /^\d{1,10}(\.\d{1,2})?$/;
const UUID = /^[0-9a-f-]{36}$/i;

// PATCH /api/admin/accounts/[id]
// Allows Admin to freeze or unfreeze a bank account, or update limits
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireApiRole(["admin"]);
  if (check.error) return check.error;

  const { id } = await params;
  if (!UUID.test(id)) {
    return Response.json({ error: "Account not found." }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  // typed from the table, so no "any" is needed
  const updateData: Partial<typeof bankAccounts.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.status) {
    if (body.status !== "active" && body.status !== "frozen") {
      return Response.json(
        { error: "Status must be active or frozen." },
        { status: 400 },
      );
    }
    updateData.status = body.status;
  }

  if (body.dailyLimit) {
    const value = String(body.dailyLimit).trim();
    if (!MONEY.test(value) || Number(value) <= 0) {
      return Response.json(
        { error: "Daily limit must be a positive amount." },
        { status: 400 },
      );
    }
    updateData.dailyLimit = value;
  }

  if (body.singleLimit) {
    const value = String(body.singleLimit).trim();
    if (!MONEY.test(value) || Number(value) <= 0) {
      return Response.json(
        { error: "Single limit must be a positive amount." },
        { status: 400 },
      );
    }
    updateData.singleLimit = value;
  }

  try {
    const [updated] = await db
      .update(bankAccounts)
      .set(updateData)
      .where(eq(bankAccounts.id, id))
      .returning();

    if (!updated) {
      return Response.json({ error: "Account not found." }, { status: 404 });
    }

    return Response.json({ account: updated });
  } catch (error) {
    console.error("Account management error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}