import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customerProfiles, user } from "@/db/schema";
import { requireApiRole } from "@/lib/session";

// PATCH /api/admin/users/[id]
// Allows Admin to update user status: "active" | "inactive" | "blocked"
// Also allows Staff/Admin to update KYC verification: "pending" | "verified" | "rejected"
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireApiRole(["admin", "staff"]);
  if (check.error) return check.error;

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    // 1. If updating user status (Admin only)
    if (body.status) {
      if (check.session.user.role !== "admin") {
        return Response.json({ error: "Only admins can change user status." }, { status: 403 });
      }

      const validStatuses = ["active", "inactive", "blocked"];
      if (!validStatuses.includes(body.status)) {
        return Response.json({ error: "Invalid status value." }, { status: 400 });
      }

      const [updated] = await db
        .update(user)
        .set({ status: body.status, updatedAt: new Date() })
        .where(eq(user.id, id))
        .returning();

      return Response.json({ user: updated });
    }

    // 2. If updating KYC verification status (Staff and Admin)
    if (body.verificationStatus) {
      const validKyc = ["pending", "verified", "rejected"];
      if (!validKyc.includes(body.verificationStatus)) {
        return Response.json({ error: "Invalid KYC status." }, { status: 400 });
      }

      const [profile] = await db
        .insert(customerProfiles)
        .values({
          userId: id,
          verificationStatus: body.verificationStatus,
          verifiedBy: check.session.user.id,
          verifiedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: customerProfiles.userId,
          set: {
            verificationStatus: body.verificationStatus,
            verifiedBy: check.session.user.id,
            verifiedAt: new Date(),
          },
        })
        .returning();

      return Response.json({ profile });
    }

    return Response.json({ error: "No valid action specified." }, { status: 400 });
  } catch (error) {
    console.error("User management error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
