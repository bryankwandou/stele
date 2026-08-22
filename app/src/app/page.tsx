import Link from "next/link";

import { countCorpus, TRADITIONS } from "@/lib/corpus";
import { copy, LOCALES, traditionCopy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { Carving } from "@/components/Carving";
import { Monolith } from "@/components/Monolith";
import { Reveal } from "@/components/Reveal";
import { Tally } from "@/components/Tally";
import { Glyph } from "@/components/Glyph";

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
  const facts = [
    { label: c.home.factTranslations, value: corpus.translations },
    { label: c.home.factLanguages, value: corpus.languages },
    { label: c.home.factInterface, value: LOCALES.length },
    { label: c.home.factTraditions, value: corpus.traditions },
    { label: c.home.factCap, value: 3 },
  ];

  const notes = [
    { h: c.home.rewardHeading, p: c.home.rewardP3 },
    { h: c.home.chainHeading, p: c.home.chainP3 },
    { h: c.home.claimHeading, p: c.home.claimP2 },
  ];

  return (
    <div className="space-y-24">
      {/* Bagian pembuka mengisi tinggi layar.
          Bentuk yang lama menaruh judul, tombol, dan angka di sepertiga atas
          lalu membiarkan sisanya kosong sampai kaki halaman — halaman pendek
          yang membentang di layar lebar terbaca seperti halaman yang gagal
          memuat. Sekarang pembukanya memang setinggi layar, dan lempengnya
          diberi ruang sebesar perannya. */}
      <section className="grid items-center gap-12 pb-4 sm:min-h-[78vh] sm:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <p className="eyebrow">{c.home.eyebrow}</p>
          <h1 className="mt-5 max-w-[15ch] font-serif text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {c.home.title}
          </h1>
          <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
            {c.home.lede}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/read"
              className="rounded-md bg-ink px-6 py-3 text-sm text-paper transition-opacity hover:opacity-90"
            >
              {c.home.ctaRead}
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-md border border-rule px-6 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              {c.home.ctaHow}
            </Link>
          </div>
        </Reveal>

        {/* Lempeng batu, dipahat di layar. Gambar diam yang lama dipakai
            sebagai cadangan: bila peramban tidak punya WebGL atau konteksnya
            dicabut di tengah jalan, yang tampil bukan lubang di tata letak
            melainkan lempeng yang sama dalam dua dimensi. */}
        <Reveal delay={140} className="justify-self-center">
          <Monolith label={c.home.slabAlt} fallback={<Carving />} />
        </Reveal>
      </section>

      {/* Angka-angka ini isi paling kuat di halaman dan dulu diberi tipografi
          paling lemah: satu baris kecil setara teks tubuh. Sekarang ia pita
          terpahat, angkanya memakai huruf pahat dan lebar angka yang tetap
          supaya barisnya tidak bergoyang saat dihitung naik. */}
      <section>
        <div className="incise" />
        <dl className="grid grid-cols-3 gap-x-6 gap-y-10 py-12 sm:grid-cols-5">
          {facts.map((fact, i) => (
            <Reveal key={fact.label} delay={i * 80}>
              <dt className="sr-only">{fact.label}</dt>
              <dd className="cut tabular text-3xl text-ink sm:text-4xl lg:text-5xl">
                <Tally value={fact.value} />
              </dd>
              <p aria-hidden className="mt-3 text-sm leading-snug text-ink-soft">
                {fact.label}
              </p>
            </Reveal>
          ))}
        </dl>
        <div className="incise" />
      </section>

      {/* Enam kitab, disebut namanya di halaman muka.
          Sebelumnya halaman ini menyebut angka enam tanpa pernah menyebut
          kitabnya, jadi pembaca harus menekan satu tautan hanya untuk tahu apa
          yang sebenarnya ada di dalam. Tiap kartu membawa satu aksara dari
          tulisan kitabnya sendiri — itu penanda yang jujur, dan lebih dikenali
          daripada gambar sampul mana pun. */}
      <Reveal>
        <section>
          <h2 className="font-serif text-3xl">{c.readIndex.title}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRADITIONS.map((t, i) => {
              const named = traditionCopy(c, t.id);
              return (
                <li key={t.id}>
                  <Reveal delay={i * 60}>
                    <Link
                      href={`/read/${t.id}`}
                      className="slab flex h-full items-start gap-4 rounded-lg p-5"
                    >
                      <Glyph tradition={t.id} />
                      <span className="min-w-0">
                        <span className="block font-serif text-lg">{named.name}</span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-ink-soft">
                          {named.blurb}
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </section>
      </Reveal>

      {/* Tiga hal yang perlu diketahui sebelum mulai, satu kalimat masing-masing.
          Uraian panjangnya tinggal di halaman cara kerja: halaman muka bukan
          tempat menjelaskan, ia tempat memutuskan mau membaca atau tidak. */}
      <Reveal>
        <section className="rounded-lg bg-paper-sunk px-6 py-12 sm:px-10">
          <div className="grid gap-10 sm:grid-cols-3">
            {notes.map((n) => (
              <div key={n.h} className="space-y-3">
                <h2 className="font-serif text-xl">{n.h}</h2>
                <p className="leading-relaxed text-ink-soft">{n.p}</p>
              </div>
            ))}
          </div>
          <p className="mt-10">
            <Link
              href="/how-it-works"
              className="text-sm text-accent underline underline-offset-4"
            >
              {c.home.claimLink}
            </Link>
          </p>
        </section>
      </Reveal>
    </div>
  );
}
