import { Suspense } from "react";
import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ensureUser } from "@/lib/users";
import { countUnreadReceived } from "@/lib/recommendations";
import { cn, Spinner } from "./ui";
import { LanguageToggle } from "./language-toggle";
import { NavLinkHint } from "./nav-link-hint";

export async function NavHeader({ locale }: { locale: "en" | "es" }) {
  const dictionary = getDictionary(locale);
  const { userId } = await auth();
  const unreadRecommendations = userId
    ? await (async () => {
        const { user } = await ensureUser(userId);
        return countUnreadReceived(user.id);
      })()
    : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col px-4 pt-3 sm:px-6 sm:pt-3">
        <Link
          href="/"
          className="self-center text-lg font-bold tracking-tight text-teal-800 hover:text-teal-900"
        >
          {dictionary.meta.title}
        </Link>
        <Show when="signed-in">
          <nav className="mt-2 flex items-center justify-center gap-4 text-sm font-medium text-zinc-700 sm:mt-2">
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-zinc-900">
              {dictionary.nav.shelf}
              <NavLinkHint />
            </Link>
            <Link href="/friends" className="inline-flex items-center gap-1.5 hover:text-zinc-900">
              {dictionary.nav.friends}
              <NavLinkHint />
            </Link>
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-1.5 hover:text-zinc-900"
            >
              {dictionary.recommendations.title}
              {unreadRecommendations > 0 ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs leading-none font-semibold",
                    "bg-teal-100 text-teal-800",
                  )}
                >
                  {unreadRecommendations}
                </span>
              ) : null}
              <NavLinkHint />
            </Link>
            <LanguageToggle />
            <UserButton />
          </nav>
        </Show>
      </div>
    </header>
  );
}

export function NavHeaderFallback() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col px-4 pt-3 sm:px-6 sm:pt-3">
        <span className="self-center text-lg font-bold tracking-tight text-zinc-300">
          &nbsp;
        </span>
        <div className="mt-2 flex items-center justify-center gap-4 text-sm text-zinc-300">
          <Spinner size={14} className="text-zinc-400" />
        </div>
      </div>
    </header>
  );
}

export function NavHeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<NavHeaderFallback />}>{children}</Suspense>
  );
}
