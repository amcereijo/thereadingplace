import Link from "next/link";

export default function ExistingInvitePage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">This link is for new members</h1>
      <p>You already have an account, so the invite was not used.</p>
      <Link className="underline" href="/">
        Go to your shelf
      </Link>
    </div>
  );
}
