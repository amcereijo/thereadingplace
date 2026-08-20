import path from "node:path";
import { createBook, deleteBook, listBooks } from "../lib/books";
import { db } from "../lib/db";
import { books, recommendations, users } from "../lib/db/schema";
import {
  acceptRecommendation,
  countRecommendationsForUser,
  countUnreadReceived,
  dismissRecommendation,
  listReceived,
  listSent,
  sendRecommendation,
} from "../lib/recommendations";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "app.db");
if (!process.env.DATABASE_PATH && !process.env.TURSO_DATABASE_URL && !process.env.DATABASE_URL) {
  throw new Error(
    `smoke-recommendations: refusing to run against the default dev DB at ${dbPath}. ` +
      "Set DATABASE_PATH to a disposable file (or use a Turso URL). " +
      "This script deletes all rows from books, recommendations, and users in the target DB.",
  );
}

async function insertUser(username: string) {
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

async function clearAll() {
  await db.delete(recommendations);
  await db.delete(books);
  await db.delete(users);
}

async function main() {
  await clearAll();

  const sender = await insertUser("angel");
  const receiver = await insertUser("maria");
  const stranger = await insertUser("sam");

  const bookId = await createBook({
    ownerId: sender.id,
    title: "Dune",
    author: "Frank Herbert",
    status: "read",
    formats: ["paperback"],
    startedAt: null,
    finishedAt: null,
    abandonedAt: null,
    note: "Chapter 3 is the one.",
  });

  const sent = await sendRecommendation({
    senderId: sender.id,
    receiverId: receiver.id,
    bookId,
    title: "Dune",
    author: "Frank Herbert",
    formats: ["paperback"],
    note: "Chapter 3 is the one.",
    message: "you will love this",
  });

  if (sent.status !== "pending") throw new Error("new recommendation should be pending");
  if (sent.title !== "Dune") throw new Error("snapshot title missing");
  if (sent.message !== "you will love this") throw new Error("message missing");
  if (sent.reply !== null) throw new Error("reply should default to null");
  if (sent.replyAt !== null) throw new Error("replyAt should default to null");

  // listReceived / listSent
  const receivedInitial = await listReceived(receiver.id);
  const sentInitial = await listSent(sender.id);
  if (receivedInitial.length !== 1) throw new Error("received list count wrong");
  if (sentInitial.length !== 1) throw new Error("sent list count wrong");

  // pending row counts as unread
  const unreadInitial = await countUnreadReceived(receiver.id);
  if (unreadInitial !== 1) throw new Error(`expected 1 unread, got ${unreadInitial}`);

  // accept with reply
  const newBookId = await acceptRecommendation({
    recommendationId: sent.id,
    userId: receiver.id,
    status: "to-read",
    reply: "thanks, will check it out",
  });
  if (!newBookId) throw new Error("accept should return new book id");
  const newBook = (await listBooks(receiver.id))[0];
  if (!newBook) throw new Error("accept should have created a book on receiver's shelf");
  if (newBook.title !== "Dune") throw new Error("accept should copy title from snapshot");

  const acceptedRow = (await listReceived(receiver.id))[0];
  if (acceptedRow.status !== "accepted") throw new Error("accepted row should have status=accepted");
  if (acceptedRow.acceptedAt === null) throw new Error("acceptedAt should be set");
  if (acceptedRow.reply !== "thanks, will check it out") throw new Error("reply should be saved on accept");
  if (acceptedRow.replyAt === null) throw new Error("replyAt should be set on accept");

  // unread should drop to 0 (no pending rows)
  if ((await countUnreadReceived(receiver.id)) !== 0) throw new Error("accepted row should not count as unread");

  // cannot accept again
  const second = await acceptRecommendation({
    recommendationId: sent.id,
    userId: receiver.id,
    status: "reading",
  });
  if (second !== null) throw new Error("second accept should return null");

  // dismiss — send another, dismiss with reply
  const sent2 = await sendRecommendation({
    senderId: sender.id,
    receiverId: receiver.id,
    bookId,
    title: "Dune",
    author: "Frank Herbert",
    formats: ["paperback"],
    note: null,
    message: null,
  });
  const dismissed = await dismissRecommendation({
    recommendationId: sent2.id,
    userId: receiver.id,
    reply: "not for me, but thanks",
  });
  if (!dismissed) throw new Error("dismiss should succeed for pending row owned by receiver");
  const afterDismiss = (await listReceived(receiver.id)).find((r) => r.id === sent2.id);
  if (!afterDismiss || afterDismiss.status !== "dismissed") throw new Error("dismissed row should have status=dismissed");
  if (afterDismiss.reply !== "not for me, but thanks") throw new Error("reply should be saved on dismiss");
  if (afterDismiss.replyAt === null) throw new Error("replyAt should be set on dismiss");

  // dismiss without reply — reply stays null
  const sent4 = await sendRecommendation({
    senderId: sender.id,
    receiverId: receiver.id,
    bookId,
    title: "Dune",
    author: "Frank Herbert",
    formats: ["paperback"],
    note: null,
    message: null,
  });
  await dismissRecommendation({ recommendationId: sent4.id, userId: receiver.id });
  const noReply = (await listReceived(receiver.id)).find((r) => r.id === sent4.id);
  if (!noReply || noReply.reply !== null || noReply.replyAt !== null) {
    throw new Error("dismiss without reply should leave both fields null");
  }

  // dismiss a non-pending row
  const reDismiss = await dismissRecommendation({ recommendationId: sent.id, userId: receiver.id });
  if (reDismiss) throw new Error("cannot dismiss non-pending row");

  // stranger cannot dismiss receiver's recommendation
  const sent5 = await sendRecommendation({
    senderId: sender.id,
    receiverId: receiver.id,
    bookId,
    title: "Dune",
    author: "Frank Herbert",
    formats: ["paperback"],
    note: null,
    message: null,
  });
  const strangerDismiss = await dismissRecommendation({
    recommendationId: sent5.id,
    userId: stranger.id,
  });
  if (strangerDismiss) throw new Error("stranger cannot dismiss");

  // countUnreadReceived: still 1 pending (sent5)
  const unreadAfter = await countUnreadReceived(receiver.id);
  if (unreadAfter !== 1) throw new Error(`expected 1 unread pending, got ${unreadAfter}`);

  // count for both users — should include all rows
  const senderCount = await countRecommendationsForUser(sender.id);
  const receiverCount = await countRecommendationsForUser(receiver.id);
  if (senderCount !== 4) throw new Error(`sender count wrong (got ${senderCount})`);
  if (receiverCount !== 4) throw new Error(`receiver count wrong (got ${receiverCount})`);

  // source-book deletion: bookId FK should set null, row stays
  await deleteBook(bookId);
  const rowAfterDelete = await listSent(sender.id);
  if (rowAfterDelete.length !== 4) {
    throw new Error(`recommendations should survive source book deletion (got ${rowAfterDelete.length})`);
  }
  const firstStillExists = rowAfterDelete.find((r) => r.id === sent.id);
  if (!firstStillExists) throw new Error("first recommendation missing after book delete");
  if (firstStillExists.bookId !== null) throw new Error("bookId should be set null after source deletion");
  if (firstStillExists.title !== "Dune") throw new Error("snapshot title should survive source deletion");
  if (firstStillExists.reply !== "thanks, will check it out") throw new Error("reply should survive source deletion");

  await clearAll();
  console.log("recommendations smoke ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
