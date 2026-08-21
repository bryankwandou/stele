import type { Metadata } from "next";
import Link from "next/link";

import { TRADITIONS } from "@/lib/corpus";
import { copy, traditionCopy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { Glyph } from "@/components/Glyph";

export async function generateMetadata(): Promise<Metadata> {
  const c = copy(await getLocale());
  return { title: c.readIndex.metaTitle };
}

export default async function ReadIndexPage() {
  const c = copy(await getLocale());

  return (
    <div className="space-y-12">
      <header className="max-w-2xl">
        <p className="eyebrow">{c.nav.read}</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          {c.readIndex.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">{c.readIndex.lede}</p>
      </header>

      {/* Kartunya diberi tanda dari tulisan kitabnya sendiri. Tanpa itu keenam
          kartu ini hanya enam kotak teks yang bentuknya sama persis, dan nama
          seperti "Dhammapada" tidak memberi apa pun untuk dikenali lebih dulu
          oleh mata. */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRADITIONS.map((tradition) => {
          const t = traditionCopy(c, tradition.id);
          return (
            <li key={tradition.id}>
              <Link
                href={`/read/${tradition.id}`}
                className="slab flex h-full flex-col rounded-lg p-6"
              >
                <Glyph tradition={tradition.id} />
                <h2 className="mt-5 font-serif text-xl">{t.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.blurb}</p>
                <p className="mt-auto pt-5 text-xs text-ink-soft">
                  {tradition.attribution.label}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
