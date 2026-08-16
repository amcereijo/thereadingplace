import { acceptInviteAction, declineInviteAction } from "@/app/actions/friends";
import { FriendsList } from "@/app/components/friends-list";
import { InviteUsernameForm } from "@/app/components/invite-username-form";
import { MintInviteLink } from "@/app/components/mint-invite-link";
import { Button, Card, LinkButton, PageSubtitle, PageTitle, SectionTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import {
  listAcceptedFriends,
  listIncomingPending,
  listOutgoingPending,
} from "@/lib/friendships";

export default async function FriendsPage() {
  const user = await requireAppUser();
  const [incoming, outgoing, friends] = await Promise.all([
    listIncomingPending(user.id),
    listOutgoingPending(user.id),
    listAcceptedFriends(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <PageTitle>Friends</PageTitle>
        <PageSubtitle>Connect with readers you know.</PageSubtitle>
      </div>

      <FriendsList friends={friends} />

      <section className="space-y-3">
        <SectionTitle>Invite by username</SectionTitle>
        <InviteUsernameForm />
      </section>

      <section className="space-y-3">
        <SectionTitle>New-member link</SectionTitle>
        <p className="text-sm text-zinc-600">
          One-shot link. Send it to someone who does not have an account yet.
        </p>
        <MintInviteLink />
      </section>

      <section className="space-y-3">
        <SectionTitle>Incoming requests</SectionTitle>
        {incoming.length === 0 ? (
          <p className="text-sm text-zinc-500">None.</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map((row) => (
              <li key={row.id}>
                <Card className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <span className="font-medium text-zinc-900">@{row.requesterUsername}</span>
                  <div className="flex gap-2">
                    <form action={acceptInviteAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <Button type="submit">Accept</Button>
                    </form>
                    <form action={declineInviteAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <Button type="submit" variant="secondary">
                        Decline
                      </Button>
                    </form>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle>Outgoing requests</SectionTitle>
        {outgoing.length === 0 ? (
          <p className="text-sm text-zinc-500">None.</p>
        ) : (
          <ul className="space-y-2">
            {outgoing.map((row) => (
              <li key={row.id} className="flex items-center gap-2 text-sm text-zinc-700">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  Pending
                </span>
                <span className="font-medium">@{row.addresseeUsername}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
