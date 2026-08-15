"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui";

export function BackButton() {
  const router = useRouter();
  return (
    <Button variant="ghost" onClick={() => router.back()} aria-label="Go back">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </Button>
  );
}
