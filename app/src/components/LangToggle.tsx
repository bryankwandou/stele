"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { LOCALE_INFO, LOCALES, type Locale } from "@/lib/i18n";

/**
 * Pemilih bahasa.
 *
 * Ditulis sebagai `details` berisi tautan biasa, bukan menu yang digerakkan
 * skrip, supaya tetap berfungsi sebelum JavaScript termuat dan setiap bahasa
 * bisa dibuka di tab baru. Lintasan saat ini ikut dikirim agar pembaca kembali
 * ke halaman yang sedang dibacanya, bukan dilempar ke halaman muka.
 *
 * Nama tiap bahasa ditulis dalam bahasa itu sendiri. Pembaca yang tanpa sengaja
 * mendarat di antarmuka yang tidak ia mengerti tetap bisa menemukan jalan
 * pulang, yang tidak akan terjadi bila daftarnya ikut diterjemahkan.
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

  return (
    <details className="group relative shrink-0">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md border border-rule px-2.5 py-1 text-xs uppercase tracking-wider text-ink-soft transition-colors hover:border-ink hover:text-ink [&::-webkit-details-marker]:hidden">
        <span aria-hidden>{locale.toUpperCase()}</span>
        <span className="sr-only">{label}</span>
        <svg
          aria-hidden
          viewBox="0 0 10 6"
          className="h-1.5 w-2.5 transition-transform group-open:rotate-180"
        >
          <path
            d="M1 1l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </summary>

      <ul className="absolute end-0 z-20 mt-1 min-w-44 rounded-md border border-rule bg-paper-raised py-1 shadow-lg">
        {LOCALES.map((code) => {
          const info = LOCALE_INFO[code];
          const current = code === locale;
          return (
            <li key={code}>
              <a
                href={`/api/locale?to=${code}&next=${encodeURIComponent(next)}`}
                hrefLang={code}
                lang={code}
                dir={info.dir}
                aria-current={current ? "true" : undefined}
                className={`block px-3 py-1.5 text-sm transition-colors hover:bg-rule/40 ${
                  current ? "text-ink" : "text-ink-soft"
                }`}
              >
                {info.label}
              </a>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
