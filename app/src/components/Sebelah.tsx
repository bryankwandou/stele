import Link from "next/link";

import { listBooks, type TraditionId } from "@/lib/corpus";
import { copy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

/**
 * Tautan ke perikop sebelum dan sesudahnya.
 *
 * Sampai sekarang halaman bacaan adalah jalan buntu: begitu satu pasal habis,
 * satu-satunya jalan ke pasal berikutnya adalah kembali ke halaman tradisi dan
 * memilihnya lagi dari awal. Untuk kitab yang dibaca berurutan — dan hampir
 * semua yang ada di sini memang dibaca begitu — itu memutus kebiasaan yang
 * justru sedang dicoba dibangun aplikasi ini.
 *
 * Dua bentuk berpindah yang berbeda, dan keduanya diputuskan dari data, bukan
 * dari daftar cabang per tradisi. Kitab yang punya banyak pasal berpindah pasal
 * di dalam kitabnya. Arsip yang menaruh seluruh isinya sebagai satu tingkat —
 * surah, vagga, adhyaya, ang — berpindah ke nomor berikutnya di tingkat itu.
 * Bedanya cukup dilihat dari `chapters`, jadi tradisi baru tidak perlu menambah
 * cabang baru di sini.
 *
 * Daftar kitabnya diambil ulang, tetapi lapisan fetch menyinggahkannya satu
 * jam, jadi yang terjadi di sini bukan panggilan baru ke arsip sumbernya.
 */
export async function Sebelah({
  tradition,
  translationId,
  bookId,
  chapter,
}: {
  tradition: TraditionId;
  translationId: string;
  bookId: string;
  chapter: number;
}) {
  const c = copy(await getLocale());

  let books;
  try {
    books = await listBooks(tradition, translationId);
  } catch {
    // Arsipnya sedang tidak menjawab. Perikop yang sudah terlanjur tampil tetap
    // bisa dibaca; yang hilang hanya tautan ke tetangganya.
    return null;
  }

  const i = books.findIndex((b) => b.id === bookId);
  if (i < 0) return null;

  const book = books[i];
  const jalan = (b: string, p: number) =>
    `/read/${tradition}/${encodeURIComponent(translationId)}/${encodeURIComponent(b)}/${p}`;

  let mundur: { href: string; label: string } | null = null;
  let maju: { href: string; label: string } | null = null;

  if (book.chapters > 1) {
    if (chapter > 1) {
      mundur = { href: jalan(bookId, chapter - 1), label: `${book.name} ${chapter - 1}` };
    } else if (i > 0) {
      // Awal satu kitab menyambung ke pasal terakhir kitab sebelumnya, bukan ke
      // ruang kosong.
      const sebelum = books[i - 1];
      mundur = {
        href: jalan(sebelum.id, sebelum.chapters),
        label: `${sebelum.name} ${sebelum.chapters}`,
      };
    }

    if (chapter < book.chapters) {
      maju = { href: jalan(bookId, chapter + 1), label: `${book.name} ${chapter + 1}` };
    } else if (i + 1 < books.length) {
      const sesudah = books[i + 1];
      maju = { href: jalan(sesudah.id, 1), label: `${sesudah.name} 1` };
    }
  } else {
    if (i > 0) mundur = { href: jalan(books[i - 1].id, 1), label: books[i - 1].name };
    if (i + 1 < books.length)
      maju = { href: jalan(books[i + 1].id, 1), label: books[i + 1].name };
  }

  if (!mundur && !maju) return null;

  return (
    <nav
      aria-label={c.reader.nearby}
      className="mt-14 grid gap-3 border-t border-rule pt-8 sm:grid-cols-2"
    >
      {/* Yang mundur tetap memesan kolomnya walau kosong, supaya yang maju tidak
          berpindah ke kiri di pasal pertama. */}
      {mundur ? (
        <Link href={mundur.href} className="slab rounded-lg p-4 text-start">
          <span className="block text-xs uppercase tracking-wider text-ink-soft">
            {c.reader.previous}
          </span>
          <span className="mt-1 block font-serif text-lg">{mundur.label}</span>
        </Link>
      ) : (
        <span aria-hidden />
      )}

      {maju && (
        <Link href={maju.href} className="slab rounded-lg p-4 text-end sm:col-start-2">
          <span className="block text-xs uppercase tracking-wider text-ink-soft">
            {c.reader.next}
          </span>
          <span className="mt-1 block font-serif text-lg">{maju.label}</span>
        </Link>
      )}
    </nav>
  );
}
