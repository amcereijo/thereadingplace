import type { Locale } from "@/lib/i18n/locales";

const GOOGLE_BOOKS_ENDPOINT = "https://www.googleapis.com/books/v1/volumes";
const MAX_RESULTS = 10;

export type NormalizedVolume = {
  id: string;
  title: string;
  authors: string[];
  publishedDate: string | null;
  publisher: string | null;
  pageCount: number | null;
  description: string | null;
  categories: string[] | null;
  averageRating: number | null;
  imageLinks: { thumbnail?: string; smallThumbnail?: string } | null;
  industryIdentifiers: { type: string; identifier: string }[];
};

export type SearchVolumesResult = {
  results: NormalizedVolume[];
};

type RawVolumeInfo = {
  title?: string;
  authors?: string[];
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  description?: string;
  categories?: string[];
  averageRating?: number;
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  industryIdentifiers?: { type: string; identifier: string }[];
};

type RawVolume = {
  id: string;
  volumeInfo?: RawVolumeInfo;
};

type RawResponse = {
  items?: RawVolume[];
};

export class GoogleBooksError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GoogleBooksError";
    this.status = status;
  }
}

export function searchVolumes(query: string, locale: Locale): Promise<SearchVolumesResult> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new GoogleBooksError(500, "GOOGLE_BOOKS_API_KEY is not configured"));
  }

  const url = new URL(GOOGLE_BOOKS_ENDPOINT);
  url.searchParams.set("q", cleanBookQuery(query));
  url.searchParams.set("langRestrict", locale);
  url.searchParams.set("maxResults", String(MAX_RESULTS));
  url.searchParams.set("key", apiKey);

  return fetch(url.toString(), { cache: "no-store" }).then(
    async (response) => {
      if (!response.ok) {
        throw new GoogleBooksError(
          response.status,
          `Google Books request failed with status ${response.status}`,
        );
      }
      const body = (await response.json()) as RawResponse;
      const items = Array.isArray(body.items) ? body.items : [];
      return { results: items.map((item) => normalizeVolume(item)).filter(isNormalized) };
    },
  );
}

/**
 * Look up a single volume by ISBN using the Google Books `q=isbn:<value>`
 * search syntax. Returns an empty result when nothing matches. Throws
 * `GoogleBooksError` on transport / HTTP failures.
 */
export function searchByIsbn(isbn: string, locale: Locale): Promise<SearchVolumesResult> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new GoogleBooksError(500, "GOOGLE_BOOKS_API_KEY is not configured"));
  }

  const cleaned = isbn.replace(/[\s-]/g, "");
  if (!cleaned) return Promise.resolve({ results: [] });

  const url = new URL(GOOGLE_BOOKS_ENDPOINT);
  url.searchParams.set("q", `isbn:${cleaned}`);
  url.searchParams.set("langRestrict", locale);
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("key", apiKey);

  return fetch(url.toString(), { cache: "no-store" }).then(
    async (response) => {
      if (!response.ok) {
        throw new GoogleBooksError(
          response.status,
          `Google Books request failed with status ${response.status}`,
        );
      }
      const body = (await response.json()) as RawResponse;
      const items = Array.isArray(body.items) ? body.items : [];
      return { results: items.map((item) => normalizeVolume(item)).filter(isNormalized) };
    },
  );
}

function normalizeVolume(item: RawVolume): NormalizedVolume | null {
  if (!item?.id || !item.volumeInfo) return null;
  const info = item.volumeInfo;
  const title = typeof info.title === "string" ? info.title.trim() : "";
  if (!title) return null;
  return {
    id: item.id,
    title,
    authors: Array.isArray(info.authors)
      ? info.authors.filter((a): a is string => typeof a === "string")
      : [],
    publishedDate: typeof info.publishedDate === "string" ? info.publishedDate : null,
    publisher: typeof info.publisher === "string" ? info.publisher : null,
    pageCount: typeof info.pageCount === "number" ? info.pageCount : null,
    description: typeof info.description === "string" ? info.description : null,
    categories: Array.isArray(info.categories)
      ? info.categories.filter((c): c is string => typeof c === "string")
      : null,
    averageRating: typeof info.averageRating === "number" ? info.averageRating : null,
    imageLinks:
      info.imageLinks && typeof info.imageLinks === "object"
        ? {
            thumbnail:
              typeof info.imageLinks.thumbnail === "string"
                ? info.imageLinks.thumbnail
                : undefined,
            smallThumbnail:
              typeof info.imageLinks.smallThumbnail === "string"
                ? info.imageLinks.smallThumbnail
                : undefined,
          }
        : null,
    industryIdentifiers: Array.isArray(info.industryIdentifiers)
      ? info.industryIdentifiers
          .filter(
            (id): id is { type: string; identifier: string } =>
              !!id &&
              typeof id === "object" &&
              typeof id.type === "string" &&
              typeof id.identifier === "string",
          )
      : [],
  };
}

function isNormalized(volume: NormalizedVolume | null): volume is NormalizedVolume {
  return volume !== null;
}

const AMAZON_EDITION_SUFFIXES = [
  /\s*\(Spanish Edition\)\s*$/i,
  /\s*\(English Edition\)\s*$/i,
  /\s*\(Kindle Edition\)\s*$/i,
  /\s*\(Paperback\)\s*$/i,
  /\s*\(Hardcover\)\s*$/i,
  /\s*\(Audiobook\)\s*$/i,
  /\s*\(Mass Market Paperback\)\s*$/i,
];

const MAX_QUERY_LENGTH = 80;

export function cleanBookQuery(input: string): string {
  let cleaned = input.trim();
  for (const pattern of AMAZON_EDITION_SUFFIXES) {
    cleaned = cleaned.replace(pattern, "");
  }
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  if (cleaned.length > MAX_QUERY_LENGTH) {
    cleaned = cleaned.slice(0, MAX_QUERY_LENGTH).trim();
  }
  return cleaned;
}

export function toStoredMetadata(volume: NormalizedVolume): Record<string, unknown> {
  const metadata: Record<string, unknown> = { googleBooksId: volume.id };

  const coverUrl = volume.imageLinks?.thumbnail ?? volume.imageLinks?.smallThumbnail ?? null;
  if (coverUrl) metadata.coverUrl = coverUrl;

  let isbn10: string | null = null;
  let isbn13: string | null = null;
  for (const identifier of volume.industryIdentifiers) {
    if (identifier.type === "ISBN_10" && isbn10 === null) isbn10 = identifier.identifier;
    if (identifier.type === "ISBN_13" && isbn13 === null) isbn13 = identifier.identifier;
  }
  if (isbn10) metadata.isbn10 = isbn10;
  if (isbn13) metadata.isbn13 = isbn13;
  const primaryIsbn = isbn13 ?? isbn10;
  if (primaryIsbn) metadata.isbn = primaryIsbn;

  if (volume.publisher) metadata.publisher = volume.publisher;
  if (typeof volume.pageCount === "number") metadata.pageCount = volume.pageCount;
  if (volume.publishedDate) metadata.publishedDate = volume.publishedDate;
  if (volume.description) metadata.description = volume.description;
  if (volume.categories && volume.categories.length > 0) metadata.categories = JSON.stringify(volume.categories);
  if (typeof volume.averageRating === "number") metadata.averageRating = volume.averageRating;

  return metadata;
}
