import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankSettings } from "@/db/schema";
import { requireRole } from "@/lib/session";
import BankSettingsForm from "@/features/admin/BankSettingsForm";

export default async function AdminSettingsPage() {
  await requireRole(["admin"]);

  const [settings] = await db
    .select()
    .from(bankSettings)
    .where(eq(bankSettings.id, 1));

  const initialSettings = {
    dailyTransferLimit: settings?.dailyTransferLimit ?? "50000.00",
    maxSingleTransaction: settings?.maxSingleTransaction ?? "10000.00",
    minBalance: settings?.minBalance ?? "0.00",
    transferFee: settings?.transferFee ?? "0.00",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">
          Bank Configuration & Global Limits
        </h1>
        <p className="text-sm text-muted">
          Configure bank-wide rules: transfer ceilings, minimum liquidity requirements, and transaction fees.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8">
        <BankSettingsForm initialSettings={initialSettings} />
      </div>
    </div>
  );
}
