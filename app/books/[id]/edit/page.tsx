import { notFound } from "next/navigation";
import { EditBookForm } from "@/app/components/edit-book-form";
import { requireAppUser } from "@/lib/auth";
import { getBook } from "@/lib/books";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAppUser();
  const { id } = await params;
  const book = await getBook(id);
  if (!book || book.ownerId !== user.id) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit book</h1>
      <EditBookForm book={book} />
    </div>
  );
}
