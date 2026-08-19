import { Card, PageTitle, StyledLink } from "@/app/components/ui";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function ExistingInvitePage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  return (
    <Card className="max-w-lg">
      <PageTitle>{dictionary.invite.existing}</PageTitle>
      <div className="mt-5">
        <StyledLink href="/">{dictionary.nav.shelf}</StyledLink>
      </div>
    </Card>
  );
}
