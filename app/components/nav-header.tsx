import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LanguageToggle } from "./language-toggle";
import { SideNav } from "./side-nav";

const userButtonAppearance = {
  elements: {
    userButtonPopover: "right-2 sm:right-auto",
  },
} as const;

type NavHeaderProps = {
  locale: "en" | "es";
  unreadRecommendations: number;
};

export async function NavHeader({ locale, unreadRecommendations }: NavHeaderProps) {
  const dictionary = getDictionary(locale);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center px-3 sm:px-6">
        <div className="flex w-24 shrink-0 items-center justify-start sm:w-56">
          <Show when="signed-in">
            <SideNav dictionary={dictionary} unreadRecommendations={unreadRecommendations} />
          </Show>
        </div>
        <Link
          href="/"
          className="pointer-events-auto absolute left-1/2 -translate-x-1/2 text-base font-bold tracking-tight text-teal-800 hover:text-teal-900 sm:text-lg"
        >
          {dictionary.meta.title}
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Show when="signed-in">
            <LanguageToggle />
            <UserButton appearance={userButtonAppearance} />
          </Show>
        </div>
      </div>
    </header>
  );
}
