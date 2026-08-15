import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUser } from "./users";
import type { AppUser } from "./types";

export { INVITE_COOKIE } from "./auth-constants";

export async function requireSignedIn() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return ensureUser(userId);
}

export async function requireAppUser(): Promise<AppUser & { username: string }> {
  const { user } = await requireSignedIn();
  if (!user.username) {
    redirect("/claim-username");
  }
  return { ...user, username: user.username };
}

export async function requireClaimableUser() {
  const { user, created } = await requireSignedIn();
  if (user.username) {
    redirect("/");
  }
  return { user, created };
}
