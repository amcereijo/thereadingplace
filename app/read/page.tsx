import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";

export default async function ReadPage() {
  const user = await requireAppUser();
  const books = await listBooks(user.id, "read");
  return (
    <div>
      <PageTitle>Read</PageTitle>
      <div className="mt-6">
        <ShelfNav basePath="" current="read" />
      </div>
      <BookList books={books} editable />
    </div>
  );
}
