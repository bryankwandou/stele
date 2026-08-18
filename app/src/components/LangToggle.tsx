"use client";

import { usePathname, useSearchParams } from "next/navigation";

import type { Locale } from "@/lib/i18n";

/**
 * Pemindah bahasa.
 *
 * Ditulis sebagai tautan biasa, bukan tombol yang memanggil skrip, supaya tetap
 * berfungsi sebelum JavaScript termuat dan bisa dibuka di tab baru. Lintasan
 * saat ini ikut dikirim agar pembaca kembali ke halaman yang sedang dibacanya,
 * bukan dilempar ke halaman muka.
 */
export function LangToggle({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();

  const query = params.toString();
  const next = query ? `${pathname}?${query}` : pathname;
  const to: Locale = locale === "en" ? "id" : "en";

  return (
    <a
      href={`/api/locale?to=${to}&next=${encodeURIComponent(next)}`}
      hrefLang={to}
      className="shrink-0 rounded-md border border-rule px-2.5 py-1 text-xs uppercase tracking-wider text-ink-soft transition-colors hover:border-ink hover:text-ink"
    >
      <span aria-hidden>{to === "en" ? "EN" : "ID"}</span>
      <span className="sr-only">{label}</span>
    </a>
  );
}
