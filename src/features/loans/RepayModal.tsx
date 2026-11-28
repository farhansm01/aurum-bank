"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";
import { X } from "lucide-react";

type Account = {
  accountNumber: string;
  type: string;
  balance: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  loanId: string;
  installmentNumber: number;
  installmentAmount: string;
  accounts: Account[];
};

export default function RepayModal({
  open,
  onClose,
  loanId,
  installmentNumber,
  installmentAmount,
  accounts,
}: Props) {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState(
    accounts[0]?.accountNumber ?? ""
  );
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  // Escape key closes modal when not loading
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  function handleClose() {
    if (loading) return;
    setError("");
    setPin("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be 4 digits.");
      return;
    }
    if (!selectedAccount) {
      setError("Please select a payment account.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/loans/${loanId}/repay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountNumber: selectedAccount,
          pin,
          idempotencyKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Loan repayment failed.");
        return;
      }

      // Success: generate new key for next attempt, close and refresh
      setIdempotencyKey(crypto.randomUUID());
      setPin("");
      onClose();
      router.refresh();
    } catch {
      setError("Network or server error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="repay-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <h2
            id="repay-modal-title"
            className="font-heading text-xl font-bold text-primary"
          >
            Pay Installment #{installmentNumber}
          </h2>
          <button
            type="button"
            disabled={loading}
            onClick={handleClose}
            className="text-muted hover:text-primary transition disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-3 text-sm text-muted">
          Amount due:{" "}
          <strong className="text-primary font-bold">
            ${money(installmentAmount)}
          </strong>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-muted">
              Pay from Account
            </label>
            <select
              value={selectedAccount}
              disabled={loading}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-page px-4 py-3 text-sm text-primary outline-none transition focus:border-gold disabled:opacity-50"
            >
              {accounts.map((a) => (
                <option key={a.accountNumber} value={a.accountNumber}>
                  {a.accountNumber} ({a.type}) - ${money(a.balance)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted">
              Transaction PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              disabled={loading}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4-digit PIN"
              className="mt-1 w-full rounded-xl border border-line bg-page px-4 py-3 text-sm text-primary outline-none transition focus:border-gold disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2 border-t border-line">
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-primary transition hover:border-gold disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Processing..." : `Pay $${money(installmentAmount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
