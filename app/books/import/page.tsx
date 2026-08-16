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
      <p className="mt-4 max-w-2xl text-sm text-zinc-600">
        To get your CSV file from Goodreads, sign in and go to{" "}
        <strong>My Books</strong>, then click{" "}
        <strong>Import and export</strong> in the left sidebar. Under{" "}
        <strong>Export Library</strong>, click <strong>Export to CSV</strong>{" "}
        and wait for the file to download.
      </p>
      <div className="mt-6">
        <GoodreadsImporter />
      </div>
    </div>
  );
}