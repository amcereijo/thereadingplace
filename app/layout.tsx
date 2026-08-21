import {
  ClerkProvider,
  Show,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { auth } from "@clerk/nextjs/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { LanguageToggle } from "@/app/components/language-toggle";
import { LocaleProvider } from "@/app/components/locale-provider";
import { ensureUser } from "@/lib/users";
import { countUnreadReceived } from "@/lib/recommendations";
import { cn } from "@/app/components/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.ico",
      apple: "/favicon.svg",
    },
    manifest: "/manifest.json",
    themeColor: "#0f766e",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: dictionary.meta.title,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  const { userId } = await auth();
  const unreadRecommendations = userId
    ? await (async () => {
        const { user } = await ensureUser(userId);
        return countUnreadReceived(user.id);
      })()
    : 0;

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
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
                    <Link href="/" className="hover:text-zinc-900">
                      {dictionary.nav.shelf}
                    </Link>
                    <Link href="/friends" className="hover:text-zinc-900">
                      {dictionary.nav.friends}
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
                    </Link>
                    <LanguageToggle />
                    <UserButton />
                  </nav>
                </Show>
              </div>
            </header>
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          </ClerkProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
