import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-primary px-6 py-14 text-center text-white sm:px-12">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">
          Ready to open your <span className="text-gold">Aurum</span> account?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Create your account in a minute and try every feature of the bank.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition hover:bg-gold/90"
          >
            Open account <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium transition hover:bg-white/10"
          >
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}