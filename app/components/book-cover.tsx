"use client";

import Image from "next/image";
import { useState } from "react";
import { BookImage as BookImageIcon } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "./ui";

export function BookCover({
  url,
  bookTitle,
  dictionary,
  className,
  width = 48,
  height = 64,
}: {
  url: string | null | undefined;
  bookTitle: string;
  dictionary: Dictionary;
  className?: string;
  width?: number;
  height?: number;
}) {
  const [errored, setErrored] = useState(false);
  const safeUrl = normalizeCoverUrl(url);
  const showImage = !!safeUrl && !errored;
  const alt = dictionary.shelf.coverAlt.replace("{title}", bookTitle);
  const placeholderLabel = dictionary.shelf.coverPlaceholder;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100",
        className,
      )}
      style={{ width, height }}
    >
      {showImage ? (
        <Image
          src={safeUrl}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={placeholderLabel}
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-zinc-400"
        >
          <BookImageIcon aria-hidden="true" className="h-5 w-5" />
          <span className="px-1 text-center text-[9px] font-medium uppercase leading-tight tracking-wide">
            {placeholderLabel}
          </span>
        </div>
      )}
    </div>
  );
}

function normalizeCoverUrl(url: string | null | undefined): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://")) return `https://${trimmed.slice("http://".length)}`;
  return trimmed;
}
