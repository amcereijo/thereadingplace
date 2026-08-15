import Link from "next/link";
import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";
import { isBookStatus } from "@/lib/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAppUser();
  const params = await searchParams;
  const status = params.status && isBookStatus(params.status) ? params.status : undefined;
  const books = await listBooks(user.id, status);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your shelf</h1>
        <Link href="/books/new" className="rounded bg-zinc-900 px-3 py-2 text-sm text-white">
          Add book
        </Link>
      </div>
      <ShelfNav basePath="" current={status ?? "all"} />
      {status ? null : (
        <form className="mb-6 text-sm" action="/" method="get">
          <label>
            Filter
            <select className="ml-2 rounded border border-zinc-300 px-2 py-1" name="status" defaultValue="">
              <option value="">All</option>
              <option value="to-read">To read</option>
              <option value="reading">Reading</option>
              <option value="read">Read</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </label>
          <button className="ml-2 underline" type="submit">
            Apply
          </button>
        </form>
      )}
      <BookList books={books} editable />
    </div>
  );
}
