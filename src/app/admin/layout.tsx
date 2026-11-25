import { requireRole } from "@/lib/session";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminNavItems } from "@/components/dashboard/nav-config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["admin"]);

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
      navItems={adminNavItems}
    >
      {children}
    </DashboardShell>
  );
}
