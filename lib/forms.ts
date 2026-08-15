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
    .map(String)
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
