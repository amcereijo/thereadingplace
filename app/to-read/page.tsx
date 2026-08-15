import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { LinkButton, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";

export default async function ToReadPage() {
  const user = await requireAppUser();
  const books = await listBooks(user.id, "to-read");
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>To read</PageTitle>
        <LinkButton href="/books/new">Add book</LinkButton>
      </div>
      <ShelfNav basePath="" current="to-read" />
      <BookList books={books} editable />
    </div>
  );
}
