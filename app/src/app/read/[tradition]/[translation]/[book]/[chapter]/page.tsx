import { notFound } from "next/navigation";
import { getPassage, TRADITIONS, type TraditionId } from "@/lib/corpus";
import { Reader } from "@/components/Reader";

// Teks diambil dari sumber publik dan disimpan di cache tepi selama satu jam.
// Tidak ada salinan kitab yang disimpan di basis data kami.
export const revalidate = 3600;

interface Params {
  tradition: string;
  translation: string;
  book: string;
  chapter: string;
}

export default async function PassagePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { tradition, translation, book, chapter } = await params;

  if (!TRADITIONS.some((t) => t.id === tradition)) notFound();

  const chapterNumber = Number(chapter);
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) notFound();

  let passage;
  try {
    passage = await getPassage(
      tradition as TraditionId,
      decodeURIComponent(translation),
      decodeURIComponent(book),
      chapterNumber
    );
  } catch {
    // Sumber teks berada di luar kendali kami; kegagalannya diperlakukan sebagai
    // perikop yang tidak ada, bukan sebagai galat aplikasi.
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <Reader passage={passage} />
    </div>
  );
}
