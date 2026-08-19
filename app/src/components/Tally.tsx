"use client";

import { useEffect, useRef, useState } from "react";

import { useLocale } from "@/app/providers";
import { formatNumber } from "@/lib/i18n";

/**
 * Angka yang naik dari nol saat pertama terlihat.
 *
 * Angka akhirnya sudah ada di HTML sebagai teks, jadi tanpa JavaScript pun
 * pembaca tetap melihat jumlah yang benar. Yang ditambahkan di sini hanya
 * hitungannya, bukan datanya.
 */
export function Tally({ value }: { value: number }) {
  const locale = useLocale();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (calm.matches || value <= 0) return;

    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();

        const started = performance.now();
        const span = 1100;

        const step = (now: number) => {
          const t = Math.min(1, (now - started) / span);
          // Melambat di ujung, seperti sesuatu yang berhenti sendiri
          // ketimbang direm.
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(Math.round(value * eased));
          if (t < 1) frame = requestAnimationFrame(step);
        };

        setShown(0);
        frame = requestAnimationFrame(step);
      },
      { rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  // Pemisah ribuan mengikuti bahasa pembaca. Sebelum ini "id-ID" tertulis
  // tetap, sehingga pembaca Inggris melihat 1.074 — yang di kebiasaannya
  // berarti satu koma nol tujuh empat, bukan seribu tujuh puluh empat.
  // Lebar tabular menahan angka supaya tidak bergeser-geser saat berubah.
  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {formatNumber(shown, locale)}
    </span>
  );
}
