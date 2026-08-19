"use client";

import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import { useLocale } from "./locale-provider";
import { cn } from "./ui";

export function LanguageToggle() {
  const router = useRouter();
  const locale = useLocale();

  async function switchLocale(next: "en" | "es") {
    if (next === locale) return;
    await setLocale(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs font-medium">
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={cn(
          "rounded px-1.5 py-0.5 transition",
          locale === "en" ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-900",
        )}
        aria-label="English"
      >
        EN
      </button>
      <span className="text-zinc-300">|</span>
      <button
        type="button"
        onClick={() => switchLocale("es")}
        className={cn(
          "rounded px-1.5 py-0.5 transition",
          locale === "es" ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-900",
        )}
        aria-label="Español"
      >
        ES
      </button>
    </div>
  );
}
