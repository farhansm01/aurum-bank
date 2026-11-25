import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { customerProfiles, user } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export default async function AdminCustomersPage() {
  await requireRole(["admin"]);

  const customers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      phone: customerProfiles.phone,
      address: customerProfiles.address,
      verificationStatus: customerProfiles.verificationStatus,
    })
    .from(user)
    .leftJoin(customerProfiles, eq(user.id, customerProfiles.userId))
    .where(eq(user.role, "customer"))
    .orderBy(desc(user.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Customer Management
        </h1>
        <p className="text-sm text-muted">
          View all registered customers, contact profiles, and verification status.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-xs">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-line bg-page text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="px-5 py-3.5">Customer Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">KYC Verification</th>
              <th className="px-5 py-3.5">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-page/50">
                  <td className="px-5 py-4 font-semibold text-primary">
                    {c.name}
                  </td>
                  <td className="px-5 py-4 text-muted">{c.email}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={c.verificationStatus || "pending"} />
                  </td>
                  <td className="px-5 py-4 text-xs text-muted">
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
