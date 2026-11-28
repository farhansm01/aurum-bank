"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedAccount } from "@/features/accounts/accountsSlice";
import { money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import { CheckCircle2 } from "lucide-react";

type AccountItem = {
  id: string;
  accountNumber: string;
  type: string;
  balance: string;
  status: string;
  dailyLimit: string;
  singleLimit: string;
};

export default function CustomerAccountsList({ accounts }: { accounts: AccountItem[] }) {
  const dispatch = useAppDispatch();
  const selectedAccountNumber = useAppSelector(
    (state) => state.accounts.selectedAccountNumber,
  );

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((a) => {
        const isSelected = selectedAccountNumber === a.accountNumber;

        return (
          <div
            key={a.id}
            onClick={() => dispatch(setSelectedAccount(isSelected ? null : a.accountNumber))}
            className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-6 shadow-xs transition hover:border-gold ${
              isSelected
                ? "border-gold bg-gold-soft/20 ring-2 ring-gold/30"
                : "border-line bg-card"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-muted">
                  {a.type} Account
                </span>
                <div className="flex items-center gap-1.5">
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold">
                      <CheckCircle2 size={12} />
                      Selected
                    </span>
                  )}
                  <StatusBadge status={a.status} />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-xs text-muted">Available Balance</span>
                <p className="text-3xl font-bold text-primary">
                  ${money(a.balance)}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-page p-3 font-mono text-xs text-muted flex items-center justify-between">
                <span>Account No:</span>
                <span className="font-bold text-primary">{a.accountNumber}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-line space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>Daily Limit:</span>
                <span className="font-medium text-primary">${money(a.dailyLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Single Txn Limit:</span>
                <span className="font-medium text-primary">${money(a.singleLimit)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
