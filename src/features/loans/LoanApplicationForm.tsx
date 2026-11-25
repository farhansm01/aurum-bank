"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";

type Account = {
  accountNumber: string;
  type: string;
  balance: string;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-page px-4 py-3 text-sm text-primary outline-none transition focus:border-gold";

export default function LoanApplicationForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState(accounts[0]?.accountNumber ?? "");
  const [type, setType] = useState("personal");
  const [amount, setAmount] = useState("");
  const [durationMonths, setDurationMonths] = useState("12");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("employed");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNumber,
        type,
        amount,
        durationMonths: Number(durationMonths),
        monthlyIncome,
        employmentStatus,
        description,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to submit loan application.");
      return;
    }

    setSuccess("Your loan application has been submitted and is under review.");
    setAmount("");
    setMonthlyIncome("");
    setDescription("");
    router.refresh();
  }

  if (accounts.length === 0) {
    return (
      <p className="rounded-xl bg-gold-soft p-4 text-sm text-primary">
        You need an active bank account to receive loan funds.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Loan Category
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            <option value="personal">Personal Loan</option>
            <option value="home">Home / Mortgage</option>
            <option value="car">Car / Auto Loan</option>
            <option value="education">Education Loan</option>
            <option value="business">Business Expansion</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Disbursement Account
          </label>
          <select
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className={inputClass}
          >
            {accounts.map((a) => (
              <option key={a.accountNumber} value={a.accountNumber}>
                {a.accountNumber} ({a.type}) - ${money(a.balance)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Requested Amount ($)
          </label>
          <input
            type="text"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            placeholder="5000.00"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Duration (Months)
          </label>
          <select
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
            className={inputClass}
          >
            <option value="6">6 Months</option>
            <option value="12">12 Months (1 Year)</option>
            <option value="24">24 Months (2 Years)</option>
            <option value="36">36 Months (3 Years)</option>
            <option value="60">60 Months (5 Years)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Monthly Income ($)
          </label>
          <input
            type="text"
            required
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className={inputClass}
            placeholder="3500.00"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Employment Status
          </label>
          <select
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
            className={inputClass}
          >
            <option value="employed">Employed (Full-time)</option>
            <option value="self_employed">Self-Employed / Freelance</option>
            <option value="business_owner">Business Owner</option>
            <option value="student">Student</option>
            <option value="unemployed">Unemployed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase text-muted">
          Loan Purpose / Details
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Brief description of the loan purpose..."
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 font-medium">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700 font-medium">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Submitting Application..." : "Submit Loan Application"}
      </button>
    </form>
  );
}
