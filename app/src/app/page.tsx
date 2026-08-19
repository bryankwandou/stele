import Link from "next/link";

import { countCorpus } from "@/lib/corpus";
import { copy, LOCALES } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { Carving } from "@/components/Carving";
import { Reveal } from "@/components/Reveal";
import { Tally } from "@/components/Tally";

/**
 * Halaman ini dirender per permintaan karena bahasa dibaca dari kuki. Angka
 * korpusnya sendiri tetap disinggahkan satu jam di lapisan fetch, jadi yang
 * dikerjakan ulang hanya penyusunan HTML, bukan pemanggilan tiap arsip.
 */
export default async function HomePage() {
  const locale = await getLocale();
  const c = copy(locale);
  const corpus = await countCorpus();

  // Dua angka bahasa yang berbeda, dan keduanya disebut namanya.
  //
  // Sebelumnya barisan ini hanya menulis "Bahasa" di bawah angka seribuan, yang
  // datang dari jumlah bahasa terjemahan di arsip sumber. Pembaca yang melihat
  // angka itu wajar mengira situsnya sendiri tersedia dalam seribu bahasa.
  // Angkanya benar, tetapi labelnya membuatnya terbaca sebagai janji yang tidak
  // pernah dibuat, jadi keduanya kini berdiri terpisah.
  const facts = [
    { label: c.home.factTranslations, value: corpus.translations },
    { label: c.home.factLanguages, value: corpus.languages },
    { label: c.home.factInterface, value: LOCALES.length },
    { label: c.home.factTraditions, value: corpus.traditions },
    { label: c.home.factCap, value: 3 },
  ];

  return (
    <div className="space-y-20">
      <section className="grid items-center gap-12 sm:grid-cols-[1fr_auto]">
        <Reveal className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">
            {c.home.eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            {c.home.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">{c.home.lede}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/read"
              className="rounded-md bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-90"
            >
              {c.home.ctaRead}
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-md border border-rule px-5 py-2.5 text-sm transition-colors hover:border-ink"
            >
              {c.home.ctaHow}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={140} className="hidden justify-self-end sm:block">
          <Carving />
        </Reveal>
      </section>

      <section className="grid gap-x-8 gap-y-6 grid-cols-2 border-y border-rule py-8 sm:grid-cols-5">
        {facts.map((fact, i) => (
          <Reveal key={fact.label} delay={i * 90}>
            <div className="font-serif text-3xl">
              <Tally value={fact.value} />
            </div>
            <div className="mt-1 text-sm text-ink-soft">{fact.label}</div>
          </Reveal>
        ))}
      </section>

      {/* Tiga hal yang perlu diketahui sebelum mulai, satu kalimat masing-masing.
          Uraian panjangnya tinggal di halaman cara kerja: halaman muka bukan
          tempat menjelaskan, ia tempat memutuskan mau membaca atau tidak. */}
      <Reveal>
        <section className="grid max-w-4xl gap-10 sm:grid-cols-3">
          <div className="space-y-3">
            <h2 className="font-serif text-xl">{c.home.rewardHeading}</h2>
            <p className="leading-relaxed text-ink-soft">{c.home.rewardP3}</p>
          </div>
          <div className="space-y-3">
            <h2 className="font-serif text-xl">{c.home.chainHeading}</h2>
            <p className="leading-relaxed text-ink-soft">{c.home.chainP3}</p>
          </div>
          <div className="space-y-3">
            <h2 className="font-serif text-xl">{c.home.claimHeading}</h2>
            <p className="leading-relaxed text-ink-soft">{c.home.claimP2}</p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <Link href="/how-it-works" className="inline-block text-sm underline">
          {c.home.claimLink}
        </Link>
      </Reveal>

    </div>
  );
}
