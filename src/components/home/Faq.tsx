import { ChevronDown } from "lucide-react";
import SectionHeading from "./SectionHeading";

const faqs = [
  {
    q: "Is Aurum Bank a real bank?",
    a: "No. It is a simulated project. No real money or real bank details are used.",
  },
  {
    q: "How do I add money to my account?",
    a: "Submit a deposit request. A staff member or admin reviews it and approves or rejects it.",
  },
  {
    q: "What do I need to transfer money?",
    a: "The recipient account number, the amount, and your transaction PIN.",
  },
  {
    q: "What happens if a transfer fails?",
    a: "Nothing changes. Money is never taken from one account without reaching the other.",
  },
  {
    q: "How do I apply for a loan?",
    a: "Open the loans page in your dashboard, fill in the form, and track the status.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading label="FAQ" title="Questions? We have answers" />

        <div className="mt-12 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-line bg-white p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-primary">
                {f.q}
                <ChevronDown
                  size={18}
                  className="shrink-0 text-gold transition group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}