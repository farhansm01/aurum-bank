"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAccounts } from "@/features/accounts/accountsSlice";
import { fetchTransactions } from "@/features/transactions/transactionsSlice";
import { fetchLoans } from "@/features/loans/loansSlice";
import { money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import SignOutButton from "@/components/SignOutButton";

export default function CustomerDashboardView({
  userName,
}: {
  userName: string;
}) {
  const dispatch = useAppDispatch();

  const { accounts, loading: accountsLoading } = useAppSelector(
    (state) => state.accounts
  );
  const { transactions, loading: txnsLoading } = useAppSelector(
    (state) => state.transactions
  );
  const { loans, loading: loansLoading } = useAppSelector(
    (state) => state.loans
  );

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions(undefined));
    dispatch(fetchLoans());
  }, [dispatch]);

  // Total balance across all customer accounts
  const totalBalance = accounts.reduce(
    (sum, a) => sum + Number(a.balance || 0),
    0
  );

  // Total deposits from transaction history
  const totalDeposits = transactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Total withdrawals from transaction history
  const totalWithdrawals = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Find active loans
  const activeLoans = loans.filter(
    (l) => l.status === "active" || l.status === "approved"
  );

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Hello, {userName}
          </h1>
          <p className="text-sm text-muted">
            Welcome to your Aurum Bank dashboard
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-muted font-medium">
            Total Balance
          </p>
          <p className="mt-2 text-2xl font-bold text-primary">
            ${money(totalBalance.toFixed(2))}
          </p>
          <p className="mt-1 text-xs text-muted">
            Across {accounts.length} account{accounts.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-muted font-medium">
            Total Deposits
          </p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            +${money(totalDeposits.toFixed(2))}
          </p>
          <p className="mt-1 text-xs text-muted">Completed deposits</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-muted font-medium">
            Total Withdrawals
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            -${money(totalWithdrawals.toFixed(2))}
          </p>
          <p className="mt-1 text-xs text-muted">Completed withdrawals</p>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/transfer"
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Send money
        </Link>
        <Link
          href="/dashboard/requests"
          className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-primary transition hover:border-gold"
        >
          Deposit and withdrawal
        </Link>
      </section>

      {/* Accounts List */}
      <section>
        <h2 className="text-lg font-bold text-primary mb-3">Your Accounts</h2>
        {accountsLoading && accounts.length === 0 ? (
          <p className="text-sm text-muted">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">
            No bank accounts found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-medium text-muted">
                    {a.type} Account
                  </span>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-2 text-xl font-bold text-primary">
                  ${money(a.balance)}
                </p>
                <p className="mt-1 text-xs text-muted font-mono">
                  {a.accountNumber}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section>
        <h2 className="text-lg font-bold text-primary mb-3">
          Recent Transactions
        </h2>
        {txnsLoading && transactions.length === 0 ? (
          <p className="text-sm text-muted">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">
            No transactions yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs text-muted uppercase">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-page/50">
                    <td className="px-4 py-3 font-mono text-xs text-primary font-medium">
                      {t.txnRef}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">
                      {t.type.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 font-medium text-primary">
                      ${money(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Active Loans */}
      <section>
        <h2 className="text-lg font-bold text-primary mb-3">Active Loans</h2>
        {loansLoading && loans.length === 0 ? (
          <p className="text-sm text-muted">Loading loans...</p>
        ) : activeLoans.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">
            No active loans at this time.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeLoans.map((l) => (
              <div
                key={l.id}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-medium text-muted capitalize">
                    {l.type} Loan
                  </span>
                  <StatusBadge status={l.status} />
                </div>
                <p className="mt-2 text-xl font-bold text-primary">
                  ${money(l.amount)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Remaining: ${money(l.remainingBalance || "0.00")} | Duration:{" "}
                  {l.durationMonths} months
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
