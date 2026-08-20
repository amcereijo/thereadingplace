import { CreateBookForm } from "@/app/components/create-book-form";
import { PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function NewBookPage() {
  await requireAppUser();
  const { dictionary, locale, t } = await getDictionaryForLocale();
  return (
    <div>
      <PageTitle>{t("newBook.title")}</PageTitle>
      <PageSubtitle>{t("newBook.subtitle")}</PageSubtitle>
      <div className="mt-6">
        <CreateBookForm dictionary={dictionary} locale={locale} />
      </div>
    </div>
  );
}
