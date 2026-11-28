"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

type Account = {
  accountNumber: string;
  type: string;
  balance: string;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-gold";

function money(value: string) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TransferForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const selectedAccountNumber = useAppSelector(
    (state) => state.accounts.selectedAccountNumber,
  );

  const defaultFrom =
    selectedAccountNumber &&
    accounts.some((a) => a.accountNumber === selectedAccountNumber)
      ? selectedAccountNumber
      : (accounts[0]?.accountNumber ?? "");

  const [fromOverride, setFromOverride] = useState<string | null>(null);
  const from = fromOverride ?? defaultFrom;

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  // one key per transfer attempt: a double click cannot send the money twice
  const [key, setKey] = useState(() => crypto.randomUUID());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromAccountNumber: from,
        toAccountNumber: to,
        amount,
        description,
        pin,
        idempotencyKey: key,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Transfer failed.");
      return;
    }

    setSuccess(`Transfer completed. Reference: ${data.transaction.txnRef}`);
    setTo("");
    setAmount("");
    setDescription("");
    setPin("");
    setKey(crypto.randomUUID()); // a new key for the next transfer
    router.refresh(); // reload the balances
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
      <div>
        <label className="text-sm font-medium text-primary">From account</label>
        <select
          value={from}
          onChange={(e) => setFromOverride(e.target.value)}
          className={inputClass}
        >
          {accounts.map((a) => (
            <option key={a.accountNumber} value={a.accountNumber}>
              {a.accountNumber} ({a.type}) - ${money(a.balance)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-primary">
          Recipient account number
        </label>
        <input
          type="text"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={inputClass}
          placeholder="AB-2001"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-primary">Amount</label>
          <input
            type="text"
            inputMode="decimal"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            placeholder="100.00"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-primary">
            Transaction PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className={inputClass}
            placeholder="4 digits"
          />
        </div>
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
          placeholder="Rent, gift, and so on"
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
        {loading ? "Sending..." : "Send money"}
      </button>
    </form>
  );
}