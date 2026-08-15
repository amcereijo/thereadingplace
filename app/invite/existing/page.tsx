import { Card, PageTitle, StyledLink } from "@/app/components/ui";

export default function ExistingInvitePage() {
  return (
    <Card className="max-w-lg">
      <PageTitle>This link is for new members</PageTitle>
      <p className="mt-2 text-sm text-zinc-600">
        You already have an account, so the invite was not used.
      </p>
      <div className="mt-5">
        <StyledLink href="/">Go to your shelf</StyledLink>
      </div>
    </Card>
  );
}
