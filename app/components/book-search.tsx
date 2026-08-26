"use client";

import { useEffect, useRef, useState } from "react";
import type { NormalizedVolume } from "@/lib/google-books";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  locale: Locale;
  dictionary: Dictionary;
  onSelect: (volume: NormalizedVolume) => void;
};

type FetchState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "results"; volumes: NormalizedVolume[] }
  | { kind: "empty" }
  | { kind: "error" }
  | { kind: "hidden" };

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 500;

export function BookSearch({ locale, dictionary, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [state, setState] = useState<FetchState>({ kind: "idle" });
  const [showResults, setShowResults] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);

  const t = dictionary.bookSearch;

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "hidden" });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setState({ kind: "loading" });
      fetch(
        `/api/books/search?q=${encodeURIComponent(trimmed)}&lang=${encodeURIComponent(locale)}`,
        { signal: controller.signal },
      )
        .then(async (res) => {
          if (res.status === 502) {
            setState({ kind: "error" });
            return;
          }
          if (!res.ok) {
            setState({ kind: "hidden" });
            return;
          }
          const body = (await res.json()) as { results?: NormalizedVolume[] };
          const volumes = Array.isArray(body.results) ? body.results : [];
          setState(volumes.length === 0 ? { kind: "empty" } : { kind: "results", volumes });
          setHighlight(0);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setState({ kind: "error" });
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, locale]);

  const volumes = state.kind === "results" ? state.volumes : [];

  function commit(volume: NormalizedVolume) {
    onSelect(volume);
    setQuery("");
    setShowResults(false);
    setState({ kind: "idle" });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      if (volumes.length === 0) return;
      e.preventDefault();
      setHighlight((h) => (h + 1) % volumes.length);
      setShowResults(true);
    } else if (e.key === "ArrowUp") {
      if (volumes.length === 0) return;
      e.preventDefault();
      setHighlight((h) => (h - 1 + volumes.length) % volumes.length);
      setShowResults(true);
    } else if (e.key === "Enter") {
      if (volumes.length > 0 && highlight >= 0 && highlight < volumes.length) {
        e.preventDefault();
        commit(volumes[highlight]);
      }
    } else if (e.key === "Escape") {
      setQuery("");
      setShowResults(false);
      setState({ kind: "idle" });
    }
  }

  function shouldShowDropdown(): boolean {
    if (!showResults) return false;
    if (state.kind === "loading") return true;
    if (state.kind === "results") return true;
    if (state.kind === "empty") return true;
    if (state.kind === "error") return true;
    return false;
  }

  const dropdownVisible = shouldShowDropdown();

  return (
    <div className="relative max-w-xl">
      <label htmlFor="book-search" className="sr-only">
        {t.placeholder}
      </label>
      <input
        id="book-search"
        type="text"
        autoComplete="off"
        role="combobox"
        placeholder={t.placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => window.setTimeout(() => setShowResults(false), 120)}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-expanded={dropdownVisible}
        aria-controls="book-search-results"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
      />
      {dropdownVisible ? (
        <ul
          id="book-search-results"
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 z-10 mt-1 max-h-72 overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg"
        >
          {state.kind === "loading" ? (
            <li className="px-3 py-2 text-sm text-zinc-500">{t.loading}</li>
          ) : state.kind === "empty" ? (
            <li className="px-3 py-2 text-sm text-zinc-500">{t.noResults}</li>
          ) : state.kind === "error" ? (
            <li className="px-3 py-2 text-sm text-zinc-500">{t.error}</li>
          ) : state.kind === "results" ? (
            state.volumes.map((volume, i) => {
              const authorLine = volume.authors.length > 0 ? volume.authors.join(", ") : t.unknownAuthor;
              const year = volume.publishedDate?.slice(0, 4) ?? "";
              return (
                <li
                  key={volume.id}
                  role="option"
                  aria-selected={i === highlight}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(volume);
                  }}
                  className={
                    "cursor-pointer px-3 py-2 text-sm " +
                    (i === highlight ? "bg-teal-50 text-zinc-900" : "text-zinc-800")
                  }
                >
                  <div className="font-medium">{volume.title}</div>
                  <div className="text-xs text-zinc-500">
                    {authorLine}
                    {year ? ` · ${year}` : ""}
                  </div>
                </li>
              );
            })
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
