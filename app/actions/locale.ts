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

  revalidatePath("/");
  revalidatePath("/to-read");
  revalidatePath("/reading");
  revalidatePath("/read");
  revalidatePath("/abandoned");
  revalidatePath("/friends");
  revalidatePath("/books/new");
  revalidatePath("/books/import");
}
