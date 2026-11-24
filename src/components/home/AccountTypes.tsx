import Link from "next/link";
import { Briefcase, Check, PiggyBank, Wallet } from "lucide-react";
import SectionHeading from "./SectionHeading";

const accounts = [
  {
    icon: PiggyBank,
    name: "Savings Account",
    text: "Grow your money safely.",
    perks: ["Low minimum balance", "Monthly statements", "Free transfers"],
  },
  {
    icon: Wallet,
    name: "Current Account",
    text: "For everyday spending.",
    perks: ["Unlimited transactions", "Higher daily limit", "Instant receipts"],
    popular: true,
  },
  {
    icon: Briefcase,
    name: "Business Account",
    text: "Made for your business.",
    perks: ["Multiple users", "Bulk payments", "Detailed reports"],
  },
];

export default function AccountTypes() {
  return (
    <section id="accounts" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Accounts"
          title="Choose the account that fits you"
          text="Open one or more accounts and switch between them anytime."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {accounts.map((a) => (
            <div
              key={a.name}
              className={`relative rounded-2xl border p-6 ${
                a.popular
                  ? "border-gold bg-primary text-white shadow-xl"
                  : "border-line bg-page"
              }`}
            >
              {a.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  a.popular ? "bg-white/10 text-gold" : "bg-gold-soft text-gold"
                }`}
              >
                <a.icon size={22} />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{a.name}</h3>
              <p
                className={`mt-1 text-sm ${
                  a.popular ? "text-white/70" : "text-muted"
                }`}
              >
                {a.text}
              </p>

              <ul className="mt-6 space-y-3">
                {a.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-gold" />
                    {p}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-8 block rounded-full py-3 text-center text-sm font-medium transition ${
                  a.popular
                    ? "bg-gold text-white hover:bg-gold/90"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                Open account
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}