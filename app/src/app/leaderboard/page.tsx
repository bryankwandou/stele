import { sql } from "@/lib/db";
import { Reveal } from "@/components/Reveal";
import { Tally } from "@/components/Tally";

export const runtime = "nodejs";
export const revalidate = 60;

export const metadata = {
  title: "Beruntun — Stele",
  description: "Peringkat berdasarkan hari berturut-turut, bukan jumlah token.",
};

interface Row {
  wallet: string;
  streak_current: number;
  streak_best: number;
  total_passages: number;
}

interface Totals {
  readers: number;
  counted: number;
  attempted: number;
  longest: number;
}

export default async function LeaderboardPage() {
  // Kueri langsung, bukan lewat route API. Halaman ini dirender di server, jadi
  // memanggil HTTP ke diri sendiri hanya menambah satu perjalanan tanpa guna.
  const rows = (await sql`
    SELECT wallet, streak_current, streak_best, total_passages
    FROM readers
    WHERE streak_current > 0
    ORDER BY streak_current DESC, streak_best DESC, total_passages DESC
    LIMIT 50
  `) as Row[];

  const [totals] = (await sql`
    SELECT
      (SELECT COUNT(*)::int FROM readers) AS readers,
      (SELECT COUNT(*)::int FROM sessions WHERE verdict = 'counted') AS counted,
      (SELECT COUNT(*)::int FROM sessions WHERE finished_at IS NOT NULL) AS attempted,
      (SELECT COALESCE(MAX(streak_best), 0)::int FROM readers) AS longest
  `) as Totals[];

  // Sesi yang ditutup tetapi tidak dicatat. Angkanya ditampilkan apa adanya:
  // menyembunyikan berapa banyak yang ditolak akan membuat penilaian terdengar
  // lebih pintar daripada yang sebenarnya.
  const ditolak = Math.max(0, totals.attempted - totals.counted);

  const angka = [
    { nilai: totals.readers, label: "pembaca terdaftar" },
    { nilai: totals.counted, label: "perikop tercatat" },
    { nilai: ditolak, label: "sesi tidak dicatat" },
    { nilai: totals.longest, label: "beruntun terpanjang" },
  ];

  return (
    <main className="mx-auto max-w-2xl space-y-14 px-6 py-16">
      <Reveal>
        <header className="space-y-3">
          <h1 className="font-serif text-4xl">Beruntun</h1>
          <p className="leading-relaxed text-ink-soft">
            Diurutkan berdasarkan hari berturut-turut, bukan jumlah token. Plafon
            harian membuat kolom mana pun yang berbasis volume mentok di angka
            yang sama untuk semua orang, jadi tidak ada gunanya memeringkatnya.
            Yang tersisa untuk dibedakan hanyalah kesinambungan — dan itu tidak
            bisa dikejar dalam satu malam.
          </p>
        </header>
      </Reveal>

      <Reveal delay={90}>
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.14em] text-ink-soft">
            Seluruh arsip sejauh ini
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
            {angka.map((a) => (
              <div key={a.label} className="space-y-1.5">
                <dt className="font-serif text-3xl tabular-nums">
                  <Tally value={a.nilai} />
                </dt>
                <dd className="text-xs leading-snug text-ink-soft">{a.label}</dd>
              </div>
            ))}
          </dl>
          <p className="border-t border-rule pt-4 text-sm leading-relaxed text-ink-soft">
            Kolom ketiga dipajang dengan sengaja. Sesi yang ditutup tanpa dicatat
            bukan kegagalan sistem — itu bentuk normal dari halaman yang dibuka
            lalu ditinggal, dan menyembunyikannya akan membuat penilaian terdengar
            lebih tajam daripada yang sebenarnya.
          </p>
        </section>
      </Reveal>

      <Reveal delay={180}>
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.14em] text-ink-soft">
            Yang sedang berjalan
          </h2>

          {rows.length === 0 ? (
            <p className="rounded-lg border border-rule bg-paper-raised p-6 leading-relaxed text-ink-soft">
              Belum ada beruntun yang berjalan. Baris pertama masih kosong.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-rule text-left text-ink-soft">
                    <th className="py-2 font-normal">#</th>
                    <th className="py-2 font-normal">Pembaca</th>
                    <th className="py-2 text-right font-normal">Beruntun</th>
                    <th className="py-2 text-right font-normal">Terbaik</th>
                    <th className="py-2 text-right font-normal">Perikop</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.wallet} className="border-b border-rule/60">
                      <td className="py-2.5 tabular-nums text-ink-soft">{i + 1}</td>
                      <td className="py-2.5 font-mono text-xs">
                        {row.wallet.slice(0, 4)}…{row.wallet.slice(-4)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {row.streak_current} hari
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-ink-soft">
                        {row.streak_best}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-ink-soft">
                        {row.total_passages}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-sm leading-relaxed text-ink-soft">
            Alamat dipendekkan. Tidak ada nama, tidak ada foto, dan tidak ada cara
            menaikkan posisi selain kembali besok.
          </p>
        </section>
      </Reveal>
    </main>
  );
}
