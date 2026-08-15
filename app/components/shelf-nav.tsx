import Link from "next/link";
import { BOOK_STATUSES, STATUS_LABELS, type BookStatus } from "@/lib/types";

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
    <nav className="mb-6 flex flex-wrap gap-3 text-sm">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={item.key === current ? "font-semibold underline" : "text-zinc-600"}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
