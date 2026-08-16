import { auth } from "@clerk/nextjs/server";
import { BookList } from "@/app/components/book-list";
import { LandingPage } from "@/app/components/landing-page";
import { ShelfNav } from "@/app/components/shelf-nav";
import { LinkButton, PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { countBooksByStatus, listBooks } from "@/lib/books";
import { isBookStatus } from "@/lib/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    return <LandingPage />;
  }

  const user = await requireAppUser();
  const params = await searchParams;
  const status = params.status && isBookStatus(params.status) ? params.status : undefined;
  const books = await listBooks(user.id, status);
  const counts = await countBooksByStatus(user.id);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageTitle>Your shelf</PageTitle>
          <PageSubtitle>{books.length} book{books.length === 1 ? "" : "s"}</PageSubtitle>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/books/import" variant="secondary">
            Import
          </LinkButton>
          <LinkButton href="/books/new">Add book</LinkButton>
        </div>
      </div>

      <ShelfNav basePath="" current={status ?? "all"} counts={counts} />

      <BookList books={books} editable />
    </div>
  );
}
