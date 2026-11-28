"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import RepayModal from "./RepayModal";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

type LoanDetail = {
  id: string;
  type: string;
  amount: string;
  durationMonths: number;
  monthlyIncome: string;
  employmentStatus: string;
  description: string | null;
  status: string;
  interestRate: string | null;
  monthlyPayment: string | null;
  remainingBalance: string;
  createdAt: Date;
  reviewedAt: Date | null;
  accountNumber: string;
  accountType: string;
  applicantName: string;
  applicantEmail: string;
};

type Installment = {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: Date;
  amount: string;
  status: string;
  paidAt: Date | null;
  transactionId: string | null;
};

type RepaymentTxn = {
  id: string;
  txnRef: string;
  amount: string;
  status: string;
  createdAt: Date;
  fromAccountNumber?: string | null;
};

type Account = {
  accountNumber: string;
  type: string;
  balance: string;
};

type Props = {
  detail: {
    loan: LoanDetail;
    installments: Installment[];
    repaymentTransactions: RepaymentTxn[];
    disbursementTransaction: {
      id: string;
      txnRef: string;
      amount: string;
      status: string;
      createdAt: Date;
    } | null;
  };
  backHref: string;
  canRepay?: boolean;
  customerAccounts?: Account[];
};

export default function LoanDetailView({
  detail,
  backHref,
  canRepay = false,
  customerAccounts = [],
}: Props) {
  const { loan, installments, repaymentTransactions, disbursementTransaction } =
    detail;
  const [modalOpen, setModalOpen] = useState(false);

  // Find next due installment
  const nextDue = installments.find((inst) => inst.status === "due");

  // Calculate total schedule amount and paid amount
  const totalScheduleAmount = installments.reduce(
    (sum, inst) => sum + Number(inst.amount),
    0
  );
  const totalPaidAmount = installments
    .filter((inst) => inst.status === "paid")
    .reduce((sum, inst) => sum + Number(inst.amount), 0);

  const progressPercent =
    totalScheduleAmount > 0
      ? Math.min(100, Math.round((totalPaidAmount / totalScheduleAmount) * 100))
      : 0;

  const now = new Date();

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back button and title */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition mb-3"
        >
          <ArrowLeft size={14} />
          <span>Back to loans</span>
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold text-primary capitalize">
                {loan.type} Loan Overview
              </h1>
              <StatusBadge status={loan.status} />
            </div>
            <p className="mt-1 text-xs text-muted">
              Applicant: <strong className="text-primary">{loan.applicantName}</strong> ({loan.applicantEmail}) | Account:{" "}
              <span className="font-mono text-primary font-semibold">
                {loan.accountNumber}
              </span>
            </p>
          </div>

          {canRepay && loan.status === "active" && nextDue && (
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-primary/90"
            >
              Pay next installment (${money(nextDue.amount)})
            </button>
          )}
        </div>
      </div>

      {/* Summary Card with Progress Bar */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-xs font-semibold uppercase text-muted">
              Principal Disbursed
            </span>
            <p className="mt-1 text-2xl font-bold text-primary">
              ${money(loan.amount)}
            </p>
            <p className="text-[11px] text-muted">
              Interest Rate: {loan.interestRate ?? "0.00"}%
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-muted">
              Monthly Payment
            </span>
            <p className="mt-1 text-2xl font-bold text-primary">
              ${money(loan.monthlyPayment || "0.00")}
            </p>
            <p className="text-[11px] text-muted">
              Duration: {loan.durationMonths} Months
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-muted">
              Remaining Balance
            </span>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              ${money(loan.remainingBalance)}
            </p>
            <p className="text-[11px] text-muted">Total outstanding debt</p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-muted">
              Total Repaid
            </span>
            <p className="mt-1 text-2xl font-bold text-green-700">
              ${money(totalPaidAmount.toFixed(2))}
            </p>
            <p className="text-[11px] text-muted">
              {progressPercent}% of schedule cleared
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-medium text-muted mb-1.5">
            <span>Repayment Progress</span>
            <span>
              ${money(totalPaidAmount.toFixed(2))} / ${money(totalScheduleAmount.toFixed(2))} ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-page overflow-hidden border border-line">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {disbursementTransaction && (
          <div className="rounded-xl bg-page p-3 text-xs text-muted flex flex-wrap items-center justify-between gap-2 border border-line">
            <span>
              Disbursement Transaction Ref:{" "}
              <strong className="font-mono text-primary">
                {disbursementTransaction.txnRef}
              </strong>
            </span>
            <span>{formatDate(disbursementTransaction.createdAt)}</span>
          </div>
        )}
      </div>

      {/* Repayment Schedule Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary">Repayment Schedule</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-xs">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Installment Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {installments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted">
                    No schedule generated yet. Schedule is created upon loan approval.
                  </td>
                </tr>
              ) : (
                installments.map((inst) => {
                  const isOverdue =
                    inst.status === "due" && new Date(inst.dueDate) < now;

                  return (
                    <tr key={inst.id} className="hover:bg-page/50">
                      <td className="px-5 py-3.5 font-bold text-primary text-xs">
                        {inst.installmentNumber}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted">
                        {new Date(inst.dueDate).toLocaleDateString("en-GB", {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-primary">
                        ${money(inst.amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            <AlertCircle size={12} />
                            <span>Overdue</span>
                          </span>
                        ) : inst.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <CheckCircle2 size={12} />
                            <span>Paid</span>
                          </span>
                        ) : (
                          <StatusBadge status={inst.status} />
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted">
                        {inst.paidAt ? formatDate(inst.paidAt) : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repayment History Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary">Repayment History</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-xs">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3.5">Reference ID</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Amount Paid</th>
                <th className="px-5 py-3.5">Paid From Account</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {repaymentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted">
                    No repayment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                repaymentTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-page/50">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-primary">
                      {txn.txnRef}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted">
                      {formatDate(txn.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-primary">
                      ${money(txn.amount)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted">
                      {txn.fromAccountNumber || "Account"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={txn.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repay Modal */}
      {canRepay && nextDue && (
        <RepayModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          loanId={loan.id}
          installmentNumber={nextDue.installmentNumber}
          installmentAmount={nextDue.amount}
          accounts={customerAccounts}
        />
      )}
    </div>
  );
}
