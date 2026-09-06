import type { NextRequest } from "next/server";
import { searchByIsbn, type NormalizedVolume } from "@/lib/google-books";
import { isLocale, type Locale } from "@/lib/i18n/locales";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = (params.get("code") ?? "").trim();
  const langParam = params.get("lang") ?? "";
  const locale: Locale = isLocale(langParam) ? langParam : "en";

  if (!code) {
    return Response.json({ results: [] as NormalizedVolume[] });
  }

  try {
    const { results } = await searchByIsbn(code, locale);
    return Response.json({ results });
  } catch (error) {
    console.error("Google Books ISBN lookup failed", error);
    return Response.json(
      { error: "upstream_unavailable" },
      { status: 502 },
    );
  }
}
