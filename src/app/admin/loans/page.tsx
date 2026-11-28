import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { bankAccounts, loans, user } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import AdminLoanReviewButtons from "@/features/loans/AdminLoanReviewButtons";
import { ArrowRight } from "lucide-react";

export default async function AdminLoansPage() {
  await requireRole(["admin"]);

  const allLoans = await db
    .select({
      id: loans.id,
      type: loans.type,
      amount: loans.amount,
      durationMonths: loans.durationMonths,
      monthlyIncome: loans.monthlyIncome,
      employmentStatus: loans.employmentStatus,
      status: loans.status,
      createdAt: loans.createdAt,
      applicantName: user.name,
      applicantEmail: user.email,
      accountNumber: bankAccounts.accountNumber,
    })
    .from(loans)
    .innerJoin(user, eq(loans.userId, user.id))
    .innerJoin(bankAccounts, eq(loans.accountId, bankAccounts.id))
    .orderBy(desc(loans.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Loan Management
        </h1>
        <p className="text-sm text-muted">
          Review, approve (with instant fund disbursement), or reject loan applications.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-xs">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line bg-page text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="px-5 py-3.5">Applicant</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Amount</th>
              <th className="px-5 py-3.5">Duration</th>
              <th className="px-5 py-3.5">Monthly Income</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Decision</th>
              <th className="px-5 py-3.5">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {allLoans.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-muted">
                  No loan applications found in the system.
                </td>
              </tr>
            ) : (
              allLoans.map((l) => (
                <tr key={l.id} className="hover:bg-page/50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-primary">{l.applicantName}</p>
                    <p className="text-xs text-muted">{l.applicantEmail}</p>
                  </td>
                  <td className="px-5 py-4 capitalize text-muted">{l.type}</td>
                  <td className="px-5 py-4 font-bold text-primary">
                    ${money(l.amount)}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted">
                    {l.durationMonths} Mo
                  </td>
                  <td className="px-5 py-4 text-xs text-muted">
                    ${money(l.monthlyIncome)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-5 py-4">
                    {l.status === "pending" || l.status === "under_review" ? (
                      <AdminLoanReviewButtons loanId={l.id} />
                    ) : (
                      <span className="text-xs text-muted">Decided</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/loans/${l.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
                    >
                      <span>Schedule</span>
                      <ArrowRight size={12} />
                    </Link>
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
