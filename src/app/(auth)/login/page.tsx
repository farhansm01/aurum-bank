"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-gold";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authClient.signIn.email({ email, password });
    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Wrong email or password.");
      return;
    }

    // send each role to its own page
    const role = result.data.user.role;

    if (role === "admin") {
      router.push("/admin");
    } else if (role === "staff") {
      router.push("/staff");
    } else {
      router.push("/dashboard");
    }

    router.refresh();
  }

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-primary">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-muted">Login to your Aurum account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-primary">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-primary">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to Aurum Bank?{" "}
        <Link
          href="/register"
          className="font-medium text-gold hover:underline"
        >
          Open an account
        </Link>
      </p>
    </>
  );
}