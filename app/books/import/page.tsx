import { GoodreadsImporter } from "@/app/components/goodreads-importer";
import { PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";

export default async function ImportPage() {
  await requireAppUser();
  return (
    <div>
      <PageTitle>Import from Goodreads</PageTitle>
      <PageSubtitle>
        Upload your Goodreads CSV export to import your reading history.
      </PageSubtitle>
      <div className="mt-6">
        <GoodreadsImporter />
      </div>
    </div>
  );
}