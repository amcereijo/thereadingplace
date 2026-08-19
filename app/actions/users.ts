"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { INVITE_COOKIE } from "@/lib/auth-constants";
import { requireClaimableUser } from "@/lib/auth";
import { consumeInviteForNewUser } from "@/lib/friendships";
import { claimUsername, clearPendingInvite, getUserByUsername, isValidUsername } from "@/lib/users";

export async function claimUsernameAction(
  _prev: { error: string | null },
  formData: FormData,
) {
  const { user } = await requireClaimableUser();
  const username = String(formData.get("username") ?? "");

  if (!isValidUsername(username)) {
    return { error: "errors.invalidUsername" };
  }

  const taken = await getUserByUsername(username);
  if (taken) {
    return { error: "errors.usernameTaken" };
  }

  try {
    await claimUsername(user.id, username);
  } catch {
    return { error: "errors.usernameTaken" };
  }

  if (user.pendingInviteToken) {
    await consumeInviteForNewUser(user.pendingInviteToken, user.id);
    await clearPendingInvite(user.id);
  }

  const jar = await cookies();
  if (jar.get(INVITE_COOKIE)) {
    jar.delete(INVITE_COOKIE);
  }

  redirect("/");
}
