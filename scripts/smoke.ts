import { createBook, deleteBook, getBook, listBooks, updateBook } from "../lib/books";
import {
  acceptFriendship,
  areAcceptedFriends,
  consumeInviteForNewUser,
  createInviteLink,
  createUsernameInvite,
  declineFriendship,
  getFriendshipBetween,
  getInviteLink,
  listIncomingPending,
} from "../lib/friendships";
import { claimUsername, getUserByUsername } from "../lib/users";
import { db } from "../lib/db";
import { users } from "../lib/db/schema";

async function insertUser(username: string | null) {
  const user = {
    id: crypto.randomUUID(),
    clerkId: `clerk_${crypto.randomUUID()}`,
    username,
    pendingInviteToken: null,
    createdAt: new Date().toISOString(),
  };
  await db.insert(users).values(user);
  return user;
}

async function main() {
  const owner = await insertUser("angel");
  const friend = await insertUser("maria");
  const stranger = await insertUser("sam");

  const taken = await getUserByUsername("ANGEL");
  if (taken?.id !== owner.id) throw new Error("username lookup is not case-insensitive");

  try {
    await claimUsername(friend.id, "angel");
    throw new Error("duplicate username should fail");
  } catch {
    // expected unique constraint
  }

  const bookId = await createBook({
    ownerId: owner.id,
    title: "The Left Hand of Darkness",
    status: "reading",
    formats: ["paperback", "ebook"],
    startedAt: null,
    finishedAt: null,
    abandonedAt: null,
    note: null,
  });

  const created = await getBook(bookId);
  if (!created || created.startedAt) throw new Error("create should not stamp dates");

  await updateBook(bookId, {
    title: created.title,
    status: "read",
    formats: created.formats,
    startedAt: created.startedAt,
    finishedAt: created.finishedAt,
    abandonedAt: created.abandonedAt,
    note: "still thinking about it",
  });
  const moved = await getBook(bookId);
  if (!moved || moved.status !== "read" || moved.finishedAt) {
    throw new Error("status move should not stamp dates");
  }

  if ((await listBooks(owner.id, "read")).length !== 1) throw new Error("status filter failed");

  await createUsernameInvite(owner.id, friend.id);
  const pending = await listIncomingPending(friend.id);
  if (pending.length !== 1) throw new Error("pending invite missing");
  if (await areAcceptedFriends(owner.id, friend.id)) throw new Error("pending should not grant access");

  await acceptFriendship(pending[0].id);
  if (!(await areAcceptedFriends(owner.id, friend.id))) throw new Error("accept should friend both sides");

  const second = await insertUser("lee");
  await createUsernameInvite(owner.id, second.id);
  const incoming = await listIncomingPending(second.id);
  await declineFriendship(incoming[0].id);
  if (await getFriendshipBetween(owner.id, second.id)) throw new Error("decline should remove the row");

  const token = await createInviteLink(owner.id);
  const newMember = await insertUser(null);
  if (!(await consumeInviteForNewUser(token, newMember.id))) throw new Error("new member invite failed");
  const used = await getInviteLink(token);
  if (!used?.usedAt) throw new Error("link should be marked used");
  if (!(await areAcceptedFriends(owner.id, newMember.id))) throw new Error("new member should be friends");
  if (await consumeInviteForNewUser(token, stranger.id)) throw new Error("used link should not friend again");

  await deleteBook(bookId);
  if ((await listBooks(owner.id)).length !== 0) throw new Error("delete should remove the book");

  console.log("smoke ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
