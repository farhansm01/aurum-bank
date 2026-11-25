"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import Logo from "@/components/Logo";
import StatusBadge from "@/components/StatusBadge";
import { authClient } from "@/lib/auth-client";
import { NavItem, navIcons } from "./nav-config";

type DashboardShellProps = {
  user: {
    name: string;
    email: string;
    role: string;
  };
  navItems: NavItem[];
  children: React.ReactNode;
};

export default function DashboardShell({
  user,
  navItems,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSignOut() {
    setLoggingOut(true);
    await authClient.signOut();
    window.location.href = "/login";
  }

  // Sidebar content component (used for both desktop and mobile drawer)
  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-5">
      <div>
        {/* Logo */}
        <div className="pb-6 border-b border-line">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
        </div>

        {/* User Card */}
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-page p-3 border border-line">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-primary font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary">
              {user.name}
            </p>
            <div className="mt-0.5">
              <StatusBadge status={user.role} />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = navIcons[item.iconName] ?? UserIcon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/admin" &&
                item.href !== "/staff" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted hover:bg-page hover:text-primary"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign Out Action at Bottom */}
      <div className="pt-4 border-t border-line">
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          <LogOut size={18} />
          <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-page">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-line bg-card md:block">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-xl transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-card/90 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-primary hover:bg-page md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span className="text-xs uppercase tracking-wider text-muted font-semibold hidden sm:inline">
              Aurum Portal • {user.role}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted hidden sm:inline">
              Signed in as <strong className="text-primary">{user.email}</strong>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
