"use client";

import { useActionState, useState } from "react";
import { updateBookAction } from "@/app/actions/books";
import { BOOK_FORMATS, BOOK_STATUSES, STATUS_LABELS, type BookFormat, type BookRecord, type BookStatus } from "@/lib/types";
import { Button, ErrorMessage, Input, Label, Select, TextArea } from "./ui";

type MetaEntry = { key: string; value: string };

function entriesFromRecord(rec: Record<string, unknown>): MetaEntry[] {
  return Object.entries(rec)
    .filter(([k]) => k !== "")
    .map(([k, v]) => ({ key: k, value: String(v ?? "") }));
}

function recordFromEntries(entries: MetaEntry[]): Record<string, unknown> {
  const rec: Record<string, unknown> = {};
  for (const { key, value } of entries) {
    if (key.trim() !== "") rec[key] = value;
  }
  return rec;
}

export function EditBookForm({ book }: { book: BookRecord }) {
  const [state, action] = useActionState(updateBookAction, { error: null as string | null });

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? "");
  const [status, setStatus] = useState<BookStatus>(book.status);
  const [formats, setFormats] = useState<BookFormat[]>(book.formats);
  const [startedAt, setStartedAt] = useState(book.startedAt ?? "");
  const [finishedAt, setFinishedAt] = useState(book.finishedAt ?? "");
  const [abandonedAt, setAbandonedAt] = useState(book.abandonedAt ?? "");
  const [dateAdded, setDateAdded] = useState(book.dateAdded ?? "");
  const [note, setNote] = useState(book.note?.replace(/<br\s*\/?>/gi, "\n") ?? "");
  const [editingNote, setEditingNote] = useState(true);
  const [metaEntries, setMetaEntries] = useState<MetaEntry[]>(entriesFromRecord(book.metadata));

  function reset() {
    setTitle(book.title);
    setAuthor(book.author ?? "");
    setStatus(book.status);
    setFormats(book.formats);
    setStartedAt(book.startedAt ?? "");
    setFinishedAt(book.finishedAt ?? "");
    setAbandonedAt(book.abandonedAt ?? "");
    setDateAdded(book.dateAdded ?? "");
    setNote(book.note?.replace(/<br\s*\/?>/gi, "\n") ?? "");
    setEditingNote(true);
    setMetaEntries(entriesFromRecord(book.metadata));
  }

  function toggleFormat(format: BookFormat) {
    setFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
    );
  }

  function updateMetaEntry(index: number, field: "key" | "value", val: string) {
    setMetaEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: val } : e)));
  }

  function removeMetaEntry(index: number) {
    setMetaEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function addMetaEntry() {
    setMetaEntries((prev) => [...prev, { key: "", value: "" }]);
  }

  return (
    <form action={action} className="max-w-xl space-y-5">
      <input type="hidden" name="id" value={book.id} />
      <input type="hidden" name="formats" value={formats.join(",")} />
      <input type="hidden" name="dateAdded" value={dateAdded} />
      <input type="hidden" name="metadata" value={JSON.stringify(recordFromEntries(metaEntries))} />
      <ErrorMessage>{state?.error}</ErrorMessage>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="author">Author</Label>
        <Input id="author" name="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
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
        <legend className="mb-3 text-base font-semibold text-zinc-900">Formats</legend>
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

      <fieldset>
        <legend className="mb-3 text-base font-semibold text-zinc-900">Dates</legend>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label htmlFor="dateAdded" className="w-24 shrink-0 text-sm font-medium text-zinc-700">Added</label>
            <Input id="dateAdded" type="date" name="dateAdded" value={dateAdded} onChange={(e) => setDateAdded(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="startedAt" className="w-24 shrink-0 text-sm font-medium text-zinc-700">Started</label>
            <Input id="startedAt" type="date" name="startedAt" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="finishedAt" className="w-24 shrink-0 text-sm font-medium text-zinc-700">Finished</label>
            <Input id="finishedAt" type="date" name="finishedAt" value={finishedAt} onChange={(e) => setFinishedAt(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="abandonedAt" className="w-24 shrink-0 text-sm font-medium text-zinc-700">Abandoned</label>
            <Input id="abandonedAt" type="date" name="abandonedAt" value={abandonedAt} onChange={(e) => setAbandonedAt(e.target.value)} className="flex-1" />
          </div>
        </div>
      </fieldset>

      <div>
        <Label htmlFor="note">Note</Label>
        {editingNote ? (
          <>
            <TextArea id="note" name="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
            <Button type="button" variant="secondary" className="mt-2" onClick={() => setEditingNote(false)}>
              Done
            </Button>
          </>
        ) : (
          <>
            {note ? (
              <div
                className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700"
                dangerouslySetInnerHTML={{
                  __html: note
                    .replace(/<br\s*\/?>/gi, "\n")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\n/g, "<br/>"),
                }}
              />
            ) : (
              <p className="text-sm text-zinc-400">No note yet.</p>
            )}
            <Button type="button" variant="secondary" className="mt-2" onClick={() => setEditingNote(true)}>
              Edit
            </Button>
          </>
        )}
      </div>

      <fieldset>
        <legend className="mb-3 text-base font-semibold text-zinc-900">Metadata</legend>
        <div className="space-y-2">
          {metaEntries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Key"
                value={entry.key}
                onChange={(e) => updateMetaEntry(i, "key", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={entry.value}
                onChange={(e) => updateMetaEntry(i, "value", e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="ghost" onClick={() => removeMetaEntry(i)}>
                ✕
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" className="mt-2" onClick={addMetaEntry}>
          Add field
        </Button>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit">Save changes</Button>
        <Button type="button" variant="secondary" onClick={reset}>
          Discard changes
        </Button>
      </div>
    </form>
  );
}
