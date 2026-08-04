import { NextResponse } from "next/server";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

import { sql, countedToday, getReader } from "@/lib/db";
import { assess, localDay, CLAIM_DELAY_MS } from "@/lib/attention";
import { signAttestation, rewardFor } from "@/lib/attestor";

export const runtime = "nodejs";

interface SessionRecord {
  id: string;
  wallet: string;
  word_count: number;
  local_day: number;
  started_at: string;
  finished_at: string | null;
  anchor_answer: number | null;
  nonce: string;
}

/**
 * Menutup sesi dan, bila lolos, menerbitkan attestation.
 *
 * Semua angka yang menentukan dinilai ulang di sini dari catatan server —
 * jumlah kata, waktu mulai, jawaban jangkar. Yang datang dari klien hanyalah
 * sinyal perilaku, dan sinyal itu sendiri tidak pernah cukup untuk meloloskan
 * sesi tanpa melewati batas waktu yang dicatat server.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON yang sah." }, { status: 400 });
  }

  const sessionId = String(body.sessionId ?? "");
  const activeMs = Math.max(0, Number(body.activeMs ?? 0));
  const wallMs = Math.max(0, Number(body.wallMs ?? 0));
  const scrollEvents = Math.max(0, Number(body.scrollEvents ?? 0));
  const backtracks = Math.max(0, Number(body.backtracks ?? 0));
  const anchorChoice = body.anchorChoice == null ? null : Number(body.anchorChoice);

  const rows = (await sql`
    SELECT id, wallet, word_count, local_day, started_at, finished_at, anchor_answer, nonce
    FROM sessions WHERE id = ${sessionId}
  `) as SessionRecord[];

  const session = rows[0];
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 404 });
  }
  if (session.finished_at) {
    return NextResponse.json({ error: "Sesi ini sudah ditutup." }, { status: 409 });
  }

  // Waktu berjalan diambil dari jam server, bukan dari klien. Klien boleh
  // berbohong soal activeMs, tetapi tidak bisa memundurkan started_at.
  const elapsedServerMs = Date.now() - new Date(session.started_at).getTime();
  const trustedActiveMs = Math.min(activeMs, elapsedServerMs);

  const anchorOk =
    session.anchor_answer == null ? true : anchorChoice === session.anchor_answer;

  const already = await countedToday(session.wallet, session.local_day);

  const result = assess(
    {
      activeMs: trustedActiveMs,
      wallMs,
      scrollEvents,
      backtracks,
      anchorOk,
      wordCount: session.word_count,
    },
    already
  );

  await sql`
    UPDATE sessions SET
      finished_at   = now(),
      active_ms     = ${trustedActiveMs},
      wall_ms       = ${wallMs},
      scroll_events = ${scrollEvents},
      backtracks    = ${backtracks},
      anchor_ok     = ${anchorOk},
      confidence    = ${result.confidence},
      verdict       = ${result.verdict}
    WHERE id = ${sessionId}
  `;

  if (result.verdict !== "counted") {
    return NextResponse.json({
      verdict: result.verdict,
      message: result.message,
      attestation: null,
    });
  }

  // Beruntun dihitung di server untuk ditampilkan; program on-chain menghitung
  // ulang sendiri dan itulah angka yang mengikat.
  const reader = await getReader(session.wallet);
  const today = localDay(Math.floor(Date.now() / 1000), reader?.tz_offset_minutes ?? 0);
  const previous = reader?.last_counted_day ?? null;

  let streak = reader?.streak_current ?? 0;
  if (previous !== today) {
    streak = previous !== null && previous === today - 1 ? streak + 1 : 1;
    await sql`
      UPDATE readers SET
        streak_current   = ${streak},
        streak_best      = GREATEST(streak_best, ${streak}),
        last_counted_day = ${today},
        total_passages   = total_passages + 1
      WHERE wallet = ${session.wallet}
    `;
  } else {
    await sql`
      UPDATE readers SET total_passages = total_passages + 1
      WHERE wallet = ${session.wallet}
    `;
  }

  const attestation = signAttestation(
    new PublicKey(session.wallet),
    bs58.decode(session.nonce),
    rewardFor(streak)
  );

  return NextResponse.json({
    verdict: "counted",
    message: result.message,
    streak,
    // Klien menahan pengiriman selama jeda ini. Program tidak menegakkannya,
    // jadi ini penghalang kenyamanan, bukan pengaman — dan disebut apa adanya.
    claimDelayMs: CLAIM_DELAY_MS,
    attestation,
  });
}
