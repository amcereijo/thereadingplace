import { ClaimUsernameForm } from "@/app/components/claim-username-form";
import { requireClaimableUser } from "@/lib/auth";

export default async function ClaimUsernamePage() {
  await requireClaimableUser();
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Choose a username</h1>
      <p className="mb-6 text-sm text-zinc-600">Friends will invite you with this handle.</p>
      <ClaimUsernameForm />
    </div>
  );
}
