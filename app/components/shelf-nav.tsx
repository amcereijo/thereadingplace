import Link from "next/link";
import { BOOK_STATUSES, getStatusLabel, type BookStatus } from "@/lib/types";
import type { BookCounts } from "@/lib/books";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "./ui";

type Props = {
  basePath: string;
  current?: BookStatus | "all";
  counts?: BookCounts;
  dictionary: Dictionary;
};

export function ShelfNav({ basePath, current = "all", counts, dictionary }: Props) {
  const items = [
    { href: basePath || "/", label: dictionary.shelf.all, key: "all" as const },
    ...BOOK_STATUSES.map((status) => ({
      href: `${basePath}/${status}`,
      label: getStatusLabel(dictionary, status),
      key: status,
    })),
  ];

  return (
    <nav className="mb-6 flex flex-wrap gap-2 text-sm">
      {items.map((item) => {
        const n = counts?.[item.key];
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition",
              item.key === current
                ? "bg-teal-700 text-white"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-900",
            )}
          >
            {item.label}
            {n != null ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs leading-none",
                  item.key === current ? "bg-teal-600 text-teal-100" : "bg-zinc-100 text-zinc-500",
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
