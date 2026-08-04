import { sql } from "@/lib/db";

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

  return (
    <main className="mx-auto max-w-2xl space-y-10 px-6 py-16">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl">Beruntun</h1>
        <p className="leading-relaxed text-ink-soft">
          Diurutkan berdasarkan hari berturut-turut, bukan jumlah token. Yang
          diukur di sini kesinambungan, dan kesinambungan tidak bisa dikejar
          dalam satu malam.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-rule bg-paper-raised p-6 leading-relaxed text-ink-soft">
          Belum ada beruntun yang berjalan. Baris pertama masih kosong.
        </p>
      ) : (
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
                <td className="py-2.5 text-ink-soft">{i + 1}</td>
                <td className="py-2.5 font-mono text-xs">
                  {row.wallet.slice(0, 4)}…{row.wallet.slice(-4)}
                </td>
                <td className="py-2.5 text-right">{row.streak_current} hari</td>
                <td className="py-2.5 text-right text-ink-soft">{row.streak_best}</td>
                <td className="py-2.5 text-right text-ink-soft">
                  {row.total_passages}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
