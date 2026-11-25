import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  ArrowDownUp,
  History,
  BadgeDollarSign,
  Users,
  ShieldAlert,
  Settings,
  FileCheck,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  iconName: string;
};

// Customer navigation items
export const customerNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", iconName: "LayoutDashboard" },
  { label: "My Accounts", href: "/dashboard/accounts", iconName: "Wallet" },
  { label: "Send Money", href: "/dashboard/transfer", iconName: "ArrowLeftRight" },
  { label: "Deposits & Withdrawals", href: "/dashboard/requests", iconName: "ArrowDownUp" },
  { label: "Transactions", href: "/dashboard/transactions", iconName: "History" },
  { label: "Loans", href: "/dashboard/loans", iconName: "BadgeDollarSign" },
];

// Staff navigation items
export const staffNavItems: NavItem[] = [
  { label: "Overview", href: "/staff", iconName: "LayoutDashboard" },
  { label: "Customer Requests", href: "/staff/requests", iconName: "ArrowDownUp" },
  { label: "Customers", href: "/staff/customers", iconName: "Users" },
  { label: "Transactions", href: "/staff/transactions", iconName: "History" },
  { label: "Loan Assistance", href: "/staff/loans", iconName: "FileCheck" },
];

// Admin navigation items
export const adminNavItems: NavItem[] = [
  { label: "Analytics Overview", href: "/admin", iconName: "LayoutDashboard" },
  { label: "Pending Requests", href: "/admin/requests", iconName: "ArrowDownUp" },
  { label: "Customer Management", href: "/admin/customers", iconName: "Users" },
  { label: "Bank Accounts", href: "/admin/accounts", iconName: "Wallet" },
  { label: "Transactions", href: "/admin/transactions", iconName: "History" },
  { label: "Loan Management", href: "/admin/loans", iconName: "BadgeDollarSign" },
  { label: "Bank Settings", href: "/admin/settings", iconName: "Settings" },
];

// Helper to get the correct icon component
export const navIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  ArrowDownUp,
  History,
  BadgeDollarSign,
  Users,
  ShieldAlert,
  Settings,
  FileCheck,
};
