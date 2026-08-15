import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";

export default async function AbandonedPage() {
  const user = await requireAppUser();
  const books = await listBooks(user.id, "abandoned");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Abandoned</h1>
      <ShelfNav basePath="" current="abandoned" />
      <BookList books={books} editable />
    </div>
  );
}
