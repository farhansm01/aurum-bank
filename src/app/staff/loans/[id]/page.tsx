import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getLoanDetail } from "@/features/loans/loans.service";
import LoanDetailView from "@/features/loans/LoanDetailView";

export default async function StaffLoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["staff"]);
  const { id } = await params;

  const detail = await getLoanDetail({
    loanId: id,
    viewer: { id: session.user.id, role: session.user.role },
  });

  if (!detail) {
    notFound();
  }

  return (
    <LoanDetailView
      detail={detail}
      backHref="/staff/loans"
      canRepay={false}
    />
  );
}
