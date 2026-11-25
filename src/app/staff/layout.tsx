import { requireRole } from "@/lib/session";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { staffNavItems } from "@/components/dashboard/nav-config";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["staff"]);

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
      navItems={staffNavItems}
    >
      {children}
    </DashboardShell>
  );
}
