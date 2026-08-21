"use client";

import { useLinkStatus } from "next/link";

export function NavLinkHint() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={
        "app-spinner inline-block h-3 w-3 border-[1.5px] text-zinc-400 transition-opacity " +
        (pending ? "opacity-100" : "opacity-0")
      }
    />
  );
}
