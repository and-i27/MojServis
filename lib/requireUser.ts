import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";

export async function requireUser() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return {
    session,
    userId,
  };
}

export async function requireAdmin() {
  const { session, userId } = await requireUser();

  const user = await client.fetch(
    `*[_type == "user" && _id == $userId][0]{role}`,
    { userId }
  );

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return {
    session,
    userId,
  };
}

export async function getUserRole(userId: string) {
  const user = await client.fetch(
    `*[_type == "user" && _id == $userId][0]{role}`,
    { userId }
  );

  return user?.role || "user";
}
