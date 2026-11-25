import { requireRole } from "@/lib/session";
import CustomerDashboardView from "./CustomerDashboardView";

export default async function CustomerDashboard() {
  const session = await requireRole(["customer"]);

  return <CustomerDashboardView userName={session.user.name} />;
}
