import { ClaimUsernameForm } from "@/app/components/claim-username-form";
import { PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireClaimableUser } from "@/lib/auth";

export default async function ClaimUsernamePage() {
  await requireClaimableUser();
  return (
    <div>
      <PageTitle>Choose a username</PageTitle>
      <PageSubtitle>Friends will invite you with this handle.</PageSubtitle>
      <ClaimUsernameForm />
    </div>
  );
}
