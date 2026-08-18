import {
  ClerkProvider,
  Show,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Reading Place",
  description: "A personal book shelf you own.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-4xl items-center justify-center px-4 sm:px-6">
              <Link
                href="/"
                className="truncate pe-28 text-lg font-bold tracking-tight text-teal-800 hover:text-teal-900"
              >
                The Reading Place
              </Link>
              <nav className="absolute right-4 flex items-center gap-4 text-sm font-medium text-zinc-700 sm:right-6">
                <Show when="signed-in">
                  <Link href="/" className="hover:text-zinc-900">
                    Shelf
                  </Link>
                  <Link href="/friends" className="hover:text-zinc-900">
                    Friends
                  </Link>
                  <UserButton />
                </Show>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
