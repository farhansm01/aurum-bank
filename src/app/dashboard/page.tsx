import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";
import { requireRole } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";

export default async function CustomerDashboard() {
  const session = await requireRole(["customer"]);

  const accounts = await db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, session.user.id))
    .orderBy(bankAccounts.accountNumber);

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold text-primary">
          Hello, {session.user.name}
        </h1>
        <SignOutButton />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-line bg-white p-5"
          >
            <p className="text-sm text-muted">
              {a.type} account - {a.accountNumber}
            </p>
            <p className="mt-2 text-2xl font-bold text-primary">
              $
              {Number(a.balance).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="mt-1 text-xs text-muted">Status: {a.status}</p>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/transfer"
        className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
      >
        Send money
      </Link>
    </main>
  );
}