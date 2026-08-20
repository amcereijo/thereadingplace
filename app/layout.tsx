import {
  ClerkProvider,
  Show,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { LanguageToggle } from "@/app/components/language-toggle";
import { LocaleProvider } from "@/app/components/locale-provider";

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
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
              <div className="relative mx-auto flex h-14 max-w-4xl items-center px-4 sm:px-6">
                <Link
                  href="/"
                  className="min-w-0 truncate text-lg font-bold tracking-tight text-teal-800 hover:text-teal-900 sm:absolute sm:left-1/2 sm:-translate-x-1/2"
                >
                  {dictionary.meta.title}
                </Link>
                <nav className="ml-auto flex shrink-0 items-center gap-3 text-sm font-medium text-zinc-700 sm:absolute sm:right-6 sm:ml-0 sm:gap-4">
                  <Show when="signed-in">
                    <Link href="/" className="hidden hover:text-zinc-900 sm:inline">
                      {dictionary.nav.shelf}
                    </Link>
                    <Link href="/friends" className="hover:text-zinc-900">
                      {dictionary.nav.friends}
                    </Link>
                    <LanguageToggle />
                    <UserButton />
                  </Show>
                </nav>
              </div>
            </header>
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          </ClerkProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
