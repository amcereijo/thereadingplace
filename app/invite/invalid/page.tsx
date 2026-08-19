import { Card, PageTitle } from "@/app/components/ui";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function InvalidInvitePage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  return (
    <Card className="max-w-lg">
      <PageTitle>{dictionary.invite.invalid}</PageTitle>
    </Card>
  );
}
