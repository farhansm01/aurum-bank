"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAccounts, setSelectedAccount } from "@/features/accounts/accountsSlice";
import { fetchTransactions } from "@/features/transactions/transactionsSlice";
import { fetchLoans } from "@/features/loans/loansSlice";
import { money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import { CustomerSpendingChart, CustomerTxnDistChart } from "@/components/dashboard/CustomerCharts";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wallet, CheckCircle2 } from "lucide-react";

export default function CustomerOverviewPage({ userName }: { userName: string }) {
  const dispatch = useAppDispatch();

  const { accounts, selectedAccountNumber, loading: accountsLoading } = useAppSelector(
    (state) => state.accounts,
  );
  const { transactions, loading: txnsLoading } = useAppSelector((state) => state.transactions);
  const { loans } = useAppSelector((state) => state.loans);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchLoans());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTransactions(selectedAccountNumber));
  }, [dispatch, selectedAccountNumber]);

  const selectedAccount = selectedAccountNumber
    ? accounts.find((a) => a.accountNumber === selectedAccountNumber)
    : null;

  const totalBalance = selectedAccount
    ? Number(selectedAccount.balance || 0)
    : accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  const totalDeposits = selectedAccount
    ? transactions
        .filter(
          (t) =>
            t.type === "deposit" &&
            t.status === "completed" &&
            t.receiverAccountId === selectedAccount.id,
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    : transactions
        .filter((t) => t.type === "deposit" && t.status === "completed")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalWithdrawals = selectedAccount
    ? transactions
        .filter(
          (t) =>
            t.type === "withdrawal" &&
            t.status === "completed" &&
            t.senderAccountId === selectedAccount.id,
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    : transactions
        .filter((t) => t.type === "withdrawal" && t.status === "completed")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const activeLoans = loans.filter((l) => l.status === "active" || l.status === "approved");
  const totalRemainingLoanBalance = activeLoans.reduce(
    (sum, l) => sum + Number(l.remainingBalance || 0),
    0,
  );

  // Chart data: customer spending history
  // Money moved between customer's own accounts is not spending when All accounts is selected.
  // When one account is selected, it is an outflow for that account.
  const myAccountIds = new Set(accounts.map((a) => a.id));

  const spendingChartData = transactions
    .filter((t) => {
      if (t.status !== "completed") return false;

      if (selectedAccount) {
        if (t.senderAccountId !== selectedAccount.id) return false;
        return t.type === "withdrawal" || t.type === "transfer" || t.type === "loan_repayment";
      } else {
        if (t.type === "withdrawal" || t.type === "loan_repayment") return true;
        if (t.type === "transfer") {
          const isFromMe = t.senderAccountId ? myAccountIds.has(t.senderAccountId) : false;
          const isToMe = t.receiverAccountId ? myAccountIds.has(t.receiverAccountId) : false;
          return isFromMe && !isToMe;
        }
        return false;
      }
    })
    .slice(0, 7)
    .map((t) => ({
      date: new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      spending: Number(t.amount || 0),
    }))
    .reverse();

  // Chart data: transaction type distribution
  const typeCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    const key = t.type.replace("_", " ");
    typeCounts[key] = (typeCounts[key] || 0) + 1;
  });

  const txnDistData = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Welcome back, {userName}
          </h1>
          <p className="text-sm text-muted">
            Here is what is happening with your bank accounts today.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2.5 pt-2 sm:pt-0">
          <Link
            href="/dashboard/transfer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            <ArrowLeftRight size={16} />
            <span>Send Money</span>
          </Link>
          <Link
            href="/dashboard/requests"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-medium text-primary transition hover:border-gold"
          >
            <Wallet size={16} />
            <span>Deposit / Withdraw</span>
          </Link>
        </div>
      </div>

      {/* Account Switcher: hidden if customer has 1 or 0 accounts */}
      {accounts.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted shrink-0 mr-1">
            Account:
          </span>
          <button
            type="button"
            onClick={() => dispatch(setSelectedAccount(null))}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition shrink-0 ${
              selectedAccountNumber === null
                ? "bg-primary text-white shadow-xs"
                : "border border-line bg-card text-muted hover:border-gold hover:text-primary"
            }`}
          >
            All accounts
          </button>
          {accounts.map((a) => (
            <button
              key={a.accountNumber}
              type="button"
              onClick={() => dispatch(setSelectedAccount(a.accountNumber))}
              className={`rounded-full px-4 py-1.5 text-xs font-medium font-mono transition shrink-0 ${
                selectedAccountNumber === a.accountNumber
                  ? "bg-primary text-white shadow-xs"
                  : "border border-line bg-card text-muted hover:border-gold hover:text-primary"
              }`}
            >
              {a.accountNumber}
            </button>
          ))}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {selectedAccount ? `${selectedAccount.accountNumber} Balance` : "Total Balance"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-soft text-gold">
              <Wallet size={16} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-primary">
            ${money(totalBalance.toFixed(2))}
          </p>
          <p className="mt-1 text-xs text-muted">
            {selectedAccount
              ? `${selectedAccount.type.toUpperCase()} account (${selectedAccount.status})`
              : `Across ${accounts.length} active account${accounts.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Total Deposits
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-700">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-green-700">
            +${money(totalDeposits.toFixed(2))}
          </p>
          <p className="mt-1 text-xs text-muted">
            {selectedAccount
              ? `Deposits to ${selectedAccount.accountNumber}`
              : "Completed deposit transactions"}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Total Withdrawals
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-700">
            -${money(totalWithdrawals.toFixed(2))}
          </p>
          <p className="mt-1 text-xs text-muted">
            {selectedAccount
              ? `Withdrawals from ${selectedAccount.accountNumber}`
              : "Completed withdrawal transactions"}
          </p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-primary">Outflow & Spending Trend</h2>
            <p className="text-xs text-muted">
              {selectedAccount
                ? `Outflows and debit expenditures for ${selectedAccount.accountNumber}`
                : "Recent transfer and withdrawal expenditures"}
            </p>
          </div>
          {txnsLoading ? (
            <div className="flex h-60 items-center justify-center text-sm text-muted animate-pulse">
              Loading trends...
            </div>
          ) : (
            <CustomerSpendingChart data={spendingChartData} />
          )}
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-primary">Transaction Distribution</h2>
            <p className="text-xs text-muted">
              {selectedAccount
                ? `Breakdown for ${selectedAccount.accountNumber}`
                : "Breakdown of your ledger activities"}
            </p>
          </div>
          {txnsLoading ? (
            <div className="flex h-60 items-center justify-center text-sm text-muted animate-pulse">
              Loading distribution...
            </div>
          ) : (
            <CustomerTxnDistChart data={txnDistData} />
          )}
        </div>
      </div>

      {/* Accounts Glance */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">My Bank Accounts</h2>
          <Link
            href="/dashboard/accounts"
            className="text-xs font-medium text-gold hover:underline"
          >
            View details &rarr;
          </Link>
        </div>

        {accountsLoading && accounts.length === 0 ? (
          <p className="text-sm text-muted">Loading your accounts...</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-muted">No accounts found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => {
              const isSelected = selectedAccountNumber === a.accountNumber;
              return (
                <div
                  key={a.id}
                  onClick={() =>
                    dispatch(setSelectedAccount(isSelected ? null : a.accountNumber))
                  }
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    isSelected
                      ? "border-gold bg-gold-soft/30 ring-2 ring-gold/30 shadow-xs"
                      : "border-line bg-page hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-muted">
                      {a.type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
                          <CheckCircle2 size={10} />
                          Active Filter
                        </span>
                      )}
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-primary">
                    ${money(a.balance)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {a.accountNumber}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions Preview */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">Recent Activity</h2>
          <Link
            href="/dashboard/transactions"
            className="text-xs font-medium text-gold hover:underline"
          >
            View all transactions &rarr;
          </Link>
        </div>

        {txnsLoading && transactions.length === 0 ? (
          <p className="text-sm text-muted animate-pulse">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs font-semibold uppercase text-muted">
                <tr>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-page/50">
                    <td className="py-3 font-mono text-xs font-medium text-primary">
                      {t.txnRef}
                    </td>
                    <td className="py-3 capitalize text-muted">
                      {t.type.replace("_", " ")}
                    </td>
                    <td className="py-3 font-semibold text-primary">
                      ${money(t.amount)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 text-xs text-muted">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Loans Preview */}
      {activeLoans.length > 0 && (
        <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-primary">Active Loans ({activeLoans.length})</h2>
              <p className="text-xs text-muted">
                Total outstanding balance: <strong className="text-amber-700">${money(totalRemainingLoanBalance.toFixed(2))}</strong>
              </p>
            </div>
            <Link
              href="/dashboard/loans"
              className="text-xs font-medium text-gold hover:underline"
            >
              Loan details &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeLoans.map((l) => (
              <Link
                key={l.id}
                href={`/dashboard/loans/${l.id}`}
                className="rounded-xl border border-line bg-page p-4 transition hover:border-gold/50 block"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-muted capitalize">
                    {l.type} Loan
                  </span>
                  <StatusBadge status={l.status} />
                </div>
                <p className="mt-2 text-2xl font-bold text-primary">
                  ${money(l.amount)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Remaining balance: ${money(l.remainingBalance || "0.00")} - Duration: {l.durationMonths}m
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
