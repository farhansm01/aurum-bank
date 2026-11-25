import Link from "next/link";
import Logo from "@/components/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" aria-label="Aurum Bank home">
        <Logo />
      </Link>
      <div className="mt-8 w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
      <p className="mt-6 text-xs text-muted">
        Simulated project. No real money is used.
      </p>
    </main>
  );
}