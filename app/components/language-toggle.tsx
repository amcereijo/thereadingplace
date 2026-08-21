"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import { useLocale } from "./locale-provider";
import { cn, Spinner } from "./ui";

export function LanguageToggle() {
  const router = useRouter();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  function switchLocale(next: "en" | "es") {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 text-xs font-medium">
      <button
        type="button"
        onClick={() => switchLocale("en")}
        disabled={pending}
        className={cn(
          "rounded px-1.5 py-0.5 transition disabled:opacity-60",
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
        disabled={pending}
        className={cn(
          "rounded px-1.5 py-0.5 transition disabled:opacity-60",
          locale === "es" ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-900",
        )}
        aria-label="Español"
      >
        ES
      </button>
      {pending ? <Spinner size={12} className="text-zinc-400" /> : null}
    </div>
  );
}
