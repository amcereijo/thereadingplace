"use client";

import { useActionState } from "react";
import { claimUsernameAction } from "@/app/actions/users";

export function ClaimUsernameForm() {
  const [state, action] = useActionState(claimUsernameAction, { error: null as string | null });

  return (
    <form action={action} className="max-w-sm space-y-4">
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <label className="block text-sm font-medium">
        Username
        <input
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          name="username"
          autoComplete="username"
          required
        />
      </label>
      <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-sm text-white">
        Save username
      </button>
    </form>
  );
}
