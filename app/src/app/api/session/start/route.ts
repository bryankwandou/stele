import { NextResponse } from "next/server";
import { randomUUID, randomBytes } from "node:crypto";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

import { sql, upsertReader, countedToday } from "@/lib/db";
import { getPassage, passageId, type TraditionId } from "@/lib/corpus";
import { buildAnchor, localDay, DAILY_CAP } from "@/lib/attention";

export const runtime = "nodejs";

/**
 * Membuka satu sesi baca.
 *
 * Nonce diterbitkan di sini, bukan di klien. Klien yang menerbitkan nonce
 * sendiri berarti klien bisa memilih nonce yang belum terpakai sesukanya —
 * dan perlindungan replay ikut hilang.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON yang sah." }, { status: 400 });
  }

  const wallet = String(body.wallet ?? "");
  const tradition = String(body.tradition ?? "") as TraditionId;
  const translationId = String(body.translationId ?? "");
  const bookId = String(body.bookId ?? "");
  const chapter = Number(body.chapter ?? 0);
  const tzOffsetMinutes = Number(body.tzOffsetMinutes ?? 0);

  try {
    new PublicKey(wallet);
  } catch {
    return NextResponse.json({ error: "Alamat dompet tidak sah." }, { status: 400 });
  }

  if (!["christian", "islam", "buddhist"].includes(tradition)) {
    return NextResponse.json({ error: "Tradisi tidak dikenal." }, { status: 400 });
  }

  if (!Number.isFinite(chapter) || chapter < 1) {
    return NextResponse.json({ error: "Nomor pasal tidak sah." }, { status: 400 });
  }

  if (!Number.isFinite(tzOffsetMinutes) || Math.abs(tzOffsetMinutes) > 840) {
    return NextResponse.json({ error: "Zona waktu di luar rentang." }, { status: 400 });
  }

  let passage;
  try {
    passage = await getPassage(tradition, translationId, bookId, chapter);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Perikop gagal dimuat." },
      { status: 502 }
    );
  }

  if (passage.verses.length === 0) {
    return NextResponse.json({ error: "Perikop ini kosong." }, { status: 404 });
  }

  await upsertReader(wallet, tzOffsetMinutes);

  const today = localDay(Math.floor(Date.now() / 1000), tzOffsetMinutes);
  const already = await countedToday(wallet, today);

  const anchor = buildAnchor(passage.verses);
  const id = randomUUID();
  const nonce = bs58.encode(randomBytes(16));

  await sql`
    INSERT INTO sessions (id, wallet, passage_id, word_count, local_day, anchor_word, anchor_answer, nonce)
    VALUES (
      ${id}, ${wallet}, ${passageId(tradition, translationId, bookId, chapter)},
      ${passage.wordCount}, ${today}, ${anchor?.word ?? null}, ${anchor?.answer ?? null}, ${nonce}
    )
  `;

  return NextResponse.json({
    sessionId: id,
    wordCount: passage.wordCount,
    // Jawabannya tidak pernah dikirim ke klien.
    anchor: anchor ? { word: anchor.word, options: anchor.options } : null,
    countedToday: already,
    dailyCap: DAILY_CAP,
  });
}
