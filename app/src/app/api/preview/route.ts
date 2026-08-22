import { NextResponse } from "next/server";

import { getPassage, isTradition, type TraditionId } from "@/lib/corpus";

export const revalidate = 3600;

/** Sebanyak ini yang dikirim. Cukup untuk mengenali, kurang untuk menggantikan. */
const CUPLIKAN = 3;

/**
 * Beberapa baris pembuka dari perikop yang sedang dipilih.
 *
 * Sebelum ini pemilih hanya berisi empat kotak dan satu tombol: pembaca harus
 * menekan "Buka bacaan" dulu untuk tahu terjemahan yang dipilihnya berbunyi
 * seperti apa, lalu kembali bila ternyata tidak cocok. Untuk satu tradisi
 * dengan seribu terjemahan, itu bolak-balik yang tidak ada ujungnya.
 *
 * Yang dikirim sengaja hanya tiga ayat. Cuplikan ini alat pilih, bukan cara
 * membaca diam-diam tanpa tercatat — dan tiga ayat juga tidak cukup untuk
 * dipakai menyalin isi arsip orang lewat titik akhir ini.
 *
 * Hasilnya disinggahkan satu jam, sama seperti daftar kitab. Pemilih memanggil
 * titik akhir ini tiap kali pilihannya berubah, dan tanpa singgahan itu berarti
 * satu permintaan ke arsip sumber untuk setiap kali seseorang menggulir daftar.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tradition = searchParams.get("tradition") as TraditionId | null;
  const translation = searchParams.get("translation") ?? "";
  const book = searchParams.get("book") ?? "";
  const chapter = Number(searchParams.get("chapter") ?? "1");

  if (!isTradition(tradition)) {
    return NextResponse.json({ error: "Tradisi tidak dikenal." }, { status: 400 });
  }

  if (!Number.isFinite(chapter) || chapter < 1) {
    return NextResponse.json({ error: "Nomor pasal tidak sah." }, { status: 400 });
  }

  try {
    const passage = await getPassage(tradition, translation, book, chapter);
    return NextResponse.json({
      verses: passage.verses.slice(0, CUPLIKAN),
      // Jumlah utuhnya ikut dikirim supaya pemilih bisa menyebut berapa yang
      // menunggu di balik cuplikan, bukan sekadar memotong tanpa keterangan.
      total: passage.verses.length,
      words: passage.wordCount,
      direction: passage.direction,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cuplikan gagal dimuat." },
      { status: 502 }
    );
  }
}
