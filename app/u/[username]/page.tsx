import { notFound } from "next/navigation";
import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";
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
      <div>
        <h1 className="text-2xl font-semibold">@{owner.username}</h1>
        <p className="mt-3 text-sm">This shelf is private.</p>
      </div>
    );
  }

  const query = await searchParams;
  const status = query.status && isBookStatus(query.status) ? query.status : undefined;
  const books = await listBooks(owner.id, status);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">@{owner.username}&apos;s shelf</h1>
      <ShelfNav basePath={`/u/${owner.username}`} current={status ?? "all"} />
      <BookList books={books} />
    </div>
  );
}
