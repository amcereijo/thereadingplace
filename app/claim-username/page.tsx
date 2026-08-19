import { ClaimUsernameForm } from "@/app/components/claim-username-form";
import { PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireClaimableUser } from "@/lib/auth";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function ClaimUsernamePage() {
  await requireClaimableUser();
  const { dictionary, t } = await getDictionaryForLocale();
  return (
    <div>
      <PageTitle>{t("claimUsername.title")}</PageTitle>
      <PageSubtitle>{t("claimUsername.subtitle")}</PageSubtitle>
      <ClaimUsernameForm dictionary={dictionary} />
    </div>
  );
}
