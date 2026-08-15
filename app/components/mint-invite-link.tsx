"use client";

import { useState } from "react";
import { mintInviteLinkAction } from "@/app/actions/friends";

export function MintInviteLink() {
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="rounded border border-zinc-300 px-4 py-2 text-sm"
        onClick={async () => {
          const result = await mintInviteLinkAction();
          setUrl(result.url);
        }}
      >
        Create new-member link
      </button>
      {url ? (
        <p className="break-all text-sm">
          One-shot link: <a className="underline" href={url}>{url}</a>
        </p>
      ) : null}
    </div>
  );
}
