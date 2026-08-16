"use client";

import { useActionState, useState } from "react";
import { copyBookFromFriendAction } from "@/app/actions/books";
import { BOOK_STATUSES, STATUS_LABELS } from "@/lib/types";
import { Button, ErrorMessage } from "./ui";

type Props = {
  bookId: string;
};

export function AddToShelfButton({ bookId }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (_prev: { error: string | null }, formData: FormData) => {
    const result = await copyBookFromFriendAction({ error: null }, formData);
    if (!result.error) setOpen(false);
    return result;
  }, { error: null });

  return (
    <div className="relative inline-block">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Add to my shelf
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">Add to my shelf</h3>
            <p className="mt-1 text-sm text-zinc-600">Choose a status for this book.</p>

            <form action={formAction} className="mt-4 space-y-4">
              <input type="hidden" name="bookId" value={bookId} />
              <select
                name="status"
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                defaultValue=""
              >
                <option value="" disabled>
                  Select status…
                </option>
                {BOOK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              {state.error ? <ErrorMessage>{state.error}</ErrorMessage> : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Confirming…" : "Confirm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
