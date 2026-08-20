import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { LinkButton, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { countBooksByStatus, listBooks } from "@/lib/books";
import { listAcceptedFriends } from "@/lib/friendships";
import { countRecommendationsForUser, countUnreadReceived } from "@/lib/recommendations";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function ReadPage() {
  const user = await requireAppUser();
  const { dictionary, t } = await getDictionaryForLocale();
  const [books, counts, friends, recCount, unreadCount] = await Promise.all([
    listBooks(user.id, "read"),
    countBooksByStatus(user.id),
    listAcceptedFriends(user.id),
    countRecommendationsForUser(user.id),
    countUnreadReceived(user.id),
  ]);
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>{t("status.read")}</PageTitle>
        <LinkButton href="/books/new">{t("shelf.addBook")}</LinkButton>
      </div>
      <ShelfNav
        basePath=""
        current="read"
        counts={counts}
        dictionary={dictionary}
        showRecommendations={recCount > 0}
        recommendationsUnreadCount={unreadCount}
      />
      <BookList books={books} editable dictionary={dictionary} recommendFriends={friends} />
    </div>
  );
}
