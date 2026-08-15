"use client";

import { useActionState } from "react";
import { inviteByUsernameAction } from "@/app/actions/friends";
import { Button, ErrorMessage, Input, SuccessMessage } from "./ui";

export function InviteUsernameForm() {
  const [state, action] = useActionState(inviteByUsernameAction, {
    error: null as string | null,
    ok: null as string | null,
  });

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Username
          </label>
          <Input id="username" name="username" placeholder="@friend" required />
        </div>
        <Button type="submit">Invite</Button>
      </div>
      <ErrorMessage>{state?.error}</ErrorMessage>
      <SuccessMessage>{state?.ok}</SuccessMessage>
    </form>
  );
}
