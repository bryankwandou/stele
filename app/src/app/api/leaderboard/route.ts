import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 60;

/**
 * Papan peringkat diurutkan berdasarkan beruntun, bukan jumlah token.
 *
 * Detail kecil dengan akibat besar. Memeringkat berdasarkan volume adalah
 * undangan terbuka untuk mengejar angka, dan itu persis perilaku yang tidak
 * ingin didorong produk ini.
 */
export async function GET() {
  const rows = (await sql`
    SELECT wallet, streak_current, streak_best, total_passages
    FROM readers
    WHERE streak_current > 0
    ORDER BY streak_current DESC, streak_best DESC, total_passages DESC
    LIMIT 50
  `) as {
    wallet: string;
    streak_current: number;
    streak_best: number;
    total_passages: number;
  }[];

  // `attempted` hanya menghitung sesi yang benar-benar ditutup. Sesi yang masih
  // terbuka belum punya putusan, jadi memasukkannya akan membuat rasio dicatat
  // terhadap dicoba terlihat lebih buruk daripada keadaannya.
  const totals = (await sql`
    SELECT
      (SELECT COUNT(*)::int FROM readers) AS readers,
      (SELECT COUNT(*)::int FROM sessions WHERE verdict = 'counted') AS counted,
      (SELECT COUNT(*)::int FROM sessions WHERE finished_at IS NOT NULL) AS attempted,
      (SELECT COALESCE(MAX(streak_best), 0)::int FROM readers) AS longest
  `) as { readers: number; counted: number; attempted: number; longest: number }[];

  return NextResponse.json({
    // Dompet dipendekkan; alamat penuh tidak perlu dipajang di halaman publik.
    entries: rows.map((r, i) => ({
      rank: i + 1,
      wallet: `${r.wallet.slice(0, 4)}…${r.wallet.slice(-4)}`,
      streak: r.streak_current,
      best: r.streak_best,
      passages: r.total_passages,
    })),
    totals: totals[0] ?? { readers: 0, counted: 0, attempted: 0, longest: 0 },
  });
}
