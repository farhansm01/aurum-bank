"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoanReviewButtons({ loanId }: { loanId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "approve" | "reject") {
    if (!confirm(`Are you sure you want to ${action} this loan?`)) {
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/loans/${loanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error ?? "Action failed.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction("approve")}
        disabled={loading}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={loading}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
