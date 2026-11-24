"use client";

import { useState } from "react";
import Link from "next/link";

const RATE = 8; // yearly percent, fixed for now

const money = (n: number) =>
  "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function LoanCalculator() {
  const [amount, setAmount] = useState(10000);
  const [months, setMonths] = useState(24);

  const r = RATE / 12 / 100;
  const monthly =
    (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = monthly * months;
  const interest = total - amount;

  return (
    <section id="loans" className="scroll-mt-20 bg-primary py-20 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">
            Loans
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
            Plan your loan before you apply
          </h2>
          <p className="mt-4 max-w-lg text-white/70">
            Move the sliders to see your monthly payment. The rate here is{" "}
            {RATE}% a year, for demo only.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition hover:bg-gold/90"
          >
            Apply for a loan
          </Link>
        </div>

        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Loan amount</span>
              <span className="font-semibold">{money(amount)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={100000}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-3 w-full accent-gold"
            />
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Duration</span>
              <span className="font-semibold">{months} months</span>
            </div>
            <input
              type="range"
              min={6}
              max={60}
              step={6}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="mt-3 w-full accent-gold"
            />
          </div>

          <div className="mt-8 rounded-2xl bg-white/10 p-5 text-center">
            <p className="text-sm text-white/70">Monthly payment</p>
            <p className="mt-1 font-heading text-4xl font-bold text-gold">
              {money(monthly)}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <p className="text-white/70">Total interest</p>
              <p className="mt-1 font-semibold">{money(interest)}</p>
            </div>
            <div>
              <p className="text-white/70">Total to pay</p>
              <p className="mt-1 font-semibold">{money(total)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}