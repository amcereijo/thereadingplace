import { CreateBookForm } from "@/app/components/create-book-form";
import { requireAppUser } from "@/lib/auth";

export default async function NewBookPage() {
  await requireAppUser();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Add a book</h1>
      <CreateBookForm />
    </div>
  );
}
