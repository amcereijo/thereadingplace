"use client";

import { useActionState } from "react";
import { inviteByUsernameAction } from "@/app/actions/friends";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ErrorMessage, Input, SuccessMessage } from "./ui";

export function InviteUsernameForm({ dictionary }: { dictionary: Dictionary }) {
  const [state, action] = useActionState(inviteByUsernameAction, {
    error: null as string | null,
    ok: null as string | null,
  });

  const errorText = state?.error ? translate(dictionary, state.error) : null;
  const okText = state?.ok ? translate(dictionary, state.ok) : null;

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-zinc-700">
            {dictionary.friends.username}
          </label>
          <Input id="username" name="username" placeholder={dictionary.friends.usernamePlaceholder} required />
        </div>
        <Button type="submit">{dictionary.friends.invite}</Button>
      </div>
      <ErrorMessage>{errorText}</ErrorMessage>
      <SuccessMessage>{okText}</SuccessMessage>
    </form>
  );
}

function translate(dictionary: Dictionary, key: string): string {
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
