import type { Metadata } from "next";

import { copy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const c = copy(await getLocale());
  return { title: c.how.metaTitle, description: c.how.metaDescription };
}

export default async function HowItWorksPage() {
  const c = copy(await getLocale());

  const checks = [
    { label: c.how.paceLabel, text: c.how.paceText },
    { label: c.how.visibleLabel, text: c.how.visibleText },
    { label: c.how.scrollLabel, text: c.how.scrollText },
    { label: c.how.anchorLabel, text: c.how.anchorText },
    { label: c.how.capLabel, text: c.how.capText },
  ];

  return (
    <main className="mx-auto max-w-2xl space-y-12 px-6 py-16">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl">{c.how.title}</h1>
        <p className="leading-relaxed text-ink-soft">{c.how.lede}</p>
      </header>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">{c.how.checkedHeading}</h2>
        <ul className="space-y-3 leading-relaxed text-ink-soft">
          {checks.map((check) => (
            <li key={check.label}>
              <strong className="text-ink">{check.label}</strong> {check.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">{c.how.capHeading}</h2>
        <p className="leading-relaxed text-ink-soft">{c.how.capBody}</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">{c.how.recordedHeading}</h2>
        <p className="leading-relaxed text-ink-soft">{c.how.recordedBody}</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">{c.how.notClaimedHeading}</h2>
        <p className="leading-relaxed text-ink-soft">{c.how.notClaimedBody}</p>
      </section>
    </main>
  );
}
