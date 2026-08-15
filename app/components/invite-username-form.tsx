"use client";

import { useActionState } from "react";
import { inviteByUsernameAction } from "@/app/actions/friends";

export function InviteUsernameForm() {
  const [state, action] = useActionState(inviteByUsernameAction, {
    error: null as string | null,
    ok: null as string | null,
  });

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="block text-sm font-medium">
        Username
        <input
          className="mt-1 block rounded border border-zinc-300 px-3 py-2 text-sm"
          name="username"
          required
        />
      </label>
      <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-sm text-white">
        Invite
      </button>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-green-700">{state.ok}</p> : null}
    </form>
  );
}
