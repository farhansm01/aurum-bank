import { requireRole } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminDashboard() {
  const session = await requireRole(["admin"]);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Admin: {session.user.name}
      </h1>
      <p className="mt-2 text-muted">Role: {session.user.role}</p>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </main>
  );
}