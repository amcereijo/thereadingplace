import { acceptInviteAction, declineInviteAction } from "@/app/actions/friends";
import { FriendRequestSubmit } from "@/app/components/friend-request-submit";
import { FriendsList } from "@/app/components/friends-list";
import { InviteUsernameForm } from "@/app/components/invite-username-form";
import { MintInviteLink } from "@/app/components/mint-invite-link";
import { Card, PageSubtitle, PageTitle, SectionTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import {
  listAcceptedFriends,
  listIncomingPending,
  listOutgoingPending,
} from "@/lib/friendships";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function FriendsPage() {
  const user = await requireAppUser();
  const { dictionary, t } = await getDictionaryForLocale();
  const [incoming, outgoing, friends] = await Promise.all([
    listIncomingPending(user.id),
    listOutgoingPending(user.id),
    listAcceptedFriends(user.id),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <PageTitle>{t("friends.title")}</PageTitle>
        <PageSubtitle>{t("friends.subtitle")}</PageSubtitle>
      </div>

      <section className="space-y-4">
        <SectionTitle>{t("friends.yourFriends")}</SectionTitle>
        <FriendsList friends={friends} dictionary={dictionary} />
      </section>

      <section id="pending-invitations" className="space-y-4">
        <SectionTitle>{t("friends.pendingInvitations")}</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">
                {t("friends.received")}
              </h3>
              {incoming.length > 0 ? (
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800">
                  {incoming.length}
                </span>
              ) : null}
            </div>
            {incoming.length === 0 ? (
              <p className="text-sm text-zinc-500">{t("friends.receivedNone")}</p>
            ) : (
              <ul className="space-y-2">
                {incoming.map((row) => (
                  <li key={row.id}>
                    <Card className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <span className="font-medium text-zinc-900">@{row.requesterUsername}</span>
                      <div className="flex gap-2">
                        <form action={acceptInviteAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <FriendRequestSubmit
                            intent="accept"
                            acceptLabel={t("friends.accept")}
                            declineLabel={t("friends.decline")}
                            acceptingLabel={t("friends.accepting")}
                            decliningLabel={t("friends.declining")}
                          />
                        </form>
                        <form action={declineInviteAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <FriendRequestSubmit
                            intent="decline"
                            acceptLabel={t("friends.accept")}
                            declineLabel={t("friends.decline")}
                            acceptingLabel={t("friends.accepting")}
                            decliningLabel={t("friends.declining")}
                          />
                        </form>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">
                {t("friends.sent")}
              </h3>
              {outgoing.length > 0 ? (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                  {outgoing.length}
                </span>
              ) : null}
            </div>
            {outgoing.length === 0 ? (
              <p className="text-sm text-zinc-500">{t("friends.sentNone")}</p>
            ) : (
              <ul className="space-y-2">
                {outgoing.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center gap-2 text-sm text-zinc-700"
                  >
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      {t("friends.pending")}
                    </span>
                    <span className="font-medium">@{row.addresseeUsername}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section id="invite-a-friend" className="space-y-4">
        <div className="space-y-1">
          <SectionTitle>{t("friends.inviteAGroup")}</SectionTitle>
          <p className="text-sm text-zinc-600">{t("friends.inviteAGroupHelper")}</p>
        </div>
        <div className="space-y-4">
          <InviteUsernameForm dictionary={dictionary} />
          <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-900">
              {t("friends.newMemberLink")}
            </p>
            <p className="text-sm text-zinc-600">
              {t("friends.newMemberLinkDescription")}
            </p>
            <MintInviteLink dictionary={dictionary} />
          </div>
        </div>
      </section>
    </div>
  );
}
