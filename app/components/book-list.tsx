"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { deleteBookAction } from "@/app/actions/books";
import { type AppUser, type BookRecord } from "@/lib/types";
import { type Dictionary, createT } from "@/lib/i18n/dictionaries";
import { formatBookDate } from "@/lib/i18n/format-date";
import type { Locale } from "@/lib/i18n/locales";
import { AddToShelfButton } from "./add-to-shelf-button";
import { BookCover } from "./book-cover";
import { ChangeStatusButton } from "./change-status-button";
import { RecommendPanel } from "./recommend-panel";
import { Card, EmptyState, IconButton, IconLinkButton, StatusBadge, cn } from "./ui";

function DeleteBookSubmit({
  ariaLabel,
  title,
  icon,
}: {
  ariaLabel: string;
  title: string;
  icon: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <IconButton
      type="submit"
      variant="danger"
      aria-label={ariaLabel}
      title={title}
      icon={icon}
      loading={pending}
    />
  );
}

type SortKey = "dateAdded" | "title" | "finishedAt";
type SortDir = "asc" | "desc";

type Props = {
  books: BookRecord[];
  editable?: boolean;
  friendView?: boolean;
  dictionary: Dictionary;
  locale: Locale;
  recommendFriends?: AppUser[];
};

function useSortOptions(dictionary: Dictionary): { value: `${SortKey}-${SortDir}`; label: string }[] {
  return [
    { value: "dateAdded-desc", label: dictionary.shelf.sortDateAddedDesc },
    { value: "dateAdded-asc", label: dictionary.shelf.sortDateAddedAsc },
    { value: "title-asc", label: dictionary.shelf.sortTitleAsc },
    { value: "title-desc", label: dictionary.shelf.sortTitleDesc },
    { value: "finishedAt-desc", label: dictionary.shelf.sortFinishedDesc },
    { value: "finishedAt-asc", label: dictionary.shelf.sortFinishedAsc },
  ];
}

function compareBooks(a: BookRecord, b: BookRecord, key: SortKey, dir: SortDir): number {
  const mul = dir === "asc" ? 1 : -1;

  if (key === "title") {
    return mul * a.title.localeCompare(b.title);
  }

  const aVal = key === "dateAdded" ? a.dateAdded : a.finishedAt;
  const bVal = key === "dateAdded" ? b.dateAdded : b.finishedAt;

  if (!aVal && !bVal) return 0;
  if (!aVal) return 1;
  if (!bVal) return -1;
  return mul * aVal.localeCompare(bVal);
}

function formatMetadataValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function coverUrlFromMetadata(metadata: Record<string, unknown>): string | null {
  const raw = metadata.coverUrl;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}

function isCompactMetadataValue(value: string): boolean {
  return value.length <= 48 && !value.includes("\n");
}

function MetadataValue({ value }: { value: string }) {
  if (isHttpUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-teal-700 underline-offset-2 hover:text-teal-800 hover:underline"
      >
        {value}
      </a>
    );
  }
  return <span className="whitespace-pre-wrap break-words">{value}</span>;
}

function lastMeaningfulDate(
  book: BookRecord,
  formatDate: (value: string | null | undefined) => string | null,
  t: ReturnType<typeof createT>,
): string | null {
  const candidates: Array<{ value: string | null; key: "finishedOn" | "startedOn" | "abandonedOn" | "addedOn" }> = [
    { value: book.finishedAt, key: "finishedOn" },
    { value: book.startedAt, key: "startedOn" },
    { value: book.abandonedAt, key: "abandonedOn" },
    { value: book.dateAdded, key: "addedOn" },
  ];
  for (const candidate of candidates) {
    const formatted = formatDate(candidate.value);
    if (formatted) {
      return t(`shelf.${candidate.key}`, { date: formatted });
    }
  }
  return null;
}

