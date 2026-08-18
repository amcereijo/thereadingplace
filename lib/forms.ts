import { type BookFormat, type BookStatus, isBookFormat, isBookStatus } from "./types";

export function readTitle(formData: FormData) {
  return String(formData.get("title") ?? "").trim();
}

export function readStatus(formData: FormData): BookStatus | null {
  const value = String(formData.get("status") ?? "");
  return isBookStatus(value) ? value : null;
}

export function readFormats(formData: FormData): BookFormat[] {
  return formData
    .getAll("formats")
    .flatMap((value) => String(value).split(","))
    .map((v) => v.trim())
    .filter((value): value is BookFormat => isBookFormat(value));
}

export function readOptionalDate(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

export function readNote(formData: FormData) {
  const value = String(formData.get("note") ?? "").trim();
  return value || null;
}

export function readAuthor(formData: FormData) {
  const value = String(formData.get("author") ?? "").trim();
  return value || null;
}

export function readMetadata(formData: FormData): Record<string, unknown> {
  const raw = String(formData.get("metadata") ?? "").trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {}
  return {};
}
