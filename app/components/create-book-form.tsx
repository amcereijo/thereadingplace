"use client";

import { useActionState } from "react";
import { createBookAction } from "@/app/actions/books";
import { BookForm } from "./book-form";

export function CreateBookForm() {
  const [state, action] = useActionState(createBookAction, { error: null as string | null });
  return <BookForm action={action} error={state?.error} submitLabel="Add book" />;
}
