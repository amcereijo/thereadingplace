import Link from "next/link";
import { BOOK_STATUSES, STATUS_LABELS, type BookStatus } from "@/lib/types";
import { cn } from "./ui";

type Props = {
  basePath: string;
  current?: BookStatus | "all";
};

export function ShelfNav({ basePath, current = "all" }: Props) {
  const items = [
    { href: basePath || "/", label: "All", key: "all" as const },
    ...BOOK_STATUSES.map((status) => ({
      href: `${basePath}/${status}`,
      label: STATUS_LABELS[status],
      key: status,
    })),
  ];

  return (
    <nav className="mb-6 flex flex-wrap gap-2 text-sm">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "rounded-full px-3 py-1.5 font-medium transition",
            item.key === current
              ? "bg-teal-700 text-white"
              : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-900",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
