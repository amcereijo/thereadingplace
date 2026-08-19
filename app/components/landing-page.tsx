import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LinkButton, PageSubtitle, PageTitle } from "./ui";

export function LandingPage({ dictionary }: { dictionary: Dictionary }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-700/10">
            {dictionary.landing.tagline}
          </span>
          <PageTitle>{dictionary.landing.title}</PageTitle>
          <PageSubtitle>{dictionary.landing.subtitle}</PageSubtitle>
        </div>

        <div className="grid gap-4 text-left sm:grid-cols-3">
          <FeatureCard
            title={dictionary.landing.featureOrganize}
            description={dictionary.landing.featureOrganizeDescription}
          />
          <FeatureCard
            title={dictionary.landing.featureConnect}
            description={dictionary.landing.featureConnectDescription}
          />
          <FeatureCard
            title={dictionary.landing.featureImport}
            description={dictionary.landing.featureImportDescription}
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <LinkButton href="/sign-up" className="w-full sm:w-auto">
            {dictionary.landing.getStarted}
          </LinkButton>
          <LinkButton href="/sign-in" variant="secondary" className="w-full sm:w-auto">
            {dictionary.landing.signIn}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-base font-semibold text-zinc-900">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-600">{description}</p>
    </div>
  );
}
