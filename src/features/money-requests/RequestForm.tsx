"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { money } from "@/lib/format";

type Account = {
  accountNumber: string;
  type: string;
  balance: string;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-gold";

export default function RequestForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const selectedAccountNumber = useAppSelector(
    (state) => state.accounts.selectedAccountNumber,
  );

  const defaultAccount =
    selectedAccountNumber &&
    accounts.some((a) => a.accountNumber === selectedAccountNumber)
      ? selectedAccountNumber
      : (accounts[0]?.accountNumber ?? "");

  const [accountOverride, setAccountOverride] = useState<string | null>(null);
  const accountNumber = accountOverride ?? defaultAccount;

  const [type, setType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/money-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountNumber, type, amount, description }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not send the request.");
      return;
    }

    setSuccess("Request sent. It is waiting for approval.");
    setAmount("");
    setDescription("");
    router.refresh(); // reload the request list
  }

  if (accounts.length === 0) {
    return (
      <p className="rounded-xl bg-gold-soft px-4 py-3 text-sm text-primary">
        You have no active bank account yet.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-primary">Request</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-primary">Account</label>
          <select
            value={accountNumber}
            onChange={(e) => setAccountOverride(e.target.value)}
            className={inputClass}
          >
            {accounts.map((a) => (
              <option key={a.accountNumber} value={a.accountNumber}>
                {a.accountNumber} - ${money(a.balance)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-primary">Amount</label>
        <input
          type="text"
          inputMode="decimal"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
          placeholder="500.00"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-primary">
          Description (optional)
        </label>
        <input
          type="text"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Cash deposit"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send request"}
      </button>
    </form>
  );
}