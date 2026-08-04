import { NextResponse } from "next/server";
import { sql, getReader } from "@/lib/db";
import { DAILY_CAP, localDay } from "@/lib/attention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ringkasan satu pembaca.
 *
 * Alamat dompet dikirim oleh klien tanpa tanda tangan. Itu disengaja: semua yang
 * dikembalikan di sini sudah publik di rantai, jadi memaksa tanda tangan hanya
 * menambah gesekan tanpa menambah kerahasiaan apa pun.
 */
export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Alamat dompet wajib diisi." }, { status: 400 });
  }

  const reader = await getReader(wallet);
  if (!reader) {
    return NextResponse.json({
      registered: false,
      dailyCap: DAILY_CAP,
    });
  }

  const today = localDay(Math.floor(Date.now() / 1000), reader.tz_offset_minutes);

  const [counts] = (await sql`
    SELECT
      COUNT(*) FILTER (WHERE verdict = 'counted' AND local_day = ${today})::int AS today,
      COUNT(*) FILTER (WHERE verdict = 'counted')::int AS counted,
      COUNT(*)::int AS attempted
    FROM sessions WHERE wallet = ${wallet}
  `) as { today: number; counted: number; attempted: number }[];

  const recent = (await sql`
    SELECT s.passage_id, s.verdict, s.started_at, c.signature, c.amount
    FROM sessions s
    LEFT JOIN claims c ON c.nonce = s.nonce
    WHERE s.wallet = ${wallet}
    ORDER BY s.started_at DESC
    LIMIT 20
  `) as {
    passage_id: string;
    verdict: string | null;
    started_at: string;
    signature: string | null;
    amount: string | null;
  }[];

  return NextResponse.json({
    registered: true,
    streak: reader.streak_current,
    best: reader.streak_best,
    totalPassages: reader.total_passages,
    countedToday: counts?.today ?? 0,
    dailyCap: DAILY_CAP,
    counted: counts?.counted ?? 0,
    attempted: counts?.attempted ?? 0,
    recent,
  });
}
