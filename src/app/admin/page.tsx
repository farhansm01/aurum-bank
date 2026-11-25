import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts, loans, moneyRequests, transactions, user } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { formatDate, money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import { AdminVolumeChart, AdminAccountDistChart } from "@/components/dashboard/AdminCharts";
import {
  Users,
  Wallet,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  FileClock,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await requireRole(["admin"]);

  // 1. Total Registered Customers
  const [custCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(eq(user.role, "customer"));

  // 2. Total Bank Accounts
  const [acctCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bankAccounts);

  // 3. Total Bank Balance
  const [balSum] = await db
    .select({ total: sql<string>`coalesce(sum(${bankAccounts.balance}), 0)` })
    .from(bankAccounts);

  // 4. Total Deposits
  const [depSum] = await db
    .select({ total: sql<string>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(sql`${transactions.type} = 'deposit' and ${transactions.status} = 'completed'`);

  // 5. Total Withdrawals
  const [withSum] = await db
    .select({ total: sql<string>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(sql`${transactions.type} = 'withdrawal' and ${transactions.status} = 'completed'`);

  // 6. Total Transactions Count
  const [txnCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions);

  // 7. Pending Loan Applications Count
  const [pendingLoansCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(loans)
    .where(sql`${loans.status} in ('pending', 'under_review')`);

  // 8. Pending Money Requests Count
  const [pendingRequestsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(moneyRequests)
    .where(eq(moneyRequests.status, "pending"));

  // 9. Account Distribution data for pie chart
  const accountTypesRows = await db
    .select({
      type: bankAccounts.type,
      count: sql<number>`count(*)`,
    })
    .from(bankAccounts)
    .groupBy(bankAccounts.type);

  const accountDistData = accountTypesRows.map((r) => ({
    name: `${r.type.charAt(0).toUpperCase() + r.type.slice(1)} Accounts`,
    value: Number(r.count),
  }));

  // 10. Volume Comparison data
  const volumeData = [
    {
      month: "Total Inflow / Outflow",
      deposits: Number(depSum?.total || 0),
      withdrawals: Number(withSum?.total || 0),
    },
  ];

  // Recent system-wide transactions
  const recentTxns = await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(6);

  const stats = [
    {
      label: "Registered Customers",
      value: Number(custCount?.count || 0).toLocaleString(),
      sub: "Total active bank clients",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/customers",
    },
    {
      label: "Bank Accounts",
      value: Number(acctCount?.count || 0).toLocaleString(),
      sub: "Savings, current & business",
      icon: Wallet,
      color: "bg-indigo-50 text-indigo-600",
      href: "/admin/accounts",
    },
    {
      label: "Total Bank Liquidity",
      value: `$${money(String(balSum?.total || "0"))}`,
      sub: "Cumulative deposits in bank",
      icon: Landmark,
      color: "bg-gold-soft text-gold",
      href: "/admin/accounts",
    },
    {
      label: "Total Deposits",
      value: `+$${money(String(depSum?.total || "0"))}`,
      sub: "Completed deposits",
      icon: ArrowDownLeft,
      color: "bg-green-50 text-green-700",
      href: "/admin/requests",
    },
    {
      label: "Total Withdrawals",
      value: `-$${money(String(withSum?.total || "0"))}`,
      sub: "Completed withdrawals",
      icon: ArrowUpRight,
      color: "bg-amber-50 text-amber-700",
      href: "/admin/requests",
    },
    {
      label: "Total Transactions",
      value: Number(txnCount?.count || 0).toLocaleString(),
      sub: "All completed & pending",
      icon: History,
      color: "bg-slate-100 text-slate-700",
      href: "/admin/requests",
    },
    {
      label: "Pending Loans",
      value: Number(pendingLoansCount?.count || 0).toLocaleString(),
      sub: "Awaiting review/decision",
      icon: FileClock,
      color: "bg-purple-50 text-purple-700",
      href: "/admin/loans",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Executive Analytics Overview
          </h1>
          <p className="text-sm text-muted">
            Live operational metrics and system overview for Administrator {session.user.name}.
          </p>
        </div>

        {Number(pendingRequestsCount?.count || 0) > 0 && (
          <Link
            href="/admin/requests"
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-600"
          >
            <span>{pendingRequestsCount.count} Requests Pending Review</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-xs transition hover:border-gold/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {s.label}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-primary">{s.value}</p>
              </div>
              <p className="mt-2 text-xs text-muted">{s.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-primary">Transaction Volume: Deposits vs Withdrawals</h2>
            <p className="text-xs text-muted">Total capital flow through the banking engine</p>
          </div>
          <AdminVolumeChart data={volumeData} />
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-primary">Account Distribution</h2>
            <p className="text-xs text-muted">Breakdown of customer account types</p>
          </div>
          <AdminAccountDistChart data={accountDistData} />
        </div>
      </div>

      {/* Recent Ledger Activity */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">Live Transaction Stream</h2>
          <span className="text-xs text-muted">Latest 6 events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs font-semibold uppercase text-muted">
              <tr>
                <th className="pb-3">Reference</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentTxns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recentTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-page/50">
                    <td className="py-3.5 font-mono text-xs font-medium text-primary">
                      {t.txnRef}
                    </td>
                    <td className="py-3.5 capitalize text-muted">
                      {t.type.replace("_", " ")}
                    </td>
                    <td className="py-3.5 font-bold text-primary">
                      ${money(t.amount)}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 text-xs text-muted">
                      {formatDate(t.createdAt)}
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
