import { notFound } from "next/navigation";
import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { Card, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";
import { canReadShelf } from "@/lib/friendships";
import { STATUS_LABELS, isBookStatus } from "@/lib/types";
import { getUserByUsername } from "@/lib/users";

export default async function FriendStatusPage({
  params,
}: {
  params: Promise<{ username: string; status: string }>;
}) {
  const viewer = await requireAppUser();
  const { username, status } = await params;
  if (!isBookStatus(status)) notFound();

  const owner = await getUserByUsername(username);
  if (!owner) notFound();

  const allowed = await canReadShelf(viewer.id, owner.id);
  if (!allowed) {
    return (
      <Card className="max-w-lg">
        <PageTitle>@{owner.username}</PageTitle>
        <p className="mt-2 text-sm text-zinc-600">This shelf is private.</p>
      </Card>
    );
  }

  const books = await listBooks(owner.id, status);

  return (
    <div>
      <PageTitle>
        @{owner.username}&apos;s {STATUS_LABELS[status].toLowerCase()}
      </PageTitle>
      <div className="mt-6">
        <ShelfNav basePath={`/u/${owner.username}`} current={status} />
      </div>
      <BookList books={books} />
    </div>
  );
}
