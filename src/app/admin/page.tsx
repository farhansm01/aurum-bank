import Link from "next/link";
import { requireRole } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminDashboard() {
  const session = await requireRole(["admin"]);

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold text-primary">
          Admin: {session.user.name}
        </h1>
        <SignOutButton />
      </div>

      <div className="mt-6">
        <Link
          href="/admin/requests"
          className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Pending requests
        </Link>
      </div>
    </main>
  );
}