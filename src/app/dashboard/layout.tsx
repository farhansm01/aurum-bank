import { requireRole } from "@/lib/session";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { customerNavItems } from "@/components/dashboard/nav-config";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["customer"]);

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
      navItems={customerNavItems}
    >
      {children}
    </DashboardShell>
  );
}
