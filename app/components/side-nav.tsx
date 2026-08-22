"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "./ui";

type SideNavProps = {
  dictionary: Dictionary;
  unreadRecommendations: number;
};

type NavItem = {
  href: string;
  label: string;
  isActive: boolean;
  badge?: number | null;
};

function buildItems(
  pathname: string,
  dictionary: Dictionary,
  unreadRecommendations: number,
): NavItem[] {
  return [
    {
      href: "/",
      label: dictionary.nav.shelf,
      isActive: pathname === "/",
    },
    {
      href: "/friends",
      label: dictionary.nav.friends,
      isActive: pathname.startsWith("/friends"),
    },
    {
      href: "/recommendations",
      label: dictionary.recommendations.title,
      isActive: pathname.startsWith("/recommendations"),
      badge: unreadRecommendations > 0 ? unreadRecommendations : null,
    },
  ];
}

function NavLink({
  item,
  size = "sm",
}: {
  item: NavItem;
  size?: "sm" | "base";
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 font-medium transition",
        size === "base" ? "text-base" : "text-sm",
        item.isActive
          ? "bg-teal-50 text-teal-800"
          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-xs leading-none font-semibold text-teal-800">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SideNav({ dictionary, unreadRecommendations }: SideNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = buildItems(pathname, dictionary, unreadRecommendations);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-600 sm:hidden"
        aria-label={dictionary.nav.menuOpen}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="h-5 w-5"
        >
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={dictionary.nav.menu}
        >
          <button
            type="button"
            aria-label={dictionary.nav.menuClose}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-zinc-900/50"
          />
          <aside className="relative flex h-screen w-72 max-w-[85vw] flex-col border-r border-zinc-200 bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3">
              <span className="text-base font-semibold text-zinc-900">
                {dictionary.nav.menu}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                aria-label={dictionary.nav.menuClose}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  className="h-5 w-5"
                >
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <NavLink item={item} size="base" />
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}

export function SideNavDesktop({ dictionary, unreadRecommendations }: SideNavProps) {
  const pathname = usePathname();
  const items = buildItems(pathname, dictionary, unreadRecommendations);

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-zinc-200 bg-white/60 px-3 py-6 sm:block">
      <nav aria-label={dictionary.nav.menu}>
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
