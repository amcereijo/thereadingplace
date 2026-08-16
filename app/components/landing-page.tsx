import { LinkButton, PageSubtitle, PageTitle } from "./ui";

export function LandingPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-700/10">
            Your personal reading companion
          </span>
          <PageTitle>Track, share, and discover your next great read</PageTitle>
          <PageSubtitle>
            The Reading Place helps you organize your bookshelf, stay on top of what you are reading, and share recommendations with friends.
          </PageSubtitle>
        </div>

        <div className="grid gap-4 text-left sm:grid-cols-3">
          <FeatureCard
            title="Organize"
            description="Log books, statuses, formats, dates, and notes in one place."
          />
          <FeatureCard
            title="Connect"
            description="Share shelves with friends and see what they are reading."
          />
          <FeatureCard
            title="Import"
            description="Bring your Goodreads library over in just a few clicks."
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <LinkButton href="/sign-up" className="w-full sm:w-auto">
            Get started free
          </LinkButton>
          <LinkButton href="/sign-in" variant="secondary" className="w-full sm:w-auto">
            Sign in
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
