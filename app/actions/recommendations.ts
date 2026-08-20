"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/lib/auth";
import { getBook } from "@/lib/books";
import { areAcceptedFriends } from "@/lib/friendships";
import {
  acceptRecommendation,
  dismissRecommendation,
  sendRecommendation,
} from "@/lib/recommendations";
import { isBookStatus } from "@/lib/types";

function revalidateRecommendationViews() {
  revalidatePath("/recommendations");
  revalidatePath("/");
  revalidatePath("/to-read");
  revalidatePath("/reading");
  revalidatePath("/read");
  revalidatePath("/abandoned");
}

export async function sendRecommendationAction(
  _prev: { error: string | null; ok: string | null },
  formData: FormData,
) {
  const user = await requireAppUser();
  const bookId = String(formData.get("bookId") ?? "");
  const receiverId = String(formData.get("receiverId") ?? "");
  const message = String(formData.get("message") ?? "");

  if (!bookId) return { error: "errors.bookNotFound", ok: null };
  if (!receiverId) return { error: "errors.receiverRequired", ok: null };

  const book = await getBook(bookId);
  if (!book || book.ownerId !== user.id) return { error: "errors.bookNotFound", ok: null };

  if (receiverId === user.id) return { error: "errors.cannotRecommendSelf", ok: null };

  const friends = await areAcceptedFriends(user.id, receiverId);
  if (!friends) return { error: "errors.notFriends", ok: null };

  await sendRecommendation({
    senderId: user.id,
    receiverId,
    bookId,
    title: book.title,
    author: book.author,
    formats: book.formats,
    note: book.note,
    message: message.trim() ? message.trim() : null,
  });

  revalidateRecommendationViews();
  return { error: null, ok: "recommendations.sent" };
}

export async function acceptRecommendationAction(
  _prev: { error: string | null; ok: string | null },
  formData: FormData,
) {
  const user = await requireAppUser();
  const recommendationId = String(formData.get("recommendationId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const reply = String(formData.get("reply") ?? "");
  if (!recommendationId) return { error: "errors.recommendationNotFound", ok: null };
  if (!isBookStatus(statusRaw)) return { error: "errors.statusRequired", ok: null };

  const newBookId = await acceptRecommendation({
    recommendationId,
    userId: user.id,
    status: statusRaw,
    reply: reply.trim() ? reply.trim() : null,
  });
  if (!newBookId) return { error: "errors.recommendationNotFound", ok: null };

  revalidateRecommendationViews();
  return { error: null, ok: "recommendations.accepted" };
}

export async function dismissRecommendationAction(formData: FormData) {
  const user = await requireAppUser();
  const recommendationId = String(formData.get("recommendationId") ?? "");
  const reply = String(formData.get("reply") ?? "");
  if (!recommendationId) return;
  await dismissRecommendation({
    recommendationId,
    userId: user.id,
    reply: reply.trim() ? reply.trim() : null,
  });
  revalidateRecommendationViews();
}
