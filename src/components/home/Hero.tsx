import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

const trust = ["No hidden fees", "24/7 access", "Bank-grade security"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-gold-soft blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">
        {/* Left side: text */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-muted">
            <ShieldCheck size={14} className="text-gold" />
            Secure digital banking
          </span>

          <h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">
            Banking as precious as <span className="text-gold">gold</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            Manage your accounts, send money, apply for loans, and track every
            transaction in one simple and secure place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              Open account <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-primary transition hover:border-gold"
            >
              Login to your account
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {trust.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-muted"
              >
                <CheckCircle2 size={16} className="text-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right side: bank card */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-3xl bg-primary p-6 text-white shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">Savings Account</p>
              <p className="font-heading text-lg font-bold text-gold">AURUM</p>
            </div>

            <p className="mt-8 text-sm text-white/70">Available balance</p>
            <p className="mt-1 text-3xl font-bold sm:text-4xl">$24,580.00</p>

            <div className="mt-8 flex items-end justify-between">
              <div>
                <p className="text-xs text-white/60">Account number</p>
                <p className="mt-1 tracking-widest">**** 4821</p>
              </div>
              <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">
                Active
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-lg sm:absolute sm:-bottom-6 sm:-left-6 sm:mt-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-gold">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">
                Transfer completed
              </p>
              <p className="text-xs text-muted">$500.00 sent to Karim</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}