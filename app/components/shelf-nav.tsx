import Link from "next/link";
import { BookCheck, Bookmark, BookOpen, BookX, LayoutGrid, type LucideIcon } from "lucide-react";
import { BOOK_STATUSES, getStatusLabel, type BookStatus } from "@/lib/types";
import { createT, type Dictionary } from "@/lib/i18n/dictionaries";
import type { BookCounts } from "@/lib/books";
import { cn } from "./ui";

type Props = {
  basePath: string;
  current?: BookStatus | "all";
  counts?: BookCounts;
  dictionary: Dictionary;
};

const STATUS_ICONS: Record<BookStatus, LucideIcon> = {
  "to-read": Bookmark,
  reading: BookOpen,
  read: BookCheck,
  abandoned: BookX,
};

const STATUS_ARIA: Record<BookStatus, string> = {
  "to-read": "statusToReadAria",
  reading: "statusReadingAria",
  read: "statusReadAria",
  abandoned: "statusAbandonedAria",
};

export function ShelfNav({
  basePath,
  current = "all",
  counts,
  dictionary,
}: Props) {
  const t = createT(dictionary);
  const items = [
    { href: basePath || "/", icon: LayoutGrid, label: dictionary.shelf.all, key: "all" as const, aria: "statusAllAria", countParam: null },
    ...BOOK_STATUSES.map((status) => ({
      href: `${basePath}/${status}`,
      icon: STATUS_ICONS[status],
      label: getStatusLabel(dictionary, status),
      key: status,
      aria: STATUS_ARIA[status],
      countParam: counts?.[status],
    })),
  ];

  return (
    <nav className="mb-6 flex flex-wrap gap-2 text-sm">
      {items.map((item) => {
        const n = counts?.[item.key];
        const Icon = item.icon;
        const ariaLabel = item.aria === "statusAllAria"
          ? t("shelf.statusAllAria")
          : t(`shelf.${item.aria}`, { count: n ?? 0 });
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-label={ariaLabel}
            title={ariaLabel}
            className={cn(
              "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition",
              item.key === current
                ? "bg-teal-700 text-white"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-900",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {n != null ? (
              <span
                className={cn(
                  "absolute -right-1 -top-1 min-w-[18px] rounded-full px-1 py-0.5 text-[10px] font-semibold leading-none",
                  item.key === current ? "bg-white text-teal-800" : "bg-zinc-100 text-zinc-600",
                )}
              >
                {n}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
