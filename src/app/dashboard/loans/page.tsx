import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { loans } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { formatDate, money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export default async function CustomerLoansPage() {
  const session = await requireRole(["customer"]);

  const userLoans = await db
    .select()
    .from(loans)
    .where(eq(loans.userId, session.user.id))
    .orderBy(desc(loans.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Loan Applications
        </h1>
        <p className="text-sm text-muted">
          View your submitted loan applications, approval status, and schedules.
        </p>
      </div>

      {userLoans.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-12 text-center shadow-xs">
          <p className="text-base font-semibold text-primary">No active loans found</p>
          <p className="mt-1 text-sm text-muted">
            You currently have no submitted or active loan applications with Aurum Bank.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {userLoans.map((l) => (
            <div
              key={l.id}
              className="rounded-2xl border border-line bg-card p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted capitalize">
                  {l.type} Loan
                </span>
                <StatusBadge status={l.status} />
              </div>

              <div>
                <span className="text-xs text-muted">Requested Amount</span>
                <p className="text-3xl font-bold text-primary">
                  ${money(l.amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-line text-xs">
                <div>
                  <span className="text-muted block">Duration</span>
                  <span className="font-medium text-primary">{l.durationMonths} Months</span>
                </div>
                <div>
                  <span className="text-muted block">Monthly Income</span>
                  <span className="font-medium text-primary">${money(l.monthlyIncome)}</span>
                </div>
                <div>
                  <span className="text-muted block">Remaining Balance</span>
                  <span className="font-medium text-primary">${money(l.remainingBalance || "0.00")}</span>
                </div>
                <div>
                  <span className="text-muted block">Application Date</span>
                  <span className="font-medium text-primary">{formatDate(l.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
