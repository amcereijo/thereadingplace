import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";

export default async function ReadingPage() {
  const user = await requireAppUser();
  const books = await listBooks(user.id, "reading");
  return (
    <div>
      <PageTitle>Reading</PageTitle>
      <div className="mt-6">
        <ShelfNav basePath="" current="reading" />
      </div>
      <BookList books={books} editable />
    </div>
  );
}
