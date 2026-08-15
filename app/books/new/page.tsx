import { CreateBookForm } from "@/app/components/create-book-form";
import { PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";

export default async function NewBookPage() {
  await requireAppUser();
  return (
    <div>
      <PageTitle>Add a book</PageTitle>
      <PageSubtitle>Only the title is required. Everything else is optional.</PageSubtitle>
      <div className="mt-6">
        <CreateBookForm />
      </div>
    </div>
  );
}
