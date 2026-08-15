"use client";

import { useActionState } from "react";
import { updateBookAction } from "@/app/actions/books";
import type { BookRecord } from "@/lib/types";
import { BookForm } from "./book-form";

export function EditBookForm({ book }: { book: BookRecord }) {
  const [state, action] = useActionState(updateBookAction, { error: null as string | null });
  return <BookForm action={action} book={book} error={state?.error} submitLabel="Save" />;
}
