import { NextResponse } from "next/server";
import { isTradition, listBooks, type TraditionId } from "@/lib/corpus";

export const revalidate = 3600;

/**
 * Daftar kitab untuk satu terjemahan.
 *
 * Dibutuhkan karena kanon Alkitab berbeda antar terjemahan — Protestan, Katolik,
 * dan Ortodoks tidak memuat kitab yang sama. Mengasumsikan daftarnya seragam akan
 * menghasilkan tautan ke kitab yang tidak ada di terjemahan terpilih.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tradition = searchParams.get("tradition") as TraditionId | null;
  const translation = searchParams.get("translation") ?? "";

  if (!isTradition(tradition)) {
    return NextResponse.json({ error: "Tradisi tidak dikenal." }, { status: 400 });
  }

  try {
    return NextResponse.json({ books: await listBooks(tradition, translation) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Daftar kitab gagal dimuat." },
      { status: 502 }
    );
  }
}
