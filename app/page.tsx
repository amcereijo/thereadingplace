import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { LinkButton, PageSubtitle, PageTitle } from "@/app/components/ui";
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageTitle>Your shelf</PageTitle>
          <PageSubtitle>{books.length} book{books.length === 1 ? "" : "s"}</PageSubtitle>
        </div>
        <LinkButton href="/books/new">Add book</LinkButton>
      </div>

      <ShelfNav basePath="" current={status ?? "all"} />

      {status ? null : (
        <form className="mb-6 flex items-center gap-3 text-sm" action="/" method="get">
          <label htmlFor="filter" className="font-medium text-zinc-700">
            Filter
          </label>
          <select
            id="filter"
            name="status"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            defaultValue=""
          >
            <option value="">All</option>
            <option value="to-read">To read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
            <option value="abandoned">Abandoned</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
          >
            Apply
          </button>
        </form>
      )}

      <BookList books={books} editable />
    </div>
  );
}
