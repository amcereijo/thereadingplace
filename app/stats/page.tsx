import { StatisticsCards } from "@/app/components/statistics-cards";
import { PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { getReadingStats, listFinishedYears, parsePeriod } from "@/lib/statistics";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const user = await requireAppUser();
  const { dictionary, locale, t } = await getDictionaryForLocale();
  const params = await searchParams;
  const period = parsePeriod(params);
  const [stats, availableYears] = await Promise.all([
    getReadingStats(user.id, period),
    listFinishedYears(user.id),
  ]);

  return (
    <div>
      <PageTitle>{t("statistics.title")}</PageTitle>
      <PageSubtitle>{t("statistics.subtitle")}</PageSubtitle>
      <div className="mt-6">
        <StatisticsCards
          dictionary={dictionary}
          locale={locale}
          stats={stats}
          period={period}
          availableYears={availableYears}
        />
      </div>
    </div>
  );
}
