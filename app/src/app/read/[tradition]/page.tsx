import { notFound } from "next/navigation";
import { TRADITIONS, listTranslations, listBooks, type TraditionId } from "@/lib/corpus";
import { Picker } from "@/components/Picker";

export const revalidate = 3600;

export default async function TraditionPage({
  params,
}: {
  params: Promise<{ tradition: string }>;
}) {
  const { tradition: id } = await params;
  const tradition = TRADITIONS.find((t) => t.id === id);
  if (!tradition) notFound();

  const traditionId = tradition.id as TraditionId;

  let translations;
  try {
    translations = await listTranslations(traditionId);
  } catch {
    return (
      <div className="max-w-lg space-y-3">
        <h1 className="font-serif text-2xl">{tradition.name}</h1>
        <p className="text-ink-soft">
          Daftar terjemahan sedang tidak bisa diambil dari sumbernya. Ini gangguan di
          sisi penyedia teks, bukan di bacaan Anda. Coba lagi sebentar lagi.
        </p>
      </div>
    );
  }

  // Untuk Qur'an dan Tipitaka, daftar kitab sama untuk semua terjemahan, jadi
  // bisa diambil sekali di sini. Untuk Alkitab, daftar kitab bergantung pada
  // terjemahan dan diambil oleh Picker setelah terjemahan dipilih.
  const books =
    traditionId === "christian" ? [] : await listBooks(traditionId, translations[0]?.id ?? "");

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <h1 className="font-serif text-3xl">{tradition.name}</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">{tradition.blurb}</p>
        <p className="mt-4 text-sm text-ink-soft">
          {translations.length} terjemahan tersedia.{" "}
          <a className="underline" href={tradition.attribution.href}>
            {tradition.attribution.label}
          </a>
          . {tradition.attribution.license}
        </p>
      </header>

      <Picker
        tradition={traditionId}
        translations={translations}
        initialBooks={books}
      />
    </div>
  );
}
