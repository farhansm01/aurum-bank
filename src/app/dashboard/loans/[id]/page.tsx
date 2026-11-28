import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { getLoanDetail } from "@/features/loans/loans.service";
import LoanDetailView from "@/features/loans/LoanDetailView";

export default async function CustomerLoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["customer"]);
  const { id } = await params;

  // Fetch loan detail with customer ownership guard
  const detail = await getLoanDetail({
    loanId: id,
    viewer: { id: session.user.id, role: session.user.role },
  });

  if (!detail) {
    notFound();
  }

  // Fetch customer active bank accounts for the repayment modal
  const accounts = await db
    .select({
      accountNumber: bankAccounts.accountNumber,
      type: bankAccounts.type,
      balance: bankAccounts.balance,
    })
    .from(bankAccounts)
    .where(
      and(
        eq(bankAccounts.userId, session.user.id),
        eq(bankAccounts.status, "active")
      )
    )
    .orderBy(bankAccounts.accountNumber);

  return (
    <LoanDetailView
      detail={detail}
      backHref="/dashboard/loans"
      canRepay={true}
      customerAccounts={accounts}
    />
  );
}
