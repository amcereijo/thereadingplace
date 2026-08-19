import { cookies, headers } from "next/headers";
import { isLocale, LOCALE_COOKIE_NAME, pickLocale, type Locale } from "./locales";
import { createT, getDictionary, type Dictionary, type TFunction } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const cookieValue = jar.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieValue && isLocale(cookieValue)) {
    return cookieValue;
  }

  const headerList = await headers();
  const acceptLanguage = headerList.get("accept-language");
  return pickLocale(acceptLanguage);
}

export async function getDictionaryForLocale(): Promise<{ locale: Locale; dictionary: Dictionary; t: TFunction }> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  return { locale, dictionary, t: createT(dictionary) };
}
