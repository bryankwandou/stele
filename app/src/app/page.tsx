import Link from "next/link";

const FACTS = [
  { label: "Tradisi", value: "3" },
  { label: "Terjemahan Alkitab", value: "1.000+" },
  { label: "Terjemahan Qur'an", value: "492" },
  { label: "Bahasa", value: "98+" },
];

export default function HomePage() {
  return (
    <div className="space-y-24">
      <section className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">
          Solana devnet
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          Bacaan Anda meninggalkan catatan yang tidak bisa dihapus siapa pun.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          Stele bukan aplikasi yang membayar Anda membaca. Yang dicatat adalah
          bahwa Anda membaca — hari demi hari, di rantai publik, dalam bentuk yang
          tidak bisa dipalsukan dan tidak bisa dibeli.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/read"
            className="rounded-md bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-90"
          >
            Mulai membaca
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-md border border-rule px-5 py-2.5 text-sm transition-colors hover:border-ink"
          >
            Cara kerjanya
          </Link>
        </div>
      </section>

      <section className="grid gap-x-8 gap-y-6 border-y border-rule py-8 sm:grid-cols-4">
        {FACTS.map((fact) => (
          <div key={fact.label}>
            <div className="font-serif text-3xl">{fact.value}</div>
            <div className="mt-1 text-sm text-ink-soft">{fact.label}</div>
          </div>
        ))}
      </section>

      <section className="max-w-2xl space-y-8">
        <h2 className="font-serif text-2xl">Kenapa bukan hadiah</h2>
        <div className="space-y-5 leading-relaxed text-ink-soft">
          <p>
            Pernah ada aplikasi serupa yang membayar pembacanya dengan satoshi.
            Aplikasi itu mati, dan sebabnya bisa ditebak: begitu ada harga per ayat,
            yang datang bukan pembaca, melainkan skrip. Ketika hadiahnya habis,
            tidak ada yang tersisa — karena tidak pernah ada alasan lain untuk datang.
          </p>
          <p>
            Stele menolak menjadi mesin itu. Token yang Anda terima adalah tanda
            terima, bukan upah. Nilainya hanya ada bagi orang yang benar-benar
            membacanya. Program yang memalsukan sepuluh ribu sesi hanya menghasilkan
            sepuluh ribu catatan kosong tentang dirinya sendiri.
          </p>
          <p>
            Ada plafon tiga bacaan tercatat per hari. Pembaca paling gigih dan
            penyerang paling gigih mendapat jumlah yang persis sama.
          </p>
        </div>
      </section>

      <section className="max-w-2xl space-y-6">
        <h2 className="font-serif text-2xl">Yang tidak kami klaim</h2>
        <div className="space-y-5 leading-relaxed text-ink-soft">
          <p>
            Tidak ada cara membuktikan seseorang membaca. Yang bisa diperiksa hanya
            apakah bentuk sebuah sesi masuk akal sebagai bacaan manusia — kecepatan
            yang wajar, perhatian yang terputus-putus seperti perhatian orang sungguhan,
            dan satu pertanyaan pendek yang jawabannya cuma ada di halaman itu.
          </p>
          <p>
            Itu bukan bukti. Kami menyebutnya apa adanya, dan merancang seluruh
            sistemnya dengan asumsi bahwa pemeriksaan itu bisa dilewati.
          </p>
        </div>
        <Link href="/how-it-works" className="inline-block text-sm underline">
          Rincian lengkapnya
        </Link>
      </section>

      <section className="max-w-2xl space-y-5 rounded-lg border border-rule bg-paper-raised p-6">
        <h2 className="font-serif text-xl">Soal uang</h2>
        <p className="leading-relaxed text-ink-soft">
          Token Stele berjalan di devnet dan tidak punya nilai finansial. Itu bukan
          keterbatasan yang sedang menunggu diperbaiki — itu memang bentuk yang
          diinginkan. Membayar orang untuk beribadah adalah hal yang wajar ditolak
          banyak orang, dan kami tidak berminat membangunnya.
        </p>
      </section>
    </div>
  );
}
