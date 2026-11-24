import { Send, UserPlus, Wallet } from "lucide-react";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    text: "Register in a minute and open your first bank account.",
  },
  {
    icon: Wallet,
    title: "Add money",
    text: "Submit a deposit request. Our staff reviews and approves it.",
  },
  {
    icon: Send,
    title: "Send and track",
    text: "Transfer money, apply for loans, and watch every transaction.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="How it works"
          title="Start in 3 simple steps"
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-gold">
                <s.icon size={30} />
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-primary">
                {s.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}