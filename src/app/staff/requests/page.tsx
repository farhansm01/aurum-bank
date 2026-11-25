import { requireRole } from "@/lib/session";
import PendingRequestsTable from "@/features/money-requests/PendingRequestsTable";

export default async function StaffRequestsPage() {
  await requireRole(["staff"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Customer Money Requests
        </h1>
        <p className="text-sm text-muted">
          Review, approve, or reject pending customer deposit and withdrawal requests.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
        <PendingRequestsTable />
      </div>
    </div>
  );
}
