import { notFound } from "next/navigation";
import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { Card, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { countBooksByStatus, listBooks } from "@/lib/books";
import { canReadShelf } from "@/lib/friendships";
import { isBookStatus } from "@/lib/types";
import { getUserByUsername } from "@/lib/users";

export default async function FriendShelfPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const viewer = await requireAppUser();
  const { username } = await params;
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

  const query = await searchParams;
  const status = query.status && isBookStatus(query.status) ? query.status : undefined;
  const [books, counts] = await Promise.all([
    listBooks(owner.id, status),
    countBooksByStatus(owner.id),
  ]);

  return (
    <div>
      <PageTitle>@{owner.username}&apos;s shelf</PageTitle>
      <div className="mt-6">
        <ShelfNav basePath={`/u/${owner.username}`} current={status ?? "all"} counts={counts} />
      </div>
      <BookList books={books} />
    </div>
  );
}
