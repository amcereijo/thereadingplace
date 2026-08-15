"use client";

import { useState } from "react";
import { mintInviteLinkAction } from "@/app/actions/friends";
import { Button, Card } from "./ui";

export function MintInviteLink() {
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        onClick={async () => {
          const result = await mintInviteLinkAction();
          setUrl(result.url);
        }}
      >
        Create new-member link
      </Button>
      {url ? (
        <Card className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">One-shot link</p>
          <a
            className="break-all text-sm text-teal-700 hover:text-teal-800 hover:underline"
            href={url}
          >
            {url}
          </a>
        </Card>
      ) : null}
    </div>
  );
}
