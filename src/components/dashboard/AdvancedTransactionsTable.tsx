"use client";

import { useState, useMemo } from "react";
import { money, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import {
  Search,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export type TransactionItem = {
  id: string;
  txnRef: string;
  type: string;
  amount: string;
  fee?: string | null;
  status: string;
  description?: string | null;
  flagged?: boolean;
  createdAt: string | Date;
};

type Props = {
  transactions: TransactionItem[];
  title?: string;
  subtitle?: string;
  pageSize?: number;
};

export default function AdvancedTransactionsTable({
  transactions,
  title = "Transaction Ledger",
  subtitle = "Search, filter, sort, and export records.",
  pageSize = 8,
}: Props) {
  // State for search and filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Search by Reference ID or description
      const matchesSearch =
        search === "" ||
        t.txnRef.toLowerCase().includes(search.toLowerCase()) ||
        (t.description &&
          t.description.toLowerCase().includes(search.toLowerCase()));

      // Filter by Type
      const matchesType =
        typeFilter === "all" || t.type.toLowerCase() === typeFilter.toLowerCase();

      // Filter by Status
      const matchesStatus =
        statusFilter === "all" ||
        t.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, search, typeFilter, statusFilter]);

  // 2. Sort transactions
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortField === "amount") {
        const diff = Number(a.amount) - Number(b.amount);
        return sortOrder === "asc" ? diff : -diff;
      } else {
        // Date sort
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }
    });
  }, [filtered, sortField, sortOrder]);

  // 3. Paginate
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // Handle Sort Toggle
  function toggleSort(field: "date" | "amount") {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  }

  // Handle CSV Download
  function downloadCSV() {
    if (sorted.length === 0) return;

    const headers = ["Reference ID", "Type", "Amount", "Status", "Description", "Date"];
    const rows = sorted.map((t) => [
      t.txnRef,
      t.type,
      t.amount,
      t.status,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      new Date(t.createdAt).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aurum-transactions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      {/* Table Header and Export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>

        <button
          onClick={downloadCSV}
          disabled={sorted.length === 0}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-xs font-semibold text-primary transition hover:border-gold disabled:opacity-50"
        >
          <Download size={14} />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Control Bar: Search, Type Filter, Status Filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-4 shadow-xs">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by Reference ID or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-line bg-page pl-9 pr-3 py-2 text-xs text-primary outline-none transition focus:border-gold"
          />
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-muted hidden sm:inline" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-line bg-page px-3 py-2 text-xs text-primary outline-none transition focus:border-gold"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="transfer">Transfer</option>
            <option value="loan_disbursement">Loan Disbursement</option>
            <option value="loan_repayment">Loan Repayment</option>
          </select>
        </div>

        {/* Filter by Status */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-line bg-page px-3 py-2 text-xs text-primary outline-none transition focus:border-gold"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="reversed">Reversed</option>
        </select>
      </div>

      {/* Table with interactive sorting */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-xs">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-line bg-page text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="px-5 py-3.5">Reference ID</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Description</th>
              <th className="px-5 py-3.5">
                <button
                  onClick={() => toggleSort("amount")}
                  className="inline-flex items-center gap-1 uppercase hover:text-primary"
                >
                  <span>Amount</span>
                  <ArrowUpDown size={12} />
                  {sortField === "amount" && (
                    <span className="text-[10px] lowercase text-gold">
                      ({sortOrder})
                    </span>
                  )}
                </button>
              </th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">
                <button
                  onClick={() => toggleSort("date")}
                  className="inline-flex items-center gap-1 uppercase hover:text-primary"
                >
                  <span>Date</span>
                  <ArrowUpDown size={12} />
                  {sortField === "date" && (
                    <span className="text-[10px] lowercase text-gold">
                      ({sortOrder})
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted">
                  No matching transactions found.
                </td>
              </tr>
            ) : (
              paginated.map((t) => (
                <tr key={t.id} className="hover:bg-page/50">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-primary">
                    {t.txnRef}
                  </td>
                  <td className="px-5 py-4 capitalize text-muted">
                    {t.type.replace("_", " ")}
                  </td>
                  <td className="px-5 py-4 text-primary max-w-xs truncate">
                    {t.description || "-"}
                  </td>
                  <td className="px-5 py-4 font-bold text-primary">
                    ${money(t.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-5 py-4 text-xs text-muted">
                    {formatDate(t.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Toolbar */}
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-muted">
          <span>
            Showing{" "}
            <strong>
              {sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentPage * pageSize, sorted.length)}
            </strong>{" "}
            of <strong>{sorted.length}</strong> transactions
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-page text-primary transition hover:border-gold disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-page text-primary transition hover:border-gold disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
