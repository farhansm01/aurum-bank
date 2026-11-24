import {
  HandCoins,
  Receipt,
  Send,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

const features = [
  {
    icon: Send,
    title: "Instant transfers",
    text: "Send money between your own accounts or to any Aurum customer in seconds.",
  },
  {
    icon: HandCoins,
    title: "Easy loans",
    text: "Apply online, track your application, and see your repayment schedule.",
  },
  {
    icon: Wallet,
    title: "Deposits and withdrawals",
    text: "Submit a request and get it approved by our bank staff.",
  },
  {
    icon: Receipt,
    title: "Clear transaction history",
    text: "Search, filter, and download receipts and statements anytime.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by design",
    text: "A transaction PIN and role-based access protect every action.",
  },
  {
    icon: TrendingUp,
    title: "Smart insights",
    text: "Charts show your spending and deposits month by month.",
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Features"
          title="Everything you need from a bank"
          text="Simple tools for your daily money, built with care."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold">
                <f.icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-primary">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}