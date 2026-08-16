"use client";

import { useMemo, useState } from "react";
import { deleteBookAction } from "@/app/actions/books";
import { type BookRecord, STATUS_LABELS } from "@/lib/types";
import { AddToShelfButton } from "./add-to-shelf-button";
import { Button, Card, EmptyState, LinkButton, StatusBadge } from "./ui";

type SortKey = "dateAdded" | "title" | "finishedAt";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: `${SortKey}-${SortDir}`; label: string }[] = [
  { value: "dateAdded-desc", label: "Date added (newest)" },
  { value: "dateAdded-asc", label: "Date added (oldest)" },
  { value: "title-asc", label: "Title (A–Z)" },
  { value: "title-desc", label: "Title (Z–A)" },
  { value: "finishedAt-desc", label: "Finished (newest)" },
  { value: "finishedAt-asc", label: "Finished (oldest)" },
];

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

function renderNoteHtml(note: string): string {
  const withBreaks = note.replace(/<br\s*\/?>/gi, "\n");
  const escaped = withBreaks
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\n/g, "<br/>");
}

type Props = {
  books: BookRecord[];
  editable?: boolean;
  friendView?: boolean;
};

export function BookList({ books, editable = false, friendView = false }: Props) {
  const [sort, setSort] = useState<`${SortKey}-${SortDir}`>("dateAdded-desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const [key, dir] = sort.split("-") as [SortKey, SortDir];
    return [...books].sort((a, b) => compareBooks(a, b, key, dir));
  }, [books, sort]);

  if (books.length === 0) {
    return <EmptyState>No books here yet.</EmptyState>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="sort" className="text-sm font-medium text-zinc-700">
          Sort
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as `${SortKey}-${SortDir}`)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-3">
        {sorted.map((book) => {
          const expanded = expandedId === book.id;
          return (
            <li key={book.id}>
              <Card className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-zinc-900">{book.title}</h2>
                      <StatusBadge status={book.status} />
                    </div>
                    {book.formats.length > 0 ? (
                      <p className="mt-1 text-sm text-zinc-500">{book.formats.join(" · ")}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-zinc-400">
                      {[
                        book.dateAdded && `added ${book.dateAdded}`,
                        book.startedAt && `started ${book.startedAt}`,
                        book.finishedAt && `finished ${book.finishedAt}`,
                        book.abandonedAt && `abandoned ${book.abandonedAt}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {book.note && !expanded ? (
                      <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Notes
                        </p>
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: renderNoteHtml(book.note) }}
                        />
                      </div>
                    ) : null}
                  </div>
                  {editable ? (
                    <div className="flex items-center gap-2">
                      <LinkButton variant="secondary" href={`/books/${book.id}/edit`}>
                        Edit
                      </LinkButton>
                      <form action={deleteBookAction}>
                        <input type="hidden" name="id" value={book.id} />
                        <Button type="submit" variant="danger">
                          Delete
                        </Button>
                      </form>
                    </div>
                  ) : friendView ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setExpandedId(expanded ? null : book.id)}
                      >
                        {expanded ? "Show less" : "Details"}
                      </Button>
                      <AddToShelfButton bookId={book.id} />
                    </div>
                  ) : null}
                </div>

                {expanded ? (
                  <div className="border-t border-zinc-100 pt-4 text-sm">
                    <dl className="space-y-3">
                      <div className="flex gap-2">
                        <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                          Status
                        </dt>
                        <dd className="text-zinc-900">{STATUS_LABELS[book.status]}</dd>
                      </div>

                      {book.formats.length > 0 ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            Formats
                          </dt>
                          <dd className="text-zinc-900">{book.formats.join(", ")}</dd>
                        </div>
                      ) : null}

                      {book.dateAdded ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            Date Added
                          </dt>
                          <dd className="text-zinc-900">{book.dateAdded}</dd>
                        </div>
                      ) : null}

                      {book.startedAt ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            Started
                          </dt>
                          <dd className="text-zinc-900">{book.startedAt}</dd>
                        </div>
                      ) : null}

                      {book.finishedAt ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            Finished
                          </dt>
                          <dd className="text-zinc-900">{book.finishedAt}</dd>
                        </div>
                      ) : null}

                      {book.abandonedAt ? (
                        <div className="flex gap-2">
                          <dt className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            Abandoned
                          </dt>
                          <dd className="text-zinc-900">{book.abandonedAt}</dd>
                        </div>
                      ) : null}

                      {book.note ? (
                        <div>
                          <dt className="mb-1 inline-block rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            Note
                          </dt>
                          <dd className="whitespace-pre-wrap text-zinc-900">{book.note}</dd>
                        </div>
                      ) : null}

                      {Object.keys(book.metadata).length > 0 ? (
                        <div>
                          <dt className="mb-2 inline-block rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-800">
                            Metadata
                          </dt>
                          <dd className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                            <dl className="grid grid-cols-[minmax(0,auto),1fr] gap-x-4 gap-y-2 text-sm">
                              {Object.entries(book.metadata).map(([key, value]) => (
                                <div key={key} className="contents">
                                  <dt className="truncate font-semibold text-zinc-700" title={key}>
                                    {key}
                                  </dt>
                                  <dd className="break-words text-zinc-900">
                                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                  </dd>
                                </div>
                              ))}
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
