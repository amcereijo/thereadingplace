import { notFound } from "next/navigation";
import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { Card, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { countBooksByStatus, listBooks } from "@/lib/books";
import { canReadShelf } from "@/lib/friendships";
import { getStatusLabel, isBookStatus } from "@/lib/types";
import { getUserByUsername } from "@/lib/users";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function FriendStatusPage({
  params,
}: {
  params: Promise<{ username: string; status: string }>;
}) {
  const viewer = await requireAppUser();
  const { username, status } = await params;
  if (!isBookStatus(status)) notFound();

  const owner = await getUserByUsername(username);
  const { dictionary, locale } = await getDictionaryForLocale();
  if (!owner) notFound();

  const allowed = await canReadShelf(viewer.id, owner.id);
  if (!allowed) {
    return (
      <Card className="max-w-lg">
        <PageTitle>@{owner.username}</PageTitle>
        <p className="mt-2 text-sm text-zinc-600">{dictionary.shelf.empty}</p>
      </Card>
    );
  }

  const [books, counts] = await Promise.all([
    listBooks(owner.id, status),
    countBooksByStatus(owner.id),
  ]);

  return (
    <div>
      <PageTitle>
        @{owner.username}&apos;s {getStatusLabel(dictionary, status).toLowerCase()}
      </PageTitle>
      <div className="mt-6">
        <ShelfNav basePath={`/u/${owner.username}`} current={status} counts={counts} dictionary={dictionary} />
      </div>
      <BookList books={books} friendView dictionary={dictionary} locale={locale} />
    </div>
  );
}
