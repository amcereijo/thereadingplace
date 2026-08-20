"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { copyBook, createBook, deleteBook, getBook, updateBook } from "@/lib/books";
import { canReadShelf } from "@/lib/friendships";
import { isBookStatus } from "@/lib/types";
import { readAuthor, readFormats, readMetadata, readNote, readOptionalDate, readStatus, readTitle } from "@/lib/forms";

function revalidateShelves() {
  revalidatePath("/");
  revalidatePath("/to-read");
  revalidatePath("/reading");
  revalidatePath("/read");
  revalidatePath("/abandoned");
}

export async function createBookAction(
  _prev: { error: string | null },
  formData: FormData,
) {
  const user = await requireAppUser();
  const title = readTitle(formData);
  const status = readStatus(formData);

  if (!title) return { error: "errors.titleRequired" };
  if (!status) return { error: "errors.statusRequired" };

  await createBook({
    ownerId: user.id,
    title,
    status,
    formats: readFormats(formData),
    startedAt: readOptionalDate(formData, "startedAt"),
    finishedAt: readOptionalDate(formData, "finishedAt"),
    abandonedAt: readOptionalDate(formData, "abandonedAt"),
    note: readNote(formData),
    author: readAuthor(formData),
    metadata: readMetadata(formData),
  });

  revalidateShelves();
  redirect(status === "to-read" ? "/to-read" : `/${status}`);
}

export async function updateBookAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData,
) {
  const user = await requireAppUser();
  const id = String(formData.get("id") ?? "");
  const book = await getBook(id);
  if (!book || book.ownerId !== user.id) {
    return { error: "errors.bookNotFound", success: false };
  }

  const title = readTitle(formData);
  const status = readStatus(formData);
  if (!title) return { error: "errors.titleRequired", success: false };
  if (!status) return { error: "errors.statusRequired", success: false };

  await updateBook(id, {
    title,
    status,
    formats: readFormats(formData),
    startedAt: readOptionalDate(formData, "startedAt"),
    finishedAt: readOptionalDate(formData, "finishedAt"),
    abandonedAt: readOptionalDate(formData, "abandonedAt"),
    dateAdded: readOptionalDate(formData, "dateAdded"),
    note: readNote(formData),
    author: readAuthor(formData),
    metadata: readMetadata(formData),
    oldStatus: book.status,
    currentStartedAt: book.startedAt,
  });

  revalidateShelves();
  return { error: null, success: true };
}

export async function deleteBookAction(formData: FormData) {
  const user = await requireAppUser();
  const id = String(formData.get("id") ?? "");
  const book = await getBook(id);
  if (!book || book.ownerId !== user.id) {
    return;
  }
  await deleteBook(id);
  revalidateShelves();
}

export async function copyBookFromFriendAction(
  _prev: { error: string | null },
  formData: FormData,
) {
  const user = await requireAppUser();
  const bookId = String(formData.get("bookId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!bookId) return { error: "errors.bookNotFound" };
  if (!status || !isBookStatus(status)) return { error: "errors.statusRequired" };

  const book = await getBook(bookId);
  if (!book) return { error: "errors.bookNotFound" };

  const allowed = await canReadShelf(user.id, book.ownerId);
  if (!allowed) return { error: "errors.shelfAccessDenied" };

  await copyBook(bookId, user.id, status);

  revalidateShelves();
  revalidatePath(`/u`);
  return { error: null };
}
