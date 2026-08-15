import { Card, PageTitle } from "@/app/components/ui";

export default function InvalidInvitePage() {
  return (
    <Card className="max-w-lg">
      <PageTitle>This invite is no longer valid</PageTitle>
      <p className="mt-2 text-sm text-zinc-600">Ask your friend for a new one-shot link.</p>
    </Card>
  );
}
