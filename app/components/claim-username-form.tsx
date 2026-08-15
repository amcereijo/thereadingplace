"use client";

import { useActionState } from "react";
import { claimUsernameAction } from "@/app/actions/users";
import { Button, ErrorMessage, Input, Label } from "./ui";

export function ClaimUsernameForm() {
  const [state, action] = useActionState(claimUsernameAction, { error: null as string | null });

  return (
    <form action={action} className="mt-6 max-w-sm space-y-4">
      <ErrorMessage>{state?.error}</ErrorMessage>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          placeholder="your_handle"
          required
        />
        <p className="mt-1.5 text-xs text-zinc-500">3–32 lowercase letters, numbers, or underscores.</p>
      </div>
      <Button type="submit" className="w-full">
        Save username
      </Button>
    </form>
  );
}
