"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KycVerificationAction({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateKyc(newStatus: string) {
    if (!confirm(`Set customer KYC verification status to "${newStatus}"?`)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationStatus: newStatus }),
    });

    setLoading(false);
    if (!res.ok) {
      alert("Failed to update KYC status.");
      return;
    }

    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      disabled={loading}
      onChange={(e) => updateKyc(e.target.value)}
      className="rounded-lg border border-line bg-page px-2 py-1 text-xs font-semibold text-primary outline-none transition focus:border-gold disabled:opacity-50"
    >
      <option value="pending">Pending</option>
      <option value="verified">Verified</option>
      <option value="rejected">Rejected</option>
    </select>
  );
}
