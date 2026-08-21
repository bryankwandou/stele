import type { Metadata } from "next";

import { copy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { Reveal } from "@/components/Reveal";

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

  // Dua bagian terakhir sepasang: yang dicatat, dan yang tidak diklaim.
  // Keduanya menjawab pertanyaan yang sama dari dua sisi, jadi keduanya berdiri
  // berdampingan alih-alih berurutan ke bawah.
  const pairs = [
    { h: c.how.recordedHeading, p: c.how.recordedBody },
    { h: c.how.notClaimedHeading, p: c.how.notClaimedBody },
  ];

  return (
    /* Bukan `main`.
       Halaman ini dulu membuka `main` sendiri, padahal tata letak induknya
       sudah membuka satu. Dua tengara `main` bersarang bukan hanya HTML yang
       tidak sah — pembaca layar yang melompat ke isi utama jadi punya dua
       tempat untuk mendarat, dan lebar maupun jarak halaman ini ikut dihitung
       dua kali. */
    <div className="space-y-20">
      <header className="max-w-3xl">
        <p className="eyebrow">{c.nav.how}</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          {c.how.title}
        </h1>
        {/* Kalimat pembuka dinaikkan ke warna tinta penuh. Ia pernyataan
            paling penting di halaman ini — bahwa membaca tidak bisa dibuktikan
            secara kriptografis — dan sebelumnya ia ditulis dengan abu-abu yang
            sama dengan keterangan kaki. */}
        <p className="mt-5 max-w-[58ch] text-lg leading-relaxed">{c.how.lede}</p>
      </header>

      {/* Lima pemeriksaan itu tabel, bukan paragraf.
          Ditulis sebagai daftar berbutir dengan label tebal di depan kalimat,
          kelimanya menyatu jadi satu blok abu-abu yang harus dibaca utuh hanya
          untuk menemukan satu baris. Bentuk aslinya memang berpasangan: nama
          pemeriksaan, lalu apa yang dilihatnya. */}
      <Reveal>
        <section>
          <h2 className="font-serif text-2xl">{c.how.checkedHeading}</h2>
          <dl className="mt-8 grid gap-px overflow-hidden rounded-lg border border-rule bg-rule">
            {checks.map((check) => (
              <div
                key={check.label}
                className="grid gap-2 bg-paper-raised p-5 sm:grid-cols-[13rem_1fr] sm:gap-8 sm:p-6"
              >
                <dt className="font-serif text-lg leading-snug">{check.label}</dt>
                <dd className="leading-relaxed text-ink-soft">{check.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>

      {/* Bagian yang menanggung seluruh argumen halaman ini diberi bidangnya
          sendiri. Sebelumnya ia mendapat jarak dan ukuran yang persis sama
          dengan empat bagian lain, sehingga tidak ada apa pun yang memberi tahu
          pembaca bahwa yang satu ini yang menahan sisanya. */}
      <Reveal>
        <section className="rounded-lg bg-paper-sunk px-6 py-12 sm:px-12 sm:py-14">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl leading-tight">{c.how.capHeading}</h2>
            <p className="mt-5 text-lg leading-relaxed">{c.how.capBody}</p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="grid gap-10 sm:grid-cols-2 sm:gap-12">
          {pairs.map((s) => (
            <div key={s.h}>
              <div className="incise mb-6 max-w-24" />
              <h2 className="font-serif text-2xl">{s.h}</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">{s.p}</p>
            </div>
          ))}
        </section>
      </Reveal>
    </div>
  );
}
