import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";
import { requireRole } from "@/lib/session";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import CustomerAccountsList from "@/features/accounts/CustomerAccountsList";

export default async function CustomerAccountsPage() {
  const session = await requireRole(["customer"]);

  const accounts = await db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, session.user.id))
    .orderBy(bankAccounts.accountNumber);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            My Bank Accounts
          </h1>
          <p className="text-sm text-muted">
            Manage and view balances across all your Aurum accounts.
          </p>
        </div>
        <Link
          href="/dashboard/transfer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          <ArrowLeftRight size={16} />
          <span>Transfer Funds</span>
        </Link>
      </div>

      <CustomerAccountsList accounts={accounts} />
    </div>
  );
}
