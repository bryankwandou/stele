import type { Metadata } from "next";

import { TRADITIONS } from "@/lib/corpus";
import { copy, traditionCopy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const c = copy(await getLocale());
  return { title: c.sources.metaTitle, description: c.sources.metaDescription };
}

export default async function SourcesPage() {
  const c = copy(await getLocale());

  return (
    <main className="mx-auto max-w-2xl space-y-12 px-6 py-16">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl">{c.sources.title}</h1>
        <p className="leading-relaxed text-ink-soft">{c.sources.lede}</p>
      </header>

      <div className="space-y-8">
        {TRADITIONS.map((tradition) => {
          const t = traditionCopy(c, tradition.id);
          return (
            <section key={tradition.id} className="space-y-2 border-t border-rule pt-6">
              <h2 className="font-serif text-2xl">{t.name}</h2>
              <p className="leading-relaxed text-ink-soft">{t.blurb}</p>
              {/* Nama pemilik arsip dan bunyi lisensinya tidak diterjemahkan:
                  keduanya adalah kutipan, dan menerjemahkan kutipan lisensi
                  justru mengubah apa yang sedang dinyatakan. */}
              <p className="text-sm text-ink-soft">
                {tradition.attribution.label} · {tradition.attribution.license}
              </p>
              <a
                className="inline-block text-sm underline"
                href={tradition.attribution.href}
                target="_blank"
                rel="noreferrer"
              >
                {tradition.attribution.href}
              </a>
            </section>
          );
        })}
      </div>

      <section className="space-y-3 border-t border-rule pt-6">
        <h2 className="font-serif text-2xl">{c.sources.correctionHeading}</h2>
        <p className="leading-relaxed text-ink-soft">{c.sources.correctionBody}</p>
      </section>
    </main>
  );
}
