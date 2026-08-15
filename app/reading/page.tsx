import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";

export default async function ReadingPage() {
  const user = await requireAppUser();
  const books = await listBooks(user.id, "reading");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Reading</h1>
      <ShelfNav basePath="" current="reading" />
      <BookList books={books} editable />
    </div>
  );
}
