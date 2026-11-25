import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

const homeByRole: Record<string, string> = {
  admin: "/admin",
  staff: "/staff",
  customer: "/dashboard",
};

export async function requireRole(roles: string[]) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.user.status !== "active") redirect("/login");

  if (!roles.includes(session.user.role)) {
    redirect(homeByRole[session.user.role] ?? "/login");
  }

  return session;
}