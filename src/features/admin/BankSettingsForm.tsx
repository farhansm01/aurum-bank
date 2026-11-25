"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SettingsProps = {
  initialSettings: {
    dailyTransferLimit: string;
    maxSingleTransaction: string;
    minBalance: string;
    transferFee: string;
  };
};

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-page px-4 py-3 text-sm text-primary outline-none transition focus:border-gold";

export default function BankSettingsForm({ initialSettings }: SettingsProps) {
  const router = useRouter();
  const [dailyTransferLimit, setDailyLimit] = useState(
    initialSettings.dailyTransferLimit
  );
  const [maxSingleTransaction, setSingleMax] = useState(
    initialSettings.maxSingleTransaction
  );
  const [minBalance, setMinBalance] = useState(initialSettings.minBalance);
  const [transferFee, setTransferFee] = useState(initialSettings.transferFee);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dailyTransferLimit,
        maxSingleTransaction,
        minBalance,
        transferFee,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to update bank settings.");
      return;
    }

    setSuccess("Bank-wide financial parameters updated successfully.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Daily Transfer Limit ($)
          </label>
          <input
            type="text"
            required
            value={dailyTransferLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-muted">
            Maximum sum a customer can transfer within 24 hours.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Max Single Transaction ($)
          </label>
          <input
            type="text"
            required
            value={maxSingleTransaction}
            onChange={(e) => setSingleMax(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-muted">
            Ceiling for any individual money transfer.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Minimum Account Balance ($)
          </label>
          <input
            type="text"
            required
            value={minBalance}
            onChange={(e) => setMinBalance(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-muted">
            Mandatory reserve balance required in an active account.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-muted">
            Standard Transfer Fee ($)
          </label>
          <input
            type="text"
            required
            value={transferFee}
            onChange={(e) => setTransferFee(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-muted">
            Flat fee deducted per fund transfer operation.
          </p>
        </div>
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
        className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Saving Settings..." : "Save Bank Settings"}
      </button>
    </form>
  );
}
