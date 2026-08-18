import type { Metadata } from "next";
import Link from "next/link";

import { TRADITIONS } from "@/lib/corpus";
import { copy, traditionCopy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const c = copy(await getLocale());
  return { title: c.readIndex.metaTitle };
}

export default async function ReadIndexPage() {
  const c = copy(await getLocale());

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <h1 className="font-serif text-3xl">{c.readIndex.title}</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">{c.readIndex.lede}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {TRADITIONS.map((tradition) => {
          const t = traditionCopy(c, tradition.id);
          return (
            <Link
              key={tradition.id}
              href={`/read/${tradition.id}`}
              className="group rounded-lg border border-rule bg-paper-raised p-6 transition-colors hover:border-ink"
            >
              <h2 className="font-serif text-xl">{t.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.blurb}</p>
              <p className="mt-4 text-xs text-ink-soft">{tradition.attribution.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
