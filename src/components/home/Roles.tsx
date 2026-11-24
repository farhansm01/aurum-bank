import { Check, ShieldCheck, UserCog, Users } from "lucide-react";
import SectionHeading from "./SectionHeading";

const roles = [
  {
    icon: Users,
    name: "Customer",
    text: "Manage your own money.",
    can: [
      "View accounts and balance",
      "Transfer money with a PIN",
      "Request deposits and withdrawals",
      "Apply for loans",
    ],
  },
  {
    icon: UserCog,
    name: "Bank Staff",
    text: "Help customers and review activity.",
    can: [
      "Register customers",
      "Create bank accounts",
      "Review and flag transactions",
      "Forward loans for approval",
    ],
  },
  {
    icon: ShieldCheck,
    name: "Admin",
    text: "Full control of the bank.",
    can: [
      "See analytics and charts",
      "Block or freeze accounts",
      "Approve or reject loans",
      "Set transaction limits",
    ],
  },
];

export default function Roles() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Roles"
          title="Built for everyone in the bank"
          text="Each role has its own dashboard and its own permissions."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {roles.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-line bg-page p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-gold">
                <r.icon size={22} />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-primary">
                {r.name}
              </h3>
              <p className="mt-1 text-sm text-muted">{r.text}</p>
              <ul className="mt-5 space-y-3">
                {r.can.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-2 text-sm text-primary"
                  >
                    <Check size={16} className="mt-0.5 shrink-0 text-gold" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}