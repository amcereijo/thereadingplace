"use client";

import { useActionState, useState } from "react";
import { updateBookAction } from "@/app/actions/books";
import { BOOK_FORMATS, BOOK_STATUSES, STATUS_LABELS, type BookFormat, type BookRecord, type BookStatus } from "@/lib/types";
import { Button, ErrorMessage, Input, Label, Select, TextArea } from "./ui";

export function EditBookForm({ book }: { book: BookRecord }) {
  const [state, action] = useActionState(updateBookAction, { error: null as string | null });

  const [title, setTitle] = useState(book.title);
  const [status, setStatus] = useState<BookStatus>(book.status);
  const [formats, setFormats] = useState<BookFormat[]>(book.formats);
  const [startedAt, setStartedAt] = useState(book.startedAt ?? "");
  const [finishedAt, setFinishedAt] = useState(book.finishedAt ?? "");
  const [abandonedAt, setAbandonedAt] = useState(book.abandonedAt ?? "");
  const [note, setNote] = useState(book.note ?? "");

  function reset() {
    setTitle(book.title);
    setStatus(book.status);
    setFormats(book.formats);
    setStartedAt(book.startedAt ?? "");
    setFinishedAt(book.finishedAt ?? "");
    setAbandonedAt(book.abandonedAt ?? "");
    setNote(book.note ?? "");
  }

  function toggleFormat(format: BookFormat) {
    setFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
    );
  }

  return (
    <form action={action} className="max-w-xl space-y-5">
      <input type="hidden" name="id" value={book.id} />
      <input type="hidden" name="formats" value={formats.join(",")} />
      <ErrorMessage>{state?.error}</ErrorMessage>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-700">Formats</legend>
        <div className="flex flex-wrap gap-3 text-sm text-zinc-700">
          {BOOK_FORMATS.map((format) => (
            <label key={format} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-zinc-200">
              <input
                type="checkbox"
                checked={formats.includes(format)}
                onChange={() => toggleFormat(format)}
                className="h-4 w-4 text-teal-700 focus:ring-teal-600"
              />
              {format}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="startedAt">Started</Label>
          <Input id="startedAt" type="date" name="startedAt" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="finishedAt">Finished</Label>
          <Input id="finishedAt" type="date" name="finishedAt" value={finishedAt} onChange={(e) => setFinishedAt(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="abandonedAt">Abandoned</Label>
          <Input id="abandonedAt" type="date" name="abandonedAt" value={abandonedAt} onChange={(e) => setAbandonedAt(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="note">Note</Label>
        <TextArea id="note" name="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">Save changes</Button>
        <Button type="button" variant="secondary" onClick={reset}>
          Discard changes
        </Button>
      </div>
    </form>
  );
}
