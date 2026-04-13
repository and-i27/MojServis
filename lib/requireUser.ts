import { redirect } from "next/navigation";
import { auth } from "@/auth";

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
