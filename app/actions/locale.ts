"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n/locales";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;

  const jar = await cookies();
  jar.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  // Re-render the entire layout so <html lang> flips on every page, which in
  // turn drives the format of <input type="date"> pickers and the locale-aware
  // text rendered by formatBookDate helpers. Previously only a hard-coded list of
  // shelf paths was invalidated, leaving routes like /stats stuck on the old
  // locale's date format until the next navigation.
  revalidatePath("/", "layout");
}
