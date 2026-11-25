"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

type Action = "approve" | "reject";

export default function ReviewButtons({
  id,
  summary,
}: {
  id: string;
  summary: string; // like "deposit of $300.00 for Rahim"
}) {
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, startTransition] = useTransition();

  const busy = loading || refreshing;

  function close() {
    setAction(null);
    setError("");
  }

  async function confirm() {
    if (!action) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/money-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setAction(null);
      // reload the list; "Processing..." stays until it finishes
      startTransition(() => router.refresh());
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false); // always runs, so it can never stay stuck
    }
  }

  return (
    <>
      {busy ? (
        <span className="text-xs text-muted">Processing...</span>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAction("approve")}
            className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => setAction("reject")}
            className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            Reject
          </button>
        </div>
      )}

      <ConfirmDialog
        open={action !== null}
        title={action === "approve" ? "Approve this request?" : "Reject this request?"}
        message={
          action === "approve"
            ? `The ${summary} will be applied to the balance right away. This cannot be undone.`
            : `The ${summary} will be rejected. No money will move.`
        }
        confirmLabel={action === "approve" ? "Approve" : "Reject"}
        tone={action === "reject" ? "danger" : "default"}
        loading={loading}
        error={error}
        onConfirm={confirm}
        onCancel={close}
      />
    </>
  );
}