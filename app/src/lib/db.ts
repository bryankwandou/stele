import { neon } from "@neondatabase/serverless";

/**
 * Satu-satunya jalur ke Postgres.
 *
 * Yang tersimpan di sini hanya catatan pembacaan — tidak ada satu pun ayat.
 * Itu keputusan sadar: teks suci diambil dari CDN sumbernya saat diminta,
 * sehingga database tetap kecil dan kewajiban lisensi tetap di sumber aslinya.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL belum diset. Salin .env.example menjadi .env.local lalu isi."
  );
}

export const sql = neon(connectionString);

export interface ReaderRow {
  wallet: string;
  tz_offset_minutes: number;
  streak_current: number;
  streak_best: number;
  last_counted_day: number | null;
  total_passages: number;
  trust_score: number;
}

export interface SessionRow {
  id: string;
  wallet: string;
  passage_id: string;
  word_count: number;
  started_at: string;
  finished_at: string | null;
  active_ms: number | null;
  scroll_events: number | null;
  backtracks: number | null;
  anchor_ok: boolean | null;
  verdict: string | null;
  nonce: string;
}

export async function getReader(wallet: string): Promise<ReaderRow | null> {
  const rows = (await sql`
    SELECT wallet, tz_offset_minutes, streak_current, streak_best,
           last_counted_day, total_passages, trust_score
    FROM readers WHERE wallet = ${wallet}
  `) as ReaderRow[];
  return rows[0] ?? null;
}

export async function upsertReader(wallet: string, tzOffsetMinutes: number) {
  // Offset zona waktu hanya ditulis saat pendaftaran. Bila diizinkan berubah,
  // beruntun bisa diperpanjang dengan berpindah zona waktu.
  await sql`
    INSERT INTO readers (wallet, tz_offset_minutes)
    VALUES (${wallet}, ${tzOffsetMinutes})
    ON CONFLICT (wallet) DO NOTHING
  `;
}

/** Berapa sesi yang sudah dihitung hari ini menurut kalender lokal pembaca. */
export async function countedToday(wallet: string, localDay: number): Promise<number> {
  const rows = (await sql`
    SELECT COUNT(*)::int AS n
    FROM sessions
    WHERE wallet = ${wallet} AND verdict = 'counted' AND local_day = ${localDay}
  `) as { n: number }[];
  return rows[0]?.n ?? 0;
}

/** Sesi yang sudah dinilai layak tapi belum ditukar jadi transaksi on-chain. */
export async function pendingClaims(wallet: string): Promise<number> {
  const rows = (await sql`
    SELECT COUNT(*)::int AS n
    FROM sessions s
    LEFT JOIN claims c ON c.nonce = s.nonce
    WHERE s.wallet = ${wallet} AND s.verdict = 'counted' AND c.nonce IS NULL
  `) as { n: number }[];
  return rows[0]?.n ?? 0;
}
