import { notFound } from "next/navigation";
import { EditBookForm } from "@/app/components/edit-book-form";
import { PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { getBook } from "@/lib/books";
import { BackButton } from "@/app/components/back-button";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAppUser();
  const { id } = await params;
  const book = await getBook(id);
  if (!book || book.ownerId !== user.id) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <BackButton />
        <PageTitle>Edit book</PageTitle>
      </div>
      <EditBookForm book={book} />
    </div>
  );
}
