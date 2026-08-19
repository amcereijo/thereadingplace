"use client";

import { useActionState } from "react";
import { claimUsernameAction } from "@/app/actions/users";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ErrorMessage, Input, Label } from "./ui";

export function ClaimUsernameForm({ dictionary }: { dictionary: Dictionary }) {
  const [state, action] = useActionState(claimUsernameAction, { error: null as string | null });
  const errorText = state?.error ? translateError(dictionary, state.error) : null;

  return (
    <form action={action} className="mt-6 max-w-sm space-y-4">
      <ErrorMessage>{errorText}</ErrorMessage>
      <div>
        <Label htmlFor="username">{dictionary.claimUsername.username}</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          placeholder={dictionary.claimUsername.usernamePlaceholder}
          required
        />
        <p className="mt-1.5 text-xs text-zinc-500">{dictionary.claimUsername.usernameHint}</p>
      </div>
      <Button type="submit" className="w-full">
        {dictionary.claimUsername.saveUsername}
      </Button>
    </form>
  );
}

function translateError(dictionary: Dictionary, key: string): string {
  const parts = key.split(".");
  let current: unknown = dictionary;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}
