"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { createBook, deleteBook, getBook, updateBook } from "@/lib/books";
import { readFormats, readNote, readOptionalDate, readStatus, readTitle } from "@/lib/forms";

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

  if (!title) return { error: "A title is required." };
  if (!status) return { error: "Choose a status." };

  await createBook({
    ownerId: user.id,
    title,
    status,
    formats: readFormats(formData),
    startedAt: readOptionalDate(formData, "startedAt"),
    finishedAt: readOptionalDate(formData, "finishedAt"),
    abandonedAt: readOptionalDate(formData, "abandonedAt"),
    note: readNote(formData),
  });

  revalidateShelves();
  redirect(status === "to-read" ? "/to-read" : `/${status}`);
}

export async function updateBookAction(
  _prev: { error: string | null },
  formData: FormData,
) {
  const user = await requireAppUser();
  const id = String(formData.get("id") ?? "");
  const book = await getBook(id);
  if (!book || book.ownerId !== user.id) {
    return { error: "Book not found." };
  }

  const title = readTitle(formData);
  const status = readStatus(formData);
  if (!title) return { error: "A title is required." };
  if (!status) return { error: "Choose a status." };

  await updateBook(id, {
    title,
    status,
    formats: readFormats(formData),
    startedAt: readOptionalDate(formData, "startedAt"),
    finishedAt: readOptionalDate(formData, "finishedAt"),
    abandonedAt: readOptionalDate(formData, "abandonedAt"),
    note: readNote(formData),
  });

  revalidateShelves();
  return { error: null };
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
