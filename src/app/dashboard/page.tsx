import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
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
            <p className="text-sm capitalize text-muted">
              {a.type} account - {a.accountNumber}
            </p>
            <p className="mt-2 text-2xl font-bold text-primary">
              ${money(a.balance)}
            </p>
            <div className="mt-2">
              <StatusBadge status={a.status} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/transfer"
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Send money
        </Link>
        <Link
          href="/dashboard/requests"
          className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-primary transition hover:border-gold"
        >
          Deposit and withdrawal
        </Link>
      </div>
    </main>
  );
}