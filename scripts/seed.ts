import { config } from "dotenv";
import { eq } from "drizzle-orm";

// load .env.local BEFORE importing the db
config({ path: ".env.local" });

const demoUsers = [
  { name: "Admin User", email: "admin@aurum.test", password: "Admin@12345", role: "admin" },
  { name: "Staff User", email: "staff@aurum.test", password: "Staff@12345", role: "staff" },
  { name: "Customer User", email: "customer@aurum.test", password: "Customer@12345", role: "customer" },
];

async function main() {
  const { db } = await import("@/db");
  const { user } = await import("@/db/schema");
  const { auth } = await import("@/lib/auth");

  for (const demo of demoUsers) {
    // 1. skip if this email already exists
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, demo.email));

    if (existing.length > 0) {
      console.log(`skipped ${demo.email} (already exists)`);
      continue;
    }

    // 2. create a normal user (password gets hashed by Better Auth)
    await auth.api.signUpEmail({
      body: { name: demo.name, email: demo.email, password: demo.password },
    });

    // 3. set the real role directly in the database
    await db.update(user).set({ role: demo.role }).where(eq(user.email, demo.email));

    console.log(`created ${demo.email} (${demo.role})`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});