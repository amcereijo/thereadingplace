"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "./locale-provider";
import { Button } from "./ui";

export function BackButton() {
  const router = useRouter();
  const t = useTranslation();
  return (
    <Button variant="ghost" onClick={() => router.back()} aria-label={t("back")}>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
