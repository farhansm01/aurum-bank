import { ArrowDownLeft, ArrowUpRight, Landmark } from "lucide-react";
import SectionHeading from "./SectionHeading";

const bars = [40, 65, 50, 80, 60, 90, 70];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const rows = [
  { name: "Transfer to Karim", amount: "-$500.00", type: "out" },
  { name: "Deposit approved", amount: "+$2,000.00", type: "in" },
  { name: "Loan repayment", amount: "-$452.00", type: "out" },
];

export default function DashboardPreview() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Dashboard"
          title="See your money at a glance"
          text="Balance, activity, and charts in one clean dashboard."
        />

        <div className="mt-12 overflow-hidden rounded-3xl border border-line bg-white shadow-2xl">
          <div className="grid md:grid-cols-[200px_1fr]">
            {/* Sidebar */}
            <div className="hidden bg-primary p-5 text-white md:block">
              <div className="flex items-center gap-2 font-heading font-bold">
                <Landmark size={18} className="text-gold" />
                AURUM
              </div>
              <ul className="mt-8 space-y-3 text-sm text-white/70">
                <li className="rounded-lg bg-white/10 px-3 py-2 text-white">
                  Dashboard
                </li>
                <li className="px-3 py-2">Accounts</li>
                <li className="px-3 py-2">Transfer</li>
                <li className="px-3 py-2">Transactions</li>
                <li className="px-3 py-2">Loans</li>
              </ul>
            </div>

            {/* Main */}
            <div className="p-5 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-gold-soft p-4">
                  <p className="text-xs text-muted">Total balance</p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    $24,580
                  </p>
                </div>
                <div className="rounded-2xl border border-line p-4">
                  <p className="text-xs text-muted">Deposits</p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    $8,200
                  </p>
                </div>
                <div className="rounded-2xl border border-line p-4">
                  <p className="text-xs text-muted">Withdrawals</p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    $3,150
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-line p-4">
                  <p className="text-sm font-semibold text-primary">
                    Weekly spending
                  </p>
                  <div className="mt-4 flex h-32 items-end gap-2">
                    {bars.map((h, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-md bg-gold"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[10px] text-muted">
                          {days[i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-line p-4">
                  <p className="text-sm font-semibold text-primary">
                    Recent transactions
                  </p>
                  <ul className="mt-4 space-y-3">
                    {rows.map((r) => (
                      <li
                        key={r.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2 text-primary">
                          {r.type === "in" ? (
                            <ArrowDownLeft size={16} className="text-green-600" />
                          ) : (
                            <ArrowUpRight size={16} className="text-red-500" />
                          )}
                          {r.name}
                        </span>
                        <span className="font-medium text-primary">
                          {r.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}