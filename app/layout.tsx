import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/app/components/locale-provider";
import { NavHeader, NavHeaderShell } from "@/app/components/nav-header";

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

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <NavHeaderShell>
              <NavHeader locale={locale} />
            </NavHeaderShell>
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          </ClerkProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
