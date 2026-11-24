import Link from "next/link";
import Logo from "@/components/Logo";

const columns = [
  {
    title: "Bank",
    links: [
      { label: "Features", href: "#features" },
      { label: "Accounts", href: "#accounts" },
      { label: "Loans", href: "#loans" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Open account", href: "/register" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">
              A modern digital banking platform built as a demo project.
            </p>
          </div>

          {columns.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-semibold text-primary">{c.title}</p>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© 2026 Aurum Bank. All rights reserved.</p>
          <p>Simulated project. No real money is used.</p>
        </div>
      </div>
    </footer>
  );
}