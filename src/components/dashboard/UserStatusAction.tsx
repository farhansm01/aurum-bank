"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserStatusAction({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    if (!confirm(`Change customer status to "${newStatus}"?`)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setLoading(false);
    if (!res.ok) {
      alert("Failed to update status.");
      return;
    }

    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      disabled={loading}
      onChange={(e) => updateStatus(e.target.value)}
      className="rounded-lg border border-line bg-page px-2 py-1 text-xs font-semibold text-primary outline-none transition focus:border-gold disabled:opacity-50"
    >
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="blocked">Blocked</option>
    </select>
  );
}
