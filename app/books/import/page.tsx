import { GoodreadsImporter } from "@/app/components/goodreads-importer";
import { PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function ImportPage() {
  await requireAppUser();
  const { dictionary, t } = await getDictionaryForLocale();
  return (
    <div>
      <PageTitle>{t("import.title")}</PageTitle>
      <PageSubtitle>{t("import.subtitle")}</PageSubtitle>
      <p
        className="mt-4 max-w-2xl text-sm text-zinc-600"
        dangerouslySetInnerHTML={{ __html: t("import.instructions") }}
      />
      <div className="mt-6">
        <GoodreadsImporter dictionary={dictionary} />
      </div>
    </div>
  );
}