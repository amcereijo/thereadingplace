"use client";

import { useActionState } from "react";
import { createBookAction } from "@/app/actions/books";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { BookForm } from "./book-form";

export function CreateBookForm({ dictionary }: { dictionary: Dictionary }) {
  const [state, action] = useActionState(createBookAction, { error: null as string | null });
  return (
    <BookForm
      action={action}
      error={state?.error ? translateError(dictionary, state.error) : null}
      submitLabel={dictionary.shelf.addBook}
      cancelHref="/"
      dictionary={dictionary}
    />
  );
}

function translateError(dictionary: Dictionary, key: string): string {
  const value = dictionary[key as keyof Dictionary] as string | undefined;
  if (value) return value;
  const parts = key.split(".");
  let current: unknown = dictionary;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}
