"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookSummary, TranslationSummary, TraditionId } from "@/lib/corpus";

/**
 * Pemilih terjemahan, kitab, dan pasal.
 *
 * Daftar terjemahan bisa lebih dari seribu entri, jadi penyaringan bahasa
 * dilakukan lebih dulu. Menampilkan seribu pilihan sekaligus bukan pilihan —
 * itu memindahkan pekerjaan menyaring ke pembaca.
 */
export function Picker({
  tradition,
  translations,
  initialBooks,
}: {
  tradition: TraditionId;
  translations: TranslationSummary[];
  initialBooks: BookSummary[];
}) {
  const router = useRouter();

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of translations) {
      counts.set(t.language, (counts.get(t.language) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [translations]);

  const defaultLanguage = useMemo(() => {
    const preferred = languages.find(([name]) =>
      /indones|malay/i.test(name)
    );
    return preferred?.[0] ?? languages[0]?.[0] ?? "";
  }, [languages]);

  const [language, setLanguage] = useState(defaultLanguage);
  const inLanguage = useMemo(
    () => translations.filter((t) => t.language === language),
    [translations, language]
  );

  const [translationId, setTranslationId] = useState(inLanguage[0]?.id ?? "");
  const [books, setBooks] = useState<BookSummary[]>(initialBooks);
  const [bookId, setBookId] = useState(initialBooks[0]?.id ?? "");
  const [chapter, setChapter] = useState(1);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Berpindah bahasa mengubah daftar terjemahan, jadi pilihan lama harus diganti.
  useEffect(() => {
    setTranslationId(inLanguage[0]?.id ?? "");
  }, [inLanguage]);

  // Untuk Alkitab, daftar kitab berbeda antar terjemahan — kanon Protestan dan
  // Katolik tidak sama. Karena itu daftarnya diambil ulang setiap kali
  // terjemahan berganti, bukan diasumsikan tetap.
  useEffect(() => {
    if (tradition !== "christian" || !translationId) return;

    let cancelled = false;
    setLoadingBooks(true);

    fetch(`/api/books?tradition=${tradition}&translation=${encodeURIComponent(translationId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { books: BookSummary[] }) => {
        if (cancelled) return;
        setBooks(data.books);
        setBookId(data.books[0]?.id ?? "");
        setChapter(1);
      })
      .catch(() => {
        if (!cancelled) setBooks([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBooks(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tradition, translationId]);

  const selectedBook = books.find((b) => b.id === bookId);
  const maxChapter = selectedBook?.chapters ?? 1;
  const ready = Boolean(translationId && bookId);

  function open() {
    if (!ready) return;
    router.push(
      `/read/${tradition}/${encodeURIComponent(translationId)}/${encodeURIComponent(bookId)}/${chapter}`
    );
  }

  const fieldClass =
    "w-full rounded-md border border-rule bg-paper-raised px-3 py-2 text-sm";

  return (
    <div className="max-w-2xl space-y-5 rounded-lg border border-rule bg-paper-raised p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm text-ink-soft">Bahasa</span>
          <select
            className={fieldClass}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm text-ink-soft">Terjemahan</span>
          <select
            className={fieldClass}
            value={translationId}
            onChange={(e) => setTranslationId(e.target.value)}
          >
            {inLanguage.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm text-ink-soft">
            {tradition === "islam" ? "Surah" : tradition === "buddhist" ? "Vagga" : "Kitab"}
          </span>
          <select
            className={fieldClass}
            value={bookId}
            disabled={loadingBooks || books.length === 0}
            onChange={(e) => {
              setBookId(e.target.value);
              setChapter(1);
            }}
          >
            {loadingBooks && <option>Memuat…</option>}
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        {maxChapter > 1 && (
          <label className="space-y-1.5">
            <span className="text-sm text-ink-soft">Pasal</span>
            <select
              className={fieldClass}
              value={chapter}
              onChange={(e) => setChapter(Number(e.target.value))}
            >
              {Array.from({ length: maxChapter }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <button
        onClick={open}
        disabled={!ready}
        className="rounded-md bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Buka bacaan
      </button>
    </div>
  );
}
