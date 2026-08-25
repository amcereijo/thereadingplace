import type { NextRequest } from "next/server";
import { searchVolumes, type NormalizedVolume } from "@/lib/google-books";
import { isLocale, type Locale } from "@/lib/i18n/locales";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").trim();
  const langParam = params.get("lang") ?? "";
  const locale: Locale = isLocale(langParam) ? langParam : "en";

  if (query.length < 2) {
    return Response.json({ results: [] as NormalizedVolume[] });
  }

  try {
    const { results } = await searchVolumes(query, locale);
    return Response.json({ results });
  } catch (error) {
    console.error("Google Books search failed", error);
    return Response.json(
      { error: "upstream_unavailable" },
      { status: 502 },
    );
  }
}
