import { PageSubtitle, PageTitle, SectionTitle, EmptyState } from "@/app/components/ui";
import { RecommendationRow } from "@/app/components/recommendation-row";
import { ShelfNav } from "@/app/components/shelf-nav";
import { requireAppUser } from "@/lib/auth";
import { listReceived, listSent } from "@/lib/recommendations";
import { listUsernamesById } from "@/lib/users";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const user = await requireAppUser();
  const { dictionary } = await getDictionaryForLocale();

  const [received, sent] = await Promise.all([listReceived(user.id), listSent(user.id)]);

  const allIds = Array.from(
    new Set([
      ...received.map((r) => r.senderId),
      ...sent.map((r) => r.receiverId),
    ]),
  );
  const usernames = await listUsernamesById(allIds);

  const t = (key: string, params?: Record<string, string | number>) => {
    const value = resolveKey(dictionary, `recommendations.${key}`);
    if (!value) return key;
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      String(params?.[name] ?? `{${name}}`),
    );
  };

  const totalRows = received.length + sent.length;

  return (
    <div>
      <PageTitle>{t("title")}</PageTitle>
      <PageSubtitle>{t("subtitle")}</PageSubtitle>

      <div className="mt-6">
        <ShelfNav basePath="" current="recommendations" dictionary={dictionary} showRecommendations />
      </div>

      <section className="mt-6 space-y-3">
        <SectionTitle>{t("received")}</SectionTitle>
        {received.length === 0 ? (
          <EmptyState>{t("noReceived")}</EmptyState>
        ) : (
          <ul className="space-y-3">
            {received.map((rec) => (
              <RecommendationRow
                key={rec.id}
                mode="received"
                recommendationId={rec.id}
                title={rec.title}
                author={rec.author}
                formats={rec.formats}
                counterpartyLabel={t("from", { username: usernames.get(rec.senderId) ?? "?" })}
                replyFromUsername={null}
                message={rec.message}
                reply={null}
                status={rec.status}
                sentAt={rec.sentAt.slice(0, 10)}
                dictionary={dictionary}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 space-y-3">
        <SectionTitle>{t("sent")}</SectionTitle>
        {sent.length === 0 ? (
          <EmptyState>{t("noSent")}</EmptyState>
        ) : (
          <ul className="space-y-3">
            {sent.map((rec) => (
              <RecommendationRow
                key={rec.id}
                mode="sent"
                recommendationId={rec.id}
                title={rec.title}
                author={rec.author}
                formats={rec.formats}
                counterpartyLabel={t("to", { username: usernames.get(rec.receiverId) ?? "?" })}
                replyFromUsername={usernames.get(rec.receiverId) ?? null}
                message={rec.message}
                reply={rec.reply}
                status={rec.status}
                sentAt={rec.sentAt.slice(0, 10)}
                dictionary={dictionary}
              />
            ))}
          </ul>
        )}
      </section>

      {totalRows === 0 ? null : null}
    </div>
  );
}

function resolveKey(dict: { [k: string]: unknown }, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}
