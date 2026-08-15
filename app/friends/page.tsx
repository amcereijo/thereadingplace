import Link from "next/link";
import { acceptInviteAction, declineInviteAction } from "@/app/actions/friends";
import { InviteUsernameForm } from "@/app/components/invite-username-form";
import { MintInviteLink } from "@/app/components/mint-invite-link";
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
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Friends</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Invite by username</h2>
        <InviteUsernameForm />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">New-member link</h2>
        <p className="text-sm text-zinc-600">One-shot. Only for someone who does not have an account yet.</p>
        <MintInviteLink />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Incoming requests</h2>
        {incoming.length === 0 ? (
          <p className="text-sm text-zinc-600">None.</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map((row) => (
              <li key={row.id} className="flex items-center gap-3 text-sm">
                <span>@{row.requesterUsername}</span>
                <form action={acceptInviteAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button className="underline" type="submit">
                    Accept
                  </button>
                </form>
                <form action={declineInviteAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button className="underline" type="submit">
                    Decline
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Outgoing requests</h2>
        {outgoing.length === 0 ? (
          <p className="text-sm text-zinc-600">None.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {outgoing.map((row) => (
              <li key={row.id}>Pending with @{row.addresseeUsername}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your friends</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-zinc-600">None yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {friends.map((friend) => (
              <li key={friend.id}>
                <Link className="underline" href={`/u/${friend.username}`}>
                  @{friend.username}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
