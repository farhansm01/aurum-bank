import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankSettings } from "@/db/schema";
import { requireApiRole } from "@/lib/session";

// GET & PATCH /api/admin/settings
export async function GET() {
  const check = await requireApiRole(["admin"]);
  if (check.error) return check.error;

  const [settings] = await db
    .select()
    .from(bankSettings)
    .where(eq(bankSettings.id, 1));

  return Response.json({ settings: settings ?? null });
}

export async function PATCH(request: Request) {
  const check = await requireApiRole(["admin"]);
  if (check.error) return check.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const [updated] = await db
      .insert(bankSettings)
      .values({
        id: 1,
        dailyTransferLimit: String(body.dailyTransferLimit ?? "50000.00"),
        maxSingleTransaction: String(body.maxSingleTransaction ?? "10000.00"),
        minBalance: String(body.minBalance ?? "0.00"),
        transferFee: String(body.transferFee ?? "0.00"),
        updatedBy: check.session.user.id,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: bankSettings.id,
        set: {
          dailyTransferLimit: String(body.dailyTransferLimit ?? "50000.00"),
          maxSingleTransaction: String(body.maxSingleTransaction ?? "10000.00"),
          minBalance: String(body.minBalance ?? "0.00"),
          transferFee: String(body.transferFee ?? "0.00"),
          updatedBy: check.session.user.id,
          updatedAt: new Date(),
        },
      })
      .returning();

    return Response.json({ settings: updated });
  } catch (error) {
    console.error("Settings update error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
