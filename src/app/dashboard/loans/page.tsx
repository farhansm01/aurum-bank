import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { bankAccounts, loans } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { formatDate, money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import LoanApplicationForm from "@/features/loans/LoanApplicationForm";
import { ArrowRight } from "lucide-react";

export default async function CustomerLoansPage() {
  const session = await requireRole(["customer"]);

  // 1. Fetch customer's active bank accounts to receive funds
  const accounts = await db
    .select({
      accountNumber: bankAccounts.accountNumber,
      type: bankAccounts.type,
      balance: bankAccounts.balance,
    })
    .from(bankAccounts)
    .where(
      and(
        eq(bankAccounts.userId, session.user.id),
        eq(bankAccounts.status, "active")
      )
    )
    .orderBy(bankAccounts.accountNumber);

  // 2. Fetch customer's loan applications
  const userLoans = await db
    .select()
    .from(loans)
    .where(eq(loans.userId, session.user.id))
    .orderBy(desc(loans.createdAt));

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Loan Services
        </h1>
        <p className="text-sm text-muted">
          Apply for personal, business, or education financing and track your approval status.
        </p>
      </div>

      {/* Application Form */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8 max-w-2xl">
        <h2 className="text-lg font-bold text-primary mb-4">
          Apply for a New Loan
        </h2>
        <LoanApplicationForm accounts={accounts} />
      </div>

      {/* Existing Loan Applications */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary">
          My Loan Applications & Active Loans
        </h2>
        {userLoans.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card p-8 text-center text-sm text-muted">
            You have no active loans or applications on record.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {userLoans.map((l) => (
              <div
                key={l.id}
                className="flex flex-col justify-between rounded-2xl border border-line bg-card p-6 shadow-xs space-y-4 transition hover:border-gold/50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-muted capitalize">
                      {l.type} Loan
                    </span>
                    <StatusBadge status={l.status} />
                  </div>

                  <div>
                    <span className="text-xs text-muted">Amount</span>
                    <p className="text-3xl font-bold text-primary">
                      ${money(l.amount)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-line text-xs">
                    <div>
                      <span className="text-muted block">Duration</span>
                      <span className="font-semibold text-primary">
                        {l.durationMonths} Months
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block">Monthly Income</span>
                      <span className="font-semibold text-primary">
                        ${money(l.monthlyIncome)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block">Remaining Balance</span>
                      <span className="font-semibold text-primary">
                        ${money(l.remainingBalance || "0.00")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block">Submitted</span>
                      <span className="font-semibold text-primary">
                        {formatDate(l.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-line">
                  <Link
                    href={`/dashboard/loans/${l.id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-page py-2 text-xs font-semibold text-primary transition hover:border-gold hover:text-gold"
                  >
                    <span>View Schedule & Repay</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
