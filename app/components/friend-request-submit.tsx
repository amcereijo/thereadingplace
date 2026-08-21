"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui";

type Props = {
  intent: "accept" | "decline";
  acceptLabel: string;
  declineLabel: string;
  acceptingLabel: string;
  decliningLabel: string;
};

export function FriendRequestSubmit({ intent, acceptLabel, declineLabel, acceptingLabel, decliningLabel }: Props) {
  const { pending } = useFormStatus();
  if (intent === "accept") {
    return (
      <Button type="submit" loading={pending} loadingText={acceptingLabel}>
        {acceptLabel}
      </Button>
    );
  }
  return (
    <Button type="submit" variant="secondary" loading={pending} loadingText={decliningLabel}>
      {declineLabel}
    </Button>
  );
}
