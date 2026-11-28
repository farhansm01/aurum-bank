"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Logo from "@/components/Logo";
import { authClient } from "@/lib/auth-client";

const links = [
  { label: "Features", href: "#features" },
  { label: "Accounts", href: "#accounts" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Loans", href: "#loans" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const dashboardHref =
    session?.user && "role" in session.user && session.user.role === "admin"
      ? "/admin"
      : session?.user && "role" in session.user && session.user.role === "staff"
        ? "/staff"
        : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Aurum Bank home">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-muted transition hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-primary transition hover:bg-gold-soft"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
              >
                Open account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-primary md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-white px-4 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm font-medium text-muted"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            {session?.user ? (
              <Link
                href={dashboardHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2 text-center text-sm font-medium text-white"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex-1 rounded-full border border-line py-2 text-center text-sm font-medium text-primary"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-full bg-primary py-2 text-center text-sm font-medium text-white"
                >
                  Open account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}