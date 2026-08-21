"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { changeBookStatusAction } from "@/app/actions/books";
import { BOOK_STATUSES, getStatusLabel, type BookStatus } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ErrorMessage } from "./ui";

type Props = {
  bookId: string;
  currentStatus: BookStatus;
  dictionary: Dictionary;
};

export function ChangeStatusButton({ bookId, currentStatus, dictionary }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(changeBookStatusAction, {
    error: null as string | null,
    success: false as boolean,
  });

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <div className="relative inline-block">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {dictionary.shelf.changeStatus}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">{dictionary.shelf.changeStatus}</h3>

            <form action={formAction} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={bookId} />
              <select
                name="status"
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                defaultValue={currentStatus}
              >
                {BOOK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(dictionary, s)}
                  </option>
                ))}
              </select>

              {state.error ? <ErrorMessage>{translateError(dictionary, state.error)}</ErrorMessage> : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {dictionary.bookForm.cancel}
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? dictionary.shelf.saving : dictionary.shelf.save}
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
