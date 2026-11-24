import {
  ArrowLeftRight,
  Eye,
  History,
  KeyRound,
  Lock,
  ShieldCheck,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

const items = [
  {
    icon: Lock,
    title: "Hashed passwords",
    text: "Passwords are never stored as plain text.",
  },
  {
    icon: KeyRound,
    title: "Transaction PIN",
    text: "Every transfer needs your own secret PIN.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    text: "Customers, staff, and admins see only what they should.",
  },
  {
    icon: ArrowLeftRight,
    title: "Atomic transfers",
    text: "Money moves in both accounts together, or not at all.",
  },
  {
    icon: Eye,
    title: "Suspicious activity checks",
    text: "Unusual transactions are flagged for review.",
  },
  {
    icon: History,
    title: "Full history kept",
    text: "Every transaction is saved and never silently changed.",
  },
];

export default function Security() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Security"
          title="Your money, protected"
          text="Security is checked on the server, not only on the screen."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.title} className="flex gap-4 rounded-2xl p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-gold">
                <i.icon size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-primary">{i.title}</h3>
                <p className="mt-1 text-sm text-muted">{i.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}