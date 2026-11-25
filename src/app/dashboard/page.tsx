import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Hello, {session.user.name}
      </h1>
      <p className="mt-2 text-muted">Email: {session.user.email}</p>
      <p className="text-muted">Role: {session.user.role}</p>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </main>
  );
}