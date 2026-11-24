
import { db } from "@/db";
import { user } from "@/db/schema";

export async function GET() {
  // 1. INSERT: add one row
  await db.insert(user).values({
    id: crypto.randomUUID(),
    name: "Rahim",
    email: `rahim-${Date.now()}@mail.com`,
  });

  // 2. SELECT: read all rows
  const allUsers = await db.select().from(user);

  return Response.json(allUsers);
}