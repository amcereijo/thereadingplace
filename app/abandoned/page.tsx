import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";

export default async function AbandonedPage() {
  const user = await requireAppUser();
  const books = await listBooks(user.id, "abandoned");
  return (
    <div>
      <PageTitle>Abandoned</PageTitle>
      <div className="mt-6">
        <ShelfNav basePath="" current="abandoned" />
      </div>
      <BookList books={books} editable />
    </div>
  );
}
