"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAppUser } from "@/lib/auth";
import {
  acceptFriendship,
  createInviteLink,
  createUsernameInvite,
  declineFriendship,
  getFriendshipBetween,
  listIncomingPending,
} from "@/lib/friendships";
import { getUserByUsername } from "@/lib/users";

export async function inviteByUsernameAction(
  _prev: { error: string | null; ok: string | null },
  formData: FormData,
) {
  const user = await requireAppUser();
  const username = String(formData.get("username") ?? "").trim();
  const target = await getUserByUsername(username);

  if (!target) {
    return { error: "That username was not found.", ok: null };
  }
  if (target.id === user.id) {
    return { error: "You cannot invite yourself.", ok: null };
  }

  const existing = await getFriendshipBetween(user.id, target.id);
  if (existing?.status === "accepted") {
    return { error: "You are already friends.", ok: null };
  }
  if (existing?.status === "pending") {
    return { error: "A request is already pending.", ok: null };
  }

  await createUsernameInvite(user.id, target.id);
  revalidatePath("/friends");
  return { error: null, ok: "Invite sent." };
}

export async function acceptInviteAction(formData: FormData) {
  const user = await requireAppUser();
  const id = String(formData.get("id") ?? "");
  const incoming = await listIncomingPending(user.id);
  if (!incoming.some((row) => row.id === id)) return;
  await acceptFriendship(id);
  revalidatePath("/friends");
}

export async function declineInviteAction(formData: FormData) {
  const user = await requireAppUser();
  const id = String(formData.get("id") ?? "");
  const incoming = await listIncomingPending(user.id);
  if (!incoming.some((row) => row.id === id)) return;
  await declineFriendship(id);
  revalidatePath("/friends");
}

export async function mintInviteLinkAction() {
  const user = await requireAppUser();
  const token = await createInviteLink(user.id);
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const url = host ? `${proto}://${host}/invite/${token}` : `/invite/${token}`;
  revalidatePath("/friends");
  return { url };
}
