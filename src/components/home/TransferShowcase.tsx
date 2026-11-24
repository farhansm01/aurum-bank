import { CheckCircle2 } from "lucide-react";
import SectionHeading from "./SectionHeading";

const checks = [
  "Balance is checked on the server",
  "Recipient account is verified",
  "Transaction PIN is required",
  "Daily limits are respected",
];

export default function TransferShowcase() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="text-center lg:text-left [&>div]:mx-0 [&>div]:max-w-none">
            <SectionHeading
              label="Fund transfer"
              title="Send money with confidence"
              text="Every transfer is checked step by step. Both accounts update together, or nothing changes."
            />
          </div>
          <ul className="mt-8 space-y-3">
            {checks.map((c) => (
              <li key={c} className="flex items-center gap-3 text-primary">
                <CheckCircle2 size={20} className="text-gold" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Static transfer form preview */}
        <div className="mx-auto w-full max-w-md rounded-3xl border border-line bg-page p-6 shadow-xl sm:p-8">
          <h3 className="text-lg font-semibold text-primary">Transfer money</h3>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs text-muted">Recipient account number</p>
              <div className="mt-1 rounded-xl border border-line bg-white px-4 py-3 text-sm text-primary">
                AB-2002-4417
              </div>
            </div>
            <div>
              <p className="text-xs text-muted">Amount</p>
              <div className="mt-1 rounded-xl border border-line bg-white px-4 py-3 text-sm text-primary">
                $500.00
              </div>
            </div>
            <div>
              <p className="text-xs text-muted">Transaction PIN</p>
              <div className="mt-1 rounded-xl border border-line bg-white px-4 py-3 text-sm tracking-widest text-primary">
                ••••
              </div>
            </div>
            <div className="rounded-full bg-primary py-3 text-center text-sm font-medium text-white">
              Send money
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}