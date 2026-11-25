import Link from "next/link";
import { requireRole } from "@/lib/session";
import PendingRequestsTable from "@/features/money-requests/PendingRequestsTable";

export default async function StaffRequestsPage() {
  await requireRole(["staff"]);

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <Link href="/staff" className="text-sm text-gold hover:underline">
        Back to dashboard
      </Link>
      <h1 className="mt-3 font-heading text-3xl font-bold text-primary">
        Pending requests
      </h1>
      <p className="mt-1 text-sm text-muted">
        Approve or reject deposit and withdrawal requests.
      </p>
      <div className="mt-6">
        <PendingRequestsTable />
      </div>
    </main>
  );
}