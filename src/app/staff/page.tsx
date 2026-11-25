import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { customerProfiles, loans, moneyRequests, transactions, user } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { formatDate, money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import {
  FileCheck2,
  Users,
  History,
  FileClock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default async function StaffDashboardPage() {
  const session = await requireRole(["staff"]);

  // 1. Pending Money Requests
  const [pendingReqs] = await db
    .select({ count: sql<number>`count(*)` })
    .from(moneyRequests)
    .where(eq(moneyRequests.status, "pending"));

  // 2. Pending KYC Verifications
  const [pendingKycs] = await db
    .select({ count: sql<number>`count(*)` })
    .from(customerProfiles)
    .where(eq(customerProfiles.verificationStatus, "pending"));

  // 3. Loan Applications for Review
  const [pendingLoans] = await db
    .select({ count: sql<number>`count(*)` })
    .from(loans)
    .where(sql`${loans.status} in ('pending', 'under_review')`);

  // 4. Total Customers
  const [totalCusts] = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(eq(user.role, "customer"));

  // Latest customer requests for quick review
  const recentRequests = await db
    .select({
      id: moneyRequests.id,
      type: moneyRequests.type,
      amount: moneyRequests.amount,
      status: moneyRequests.status,
      description: moneyRequests.description,
      createdAt: moneyRequests.createdAt,
      requestedBy: user.name,
    })
    .from(moneyRequests)
    .innerJoin(user, eq(moneyRequests.requestedBy, user.id))
    .where(eq(moneyRequests.status, "pending"))
    .orderBy(desc(moneyRequests.createdAt))
    .limit(5);

  const kpis = [
    {
      label: "Pending Money Requests",
      value: Number(pendingReqs?.count || 0),
      sub: "Deposit & withdrawal approvals",
      icon: FileCheck2,
      color: "bg-amber-50 text-amber-700",
      href: "/staff/requests",
    },
    {
      label: "Pending KYC Verifications",
      value: Number(pendingKycs?.count || 0),
      sub: "Customer identities to verify",
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-700",
      href: "/staff/customers",
    },
    {
      label: "Loan Applications",
      value: Number(pendingLoans?.count || 0),
      sub: "Awaiting staff review & notes",
      icon: FileClock,
      color: "bg-purple-50 text-purple-700",
      href: "/staff/loans",
    },
    {
      label: "Bank Customers",
      value: Number(totalCusts?.count || 0),
      sub: "Active customer accounts",
      icon: Users,
      color: "bg-green-50 text-green-700",
      href: "/staff/customers",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Staff Operations Portal
          </h1>
          <p className="text-sm text-muted">
            Welcome, {session.user.name}. Review pending customer submissions and transactions.
          </p>
        </div>
      </div>

      {/* Staff Action KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link
              key={k.label}
              href={k.href}
              className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-xs transition hover:border-gold/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {k.label}
                  </span>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${k.color}`}
                  >
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-primary">{k.value}</p>
              </div>
              <p className="mt-2 text-xs text-muted">{k.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Requests Queue */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-primary">Requests Awaiting Review</h2>
            <p className="text-xs text-muted">Review queue for deposits & withdrawals</p>
          </div>
          <Link
            href="/staff/requests"
            className="text-xs font-semibold text-gold hover:underline inline-flex items-center gap-1"
          >
            <span>Open review queue</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs font-semibold uppercase text-muted">
              <tr>
                <th className="pb-3">Applicant</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Requested At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    No pending requests in the review queue.
                  </td>
                </tr>
              ) : (
                recentRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-page/50">
                    <td className="py-3.5 font-medium text-primary">
                      {r.requestedBy}
                    </td>
                    <td className="py-3.5 capitalize text-muted">{r.type}</td>
                    <td className="py-3.5 font-bold text-primary">
                      ${money(r.amount)}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 text-xs text-muted">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
