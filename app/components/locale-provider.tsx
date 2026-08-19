"use client";

import { createContext, useContext, useMemo } from "react";
import { createT, type Dictionary, type TFunction } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

const LocaleContext = createContext<{
  locale: Locale;
  dictionary: Dictionary;
  t: TFunction;
} | null>(null);

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    return { locale, dictionary, t: createT(dictionary) };
  }, [locale, dictionary]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return ctx.locale;
}

export function useDictionary() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useDictionary must be used inside LocaleProvider");
  }
  return ctx.dictionary;
}

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslation must be used inside LocaleProvider");
  }
  return ctx.t;
}
