"use client";

import { useActionState, useState } from "react";
import { BookmarkPlus } from "lucide-react";
import { copyBookFromFriendAction } from "@/app/actions/books";
import { BOOK_STATUSES, getStatusLabel } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ErrorMessage, IconButton } from "./ui";

type Props = {
  bookId: string;
  dictionary: Dictionary;
  ariaLabel?: string;
};

export function AddToShelfButton({ bookId, dictionary, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (_prev: { error: string | null }, formData: FormData) => {
    const result = await copyBookFromFriendAction({ error: null }, formData);
    if (!result.error) setOpen(false);
    return result;
  }, { error: null });

  return (
    <div className="relative inline-block">
      {ariaLabel ? (
        <IconButton
          variant="secondary"
          onClick={() => setOpen(true)}
          aria-label={ariaLabel}
          title={dictionary.addToShelf.title}
          icon={<BookmarkPlus className="h-5 w-5" />}
        />
      ) : (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {dictionary.addToShelf.title}
        </Button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">{dictionary.addToShelf.title}</h3>
            <p className="mt-1 text-sm text-zinc-600">{dictionary.addToShelf.description}</p>

            <form action={formAction} className="mt-4 space-y-4">
              <input type="hidden" name="bookId" value={bookId} />
              <select
                name="status"
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                defaultValue=""
              >
                <option value="" disabled>
                  {dictionary.addToShelf.selectStatus}
                </option>
                {BOOK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(dictionary, s)}
                  </option>
                ))}
              </select>

              {state.error ? <ErrorMessage>{translateError(dictionary, state.error)}</ErrorMessage> : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {dictionary.addToShelf.cancel}
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? dictionary.addToShelf.confirming : dictionary.addToShelf.confirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function translateError(dictionary: Dictionary, key: string): string {
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
