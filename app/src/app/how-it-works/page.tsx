export const metadata = {
  title: "Cara kerjanya — Stele",
  description:
    "Apa yang diperiksa Stele, apa yang dicatat, dan apa yang sengaja tidak diklaim.",
};

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-12 px-6 py-16">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl">Cara kerjanya</h1>
        <p className="leading-relaxed text-ink-soft">
          Membaca tidak bisa dibuktikan secara kriptografis. Halaman ini
          menjelaskan apa yang benar-benar diperiksa, supaya Anda bisa menilai
          sendiri seberapa berarti catatan yang Anda dapat.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Yang diperiksa</h2>
        <ul className="space-y-3 leading-relaxed text-ink-soft">
          <li>
            <strong className="text-ink">Kecepatan.</strong> Waktu baca
            dibandingkan dengan jumlah kata. Di bawah 40 kata per menit dianggap
            tab yang ditinggalkan; di atas 400 kata per menit bukan kecepatan baca
            manusia.
          </li>
          <li>
            <strong className="text-ink">Waktu tab terlihat.</strong> Yang
            dihitung hanya detik ketika halaman benar-benar terlihat. Pindah tab
            menghentikan hitungan.
          </li>
          <li>
            <strong className="text-ink">Bentuk gulir.</strong> Perikop panjang
            yang dibaca tanpa satu pun gulir bukan bacaan.
          </li>
          <li>
            <strong className="text-ink">Jangkar.</strong> Satu pertanyaan tentang
            letak sebuah kata. Ini bukti kehadiran, bukan bukti pemahaman —
            dan menjawab keliru tidak menghapus bacaan Anda.
          </li>
          <li>
            <strong className="text-ink">Plafon.</strong> Tiga bacaan tercatat per
            dompet per hari, ditegakkan di server dan di program on-chain.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Kenapa plafon yang paling penting</h2>
        <p className="leading-relaxed text-ink-soft">
          Semua pemeriksaan di atas bisa ditiru oleh skrip yang cukup sabar.
          Plafon tidak. Bahkan jika seluruh heuristik gagal sekaligus, kerugian
          maksimalnya tetap tiga catatan per hari per dompet — jumlah yang sama
          dengan pembaca paling rajin. Tidak ada skala yang bisa dikejar di sana.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Yang dicatat</h2>
        <p className="leading-relaxed text-ink-soft">
          Di rantai: alamat dompet, hari kalender lokal, panjang beruntun, dan
          jumlah token. Di basis data: metadata sesi (durasi, jumlah gulir,
          perikop yang dibuka). Tidak ada isi bacaan, tidak ada gerak kursor,
          tidak ada rekaman sesi, tidak ada identitas di luar alamat dompet.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Yang tidak diklaim</h2>
        <p className="leading-relaxed text-ink-soft">
          Stele tidak mengklaim Anda memahami yang dibaca, tidak menilai
          kesungguhan, dan tidak berpihak pada satu tradisi. Token $STL hidup di
          devnet, tidak punya nilai tukar, dan tidak dimaksudkan punya. Ia tanda
          terima atas kebiasaan, bukan upah atas ibadah.
        </p>
      </section>
    </main>
  );
}
