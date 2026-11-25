"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() =>
        authClient.signOut({
          fetchOptions: { onSuccess: () => router.push("/login") },
        })
      }
      className="rounded-full border border-line bg-white px-5 py-2 text-sm font-medium text-primary transition hover:border-gold"
    >
      Sign out
    </button>
  );
}