import type { Metadata } from "next";

import { sql } from "@/lib/db";
import { copy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { Reveal } from "@/components/Reveal";
import { Tally } from "@/components/Tally";

export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const c = copy(await getLocale());
  return { title: c.board.metaTitle, description: c.board.metaDescription };
}

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
  const c = copy(await getLocale());

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
    { nilai: totals.readers, label: c.board.statReaders },
    { nilai: totals.counted, label: c.board.statCounted },
    { nilai: ditolak, label: c.board.statRejected },
    { nilai: totals.longest, label: c.board.statLongest },
  ];

  return (
    <main className="mx-auto max-w-2xl space-y-14 px-6 py-16">
      <Reveal>
        <header className="space-y-3">
          <h1 className="font-serif text-4xl">{c.board.title}</h1>
          <p className="leading-relaxed text-ink-soft">{c.board.lede}</p>
        </header>
      </Reveal>

      <Reveal delay={90}>
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.14em] text-ink-soft">{c.board.archiveHeading}</h2>
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
          <p className="border-t border-rule pt-4 text-sm leading-relaxed text-ink-soft">{c.board.rejectedNote}</p>
        </section>
      </Reveal>

      <Reveal delay={180}>
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.14em] text-ink-soft">{c.board.runningHeading}</h2>

          {rows.length === 0 ? (
            <p className="rounded-lg border border-rule bg-paper-raised p-6 leading-relaxed text-ink-soft">{c.board.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-rule text-left text-ink-soft">
                    <th className="py-2 font-normal">#</th>
                    <th className="py-2 font-normal">{c.board.colReader}</th>
                    <th className="py-2 text-right font-normal">{c.board.colStreak}</th>
                    <th className="py-2 text-right font-normal">{c.board.colBest}</th>
                    <th className="py-2 text-right font-normal">{c.board.colPassages}</th>
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
                        {row.streak_current} {c.board.days}
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

          <p className="text-sm leading-relaxed text-ink-soft">{c.board.footnote}</p>
        </section>
      </Reveal>
    </main>
  );
}