export function BookList({
  books,
  editable = false,
  friendView = false,
  dictionary,
  locale,
  recommendFriends,
}: Props) {
  const [sort, setSort] = useState<`${SortKey}-${SortDir}`>("dateAdded-desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sortOptions = useSortOptions(dictionary);
  const t = useMemo(() => createT(dictionary), [dictionary]);

  const formatDate = (value: string | null | undefined): string | null =>
    formatBookDate(value, locale);

  const sorted = useMemo(() => {
    const [key, dir] = sort.split("-") as [SortKey, SortDir];
    return [...books].sort((a, b) => compareBooks(a, b, key, dir));
  }, [books, sort]);

  if (books.length === 0) {
    return <EmptyState>{dictionary.shelf.empty}</EmptyState>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <label htmlFor="sort" className="shrink-0 text-sm font-medium text-zinc-700">
          {dictionary.shelf.sort}
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as `${SortKey}-${SortDir}`)}
          className="min-w-0 max-w-full flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 sm:flex-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-3">
        {sorted.map((book) => {
          const expanded = expandedId === book.id;
          const lastDate = lastMeaningfulDate(book, formatDate, t);
          return (
            <li key={book.id}>
              <Card className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <BookCover
                    url={coverUrlFromMetadata(book.metadata)}
                    bookTitle={book.title}
                    dictionary={dictionary}
                    className="self-start"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="min-w-0 text-base font-semibold text-zinc-900 break-words">
                      {book.title}
                      {book.author ? <span className="font-normal text-zinc-600"> {dictionary.shelf.by} {book.author}</span> : null}
                    </h2>
                    {editable ? (
                      <>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <StatusBadge status={book.status} dictionary={dictionary} />
                          {lastDate ? <p className="text-xs text-zinc-400">{lastDate}</p> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : book.id)}
                          aria-label={expanded ? dictionary.shelf.showLessAria : dictionary.shelf.seeMoreAria}
                          aria-expanded={expanded}
                          className="mt-2 inline-flex items-center gap-1 self-end text-sm font-medium text-teal-700 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1 rounded"
                        >
                          <span>{expanded ? dictionary.shelf.showLess : dictionary.shelf.seeMore}</span>
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <StatusBadge status={book.status} dictionary={dictionary} />
                          {lastDate ? <p className="text-xs text-zinc-400">{lastDate}</p> : null}
                        </div>
                      </>
                    )}
                  </div>
                  {editable ? (
                    <div className="flex flex-row items-center gap-1 self-end sm:self-start">
                      <ChangeStatusButton
                        bookId={book.id}
                        currentStatus={book.status}
                        dictionary={dictionary}
                        ariaLabel={dictionary.shelf.changeStatusAria}
                      />
                      <IconLinkButton
                        variant="secondary"
                        href={`/books/${book.id}/edit`}
                        aria-label={dictionary.shelf.editAria}
                        title={dictionary.shelf.edit}
                        icon={<Pencil className="h-5 w-5" />}
                      />
                      {recommendFriends ? (
                        <RecommendPanel
                          bookId={book.id}
                          friends={recommendFriends}
                          dictionary={dictionary}
                          ariaLabel={dictionary.shelf.recommendAria}
                        />
                      ) : null}
                      <form action={deleteBookAction}>
                        <input type="hidden" name="id" value={book.id} />
                        <DeleteBookSubmit
                          ariaLabel={dictionary.shelf.deleteAria}
                          title={dictionary.shelf.delete}
                          icon={<Trash2 className="h-5 w-5" />}
                        />
                      </form>
                    </div>
                  ) : friendView ? (
                    <div className="flex items-center gap-1">
                      <IconButton
                        variant="secondary"
                        onClick={() => setExpandedId(expanded ? null : book.id)}
                        aria-label={expanded ? dictionary.shelf.showLessAria : dictionary.shelf.detailsAria}
                        title={expanded ? dictionary.shelf.showLess : dictionary.shelf.details}
                        icon={expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      />
                      <AddToShelfButton
                        bookId={book.id}
                        dictionary={dictionary}
                        ariaLabel={dictionary.shelf.addToShelfAria}
                      />
                    </div>
                  ) : null}
                </div>

                {expanded ? (
                  <div className="border-t border-zinc-100 pt-4 text-sm">
                    <dl className="space-y-3">
                      <div className="flex gap-2">
                        <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                          {dictionary.shelf.status}
                        </dt>
                        <dd className="text-zinc-900">{dictionary.status[book.status]}</dd>
                      </div>

                      {book.formats.length > 0 ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            {dictionary.shelf.formats}
                          </dt>
                          <dd className="text-zinc-900">{book.formats.join(", ")}</dd>
                        </div>
                      ) : null}

                      {book.dateAdded ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            {dictionary.shelf.dateAdded}
                          </dt>
                          <dd className="text-zinc-900">{formatDate(book.dateAdded)}</dd>
                        </div>
                      ) : null}

                      {book.startedAt ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            {dictionary.shelf.startedAt}
                          </dt>
                          <dd className="text-zinc-900">{formatDate(book.startedAt)}</dd>
                        </div>
                      ) : null}

                      {book.finishedAt ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            {dictionary.shelf.finishedAt}
                          </dt>
                          <dd className="text-zinc-900">{formatDate(book.finishedAt)}</dd>
                        </div>
                      ) : null}

                      {book.abandonedAt ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            {dictionary.shelf.abandonedAt}
                          </dt>
                          <dd className="text-zinc-900">{formatDate(book.abandonedAt)}</dd>
                        </div>
                      ) : null}

                      {book.note ? (
                        <div>
                          <dt className="mb-1 inline-block rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            {dictionary.shelf.note}
                          </dt>
                          <dd className="whitespace-pre-wrap text-zinc-900">{book.note}</dd>
                        </div>
                      ) : null}

                      {Object.keys(book.metadata).length > 0 ? (
                        <div>
                          <dt className="mb-2 inline-block rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            {dictionary.shelf.metadata}
                          </dt>
                          <dd className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                            <dl>
                              {Object.entries(book.metadata).map(([key, rawValue], index) => {
                                const value = formatMetadataValue(rawValue);
                                const compact = isCompactMetadataValue(value);
                                return (
                                  <div
                                    key={key}
                                    className={cn(
                                      "px-3 py-2.5",
                                      index > 0 && "border-t border-zinc-100",
                                      compact && "flex items-baseline gap-3",
                                    )}
                                  >
                                    <dt
                                      className={cn(
                                        "text-xs font-semibold text-zinc-500",
                                        compact ? "shrink-0" : "mb-1",
                                      )}
                                      title={key}
                                    >
                                      {key}
                                    </dt>
                                    <dd className="min-w-0 text-sm text-zinc-900">
                                      <MetadataValue value={value} />
                                    </dd>
                                  </div>
                                );
                              })}
                            </dl>
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


