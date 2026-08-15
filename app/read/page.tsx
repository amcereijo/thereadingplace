import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";

export default async function ReadPage() {
  const user = await requireAppUser();
  const books = await listBooks(user.id, "read");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Read</h1>
      <ShelfNav basePath="" current="read" />
      <BookList books={books} editable />
    </div>
  );
}
