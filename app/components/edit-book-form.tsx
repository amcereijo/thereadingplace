"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { updateBookAction } from "@/app/actions/books";
import { BOOK_FORMATS, BOOK_STATUSES, getStatusLabel, type AppUser, type BookFormat, type BookRecord, type BookStatus } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ErrorMessage, IconButton, Input, Label, Select, SuccessMessage, TextArea } from "./ui";
import { RecommendPanel } from "./recommend-panel";
import { deleteBookAction } from "@/app/actions/books";

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

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function computeDatesOnStatusChange(
  newStatus: BookStatus,
  oldStatus: BookStatus,
  currentStartedAt: string,
): { startedAt: string | undefined | null; finishedAt: string | undefined | null; abandonedAt: string | undefined | null } {
  if (newStatus === oldStatus) {
    return { startedAt: undefined, finishedAt: undefined, abandonedAt: undefined };
  }

  const today = todayYmd();

  switch (newStatus) {
    case "read":
      return { startedAt: undefined, finishedAt: today, abandonedAt: null };
    case "reading":
      return { startedAt: currentStartedAt || today, finishedAt: null, abandonedAt: null };
    case "abandoned":
      return { startedAt: undefined, finishedAt: null, abandonedAt: today };
    case "to-read":
      return { startedAt: null, finishedAt: null, abandonedAt: null };
  }
}

export function EditBookForm({
  book,
  dictionary,
  recommendFriends,
}: {
  book: BookRecord;
  dictionary: Dictionary;
  recommendFriends?: AppUser[];
}) {
  const router = useRouter();
  const [state, action] = useActionState(updateBookAction, { error: null as string | null, success: false as boolean });

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? "");
  const [status, setStatus] = useState<BookStatus>(book.status);
  const [formats, setFormats] = useState<BookFormat[]>(book.formats);
  const [startedAt, setStartedAt] = useState<string>(book.startedAt ?? "");
  const [finishedAt, setFinishedAt] = useState<string>(book.finishedAt ?? "");
  const [abandonedAt, setAbandonedAt] = useState<string>(book.abandonedAt ?? "");
  const [dateAdded, setDateAdded] = useState(book.dateAdded?.slice(0, 10) ?? "");
  const [note, setNote] = useState(book.note?.replace(/<br\s*\/?>/gi, "\n") ?? "");
  const [editingNote, setEditingNote] = useState(true);
  const [metaEntries, setMetaEntries] = useState<MetaEntry[]>(entriesFromRecord(book.metadata));

  // Sync local state when book prop changes (e.g. after router.refresh())
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTitle(book.title);
    setAuthor(book.author ?? "");
    setStatus(book.status);
    setFormats(book.formats);
    setStartedAt(book.startedAt ?? "");
    setFinishedAt(book.finishedAt ?? "");
    setAbandonedAt(book.abandonedAt ?? "");
    setDateAdded(book.dateAdded?.slice(0, 10) ?? "");
    setNote(book.note?.replace(/<br\s*\/?>/gi, "\n") ?? "");
    setMetaEntries(entriesFromRecord(book.metadata));
  }, [book]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  function handleStatusChange(newStatus: BookStatus) {
    const dates = computeDatesOnStatusChange(newStatus, status, startedAt);
    setStatus(newStatus);
    if (dates.startedAt !== undefined) setStartedAt(dates.startedAt ?? "");
    if (dates.finishedAt !== undefined) setFinishedAt(dates.finishedAt ?? "");
    if (dates.abandonedAt !== undefined) setAbandonedAt(dates.abandonedAt ?? "");
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
      <ErrorMessage>{state?.error ? translateError(dictionary, state.error) : null}</ErrorMessage>

      <div>
        <Label htmlFor="title">{dictionary.bookForm.title}</Label>
        <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="author">{dictionary.bookForm.author}</Label>
        <Input id="author" name="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="status">{dictionary.bookForm.status}</Label>
        <Select id="status" name="status" value={status} onChange={(e) => handleStatusChange(e.target.value as BookStatus)}>
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(dictionary, s)}
            </option>
          ))}
        </Select>
      </div>

      <fieldset>
        <legend className="mb-3 text-base font-semibold text-zinc-900">{dictionary.bookForm.formats}</legend>
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
        <legend className="mb-3 text-base font-semibold text-zinc-900">{dictionary.bookForm.dates}</legend>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label htmlFor="dateAdded" className="w-24 shrink-0 text-sm font-medium text-zinc-700">{dictionary.bookForm.added}</label>
            <Input id="dateAdded" type="date" name="dateAdded" value={dateAdded} onChange={(e) => setDateAdded(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="startedAt" className="w-24 shrink-0 text-sm font-medium text-zinc-700">{dictionary.bookForm.started}</label>
            <Input id="startedAt" type="date" name="startedAt" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="finishedAt" className="w-24 shrink-0 text-sm font-medium text-zinc-700">{dictionary.bookForm.finished}</label>
            <Input id="finishedAt" type="date" name="finishedAt" value={finishedAt} onChange={(e) => setFinishedAt(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="abandonedAt" className="w-24 shrink-0 text-sm font-medium text-zinc-700">{dictionary.bookForm.abandoned}</label>
            <Input id="abandonedAt" type="date" name="abandonedAt" value={abandonedAt} onChange={(e) => setAbandonedAt(e.target.value)} className="flex-1" />
          </div>
        </div>
      </fieldset>

      <div>
        <Label htmlFor="note">{dictionary.bookForm.note}</Label>
        {editingNote ? (
          <>
            <TextArea id="note" name="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
            <Button type="button" variant="secondary" className="mt-2" onClick={() => setEditingNote(false)}>
              {dictionary.bookForm.done}
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
              <p className="text-sm text-zinc-400">{dictionary.bookForm.noNote}</p>
            )}
            <Button type="button" variant="secondary" className="mt-2" onClick={() => setEditingNote(true)}>
              {dictionary.bookForm.edit}
            </Button>
          </>
        )}
      </div>

      <fieldset>
        <legend className="mb-3 text-base font-semibold text-zinc-900">{dictionary.bookForm.metadata}</legend>
        <div className="space-y-2">
          {metaEntries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder={dictionary.bookForm.metadata}
                value={entry.key}
                onChange={(e) => updateMetaEntry(i, "key", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder={dictionary.bookForm.metadata}
                value={entry.value}
                onChange={(e) => updateMetaEntry(i, "value", e.target.value)}
                className="flex-1"
              />
              <IconButton
                type="button"
                variant="ghost"
                onClick={() => removeMetaEntry(i)}
                aria-label={dictionary.bookForm.removeFieldAria}
                icon={<X className="h-5 w-5" />}
              />
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" className="mt-2" onClick={addMetaEntry}>
          {dictionary.bookForm.addField}
        </Button>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit">{dictionary.bookForm.saveChanges}</Button>
        <Button type="button" variant="secondary" onClick={reset}>
          {dictionary.bookForm.discardChanges}
        </Button>
        {recommendFriends ? (
          <RecommendPanel
            bookId={book.id}
            friends={recommendFriends}
            dictionary={dictionary}
          />
        ) : null}
        {state?.success && <SuccessMessage>{dictionary.bookForm.changesSaved}</SuccessMessage>}
      </div>

      <form action={deleteBookAction} className="border-t border-zinc-200 pt-5">
        <input type="hidden" name="id" value={book.id} />
        <Button type="submit" variant="danger">
          {dictionary.shelf.delete}
        </Button>
      </form>
    </form>
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
