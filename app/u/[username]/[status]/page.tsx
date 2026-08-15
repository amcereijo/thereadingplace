import { notFound } from "next/navigation";
import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
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
      <div>
        <h1 className="text-2xl font-semibold">@{owner.username}</h1>
        <p className="mt-3 text-sm">This shelf is private.</p>
      </div>
    );
  }

  const books = await listBooks(owner.id, status);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">
        @{owner.username}&apos;s {STATUS_LABELS[status].toLowerCase()}
      </h1>
      <ShelfNav basePath={`/u/${owner.username}`} current={status} />
      <BookList books={books} />
    </div>
  );
}
