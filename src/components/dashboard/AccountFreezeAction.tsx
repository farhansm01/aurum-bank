"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountFreezeAction({
  accountId,
  currentStatus,
}: {
  accountId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleFreeze() {
    const nextStatus = currentStatus === "active" ? "frozen" : "active";
    if (!confirm(`Are you sure you want to change account status to "${nextStatus}"?`)) {
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/admin/accounts/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    setLoading(false);
    if (!res.ok) {
      alert("Failed to update account status.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={toggleFreeze}
      disabled={loading}
      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
        currentStatus === "active"
          ? "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
      }`}
    >
      {currentStatus === "active" ? "Freeze" : "Unfreeze"}
    </button>
  );
}
