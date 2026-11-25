import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// For PAGES: sends the user to another page if not allowed
export async function requireRole(allowedRoles: string[]) {
  const session = await getSession();

  // 1. Not logged in? Go to login.
  if (!session) {
    redirect("/login");
  }

  // 2. Account blocked or inactive? Go to login.
  if (session.user.status !== "active") {
    redirect("/login");
  }

  // 3. Is his role in the allowed list?
  const isAllowed = allowedRoles.includes(session.user.role);

  // 4. Not allowed? Send him to the homepage.
  if (!isAllowed) {
    redirect("/");
  }

  // 5. All good. Give back the session.
  return session;
}

// For API ROUTES: answers with an error instead of redirecting
export async function requireApiRole(allowedRoles: string[]) {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      error: Response.json({ error: "Please login." }, { status: 401 }),
    };
  }

  if (session.user.status !== "active") {
    return {
      session: null,
      error: Response.json({ error: "Account is not active." }, { status: 403 }),
    };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return {
      session: null,
      error: Response.json({ error: "Not allowed." }, { status: 403 }),
    };
  }

  return { session, error: null };
}