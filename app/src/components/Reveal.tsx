"use client";

import { useEffect, useRef } from "react";

/**
 * Menampakkan anaknya saat ia masuk ke layar.
 *
 * Gerakannya sengaja kecil — naik beberapa piksel, tanpa skala, tanpa putaran.
 * Halaman ini isinya teks panjang untuk dibaca lama; animasi yang menarik
 * perhatian ke dirinya sendiri justru bekerja melawan itu.
 *
 * Keadaan awalnya tampil, bukan tersembunyi.
 *
 * Bentuk yang lama menulis `opacity: 0` langsung pada elemennya lalu
 * menaikkannya setelah pengamat menyala. Selama itu berjalan, hasilnya sama;
 * yang tidak sama adalah apa yang terjadi ketika ia tidak berjalan. Satu galat
 * hidrasi, satu pemblokir skrip, satu perayap yang tidak menjalankan
 * JavaScript — dan seluruh isi halaman tinggal ruang kosong, karena satu-satunya
 * yang bisa mengembalikannya adalah skrip yang tadi gagal. Sekarang
 * penyembunyiannya dipasang oleh CSS dan hanya berlaku di bawah `data-motion`,
 * penanda yang dipasang skrip sangat pendek di kepala dokumen sebelum halaman
 * pertama kali dilukis. Tanpa skrip, tidak ada penanda, dan tidak ada yang
 * disembunyikan.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Bila gerak diminta dikurangi, penanda `data-motion` tidak pernah dipasang
    // dan CSS-nya tidak pernah menyembunyikan apa pun. Tidak ada yang perlu
    // dikerjakan di sini.
    if (!document.documentElement.hasAttribute("data-motion")) return;

    // Sekali tampak, biarkan tampak. Elemen yang memudar lagi saat digulir ke
    // atas membuat pembaca merasa kehilangan tempatnya.
    const pengamat = new IntersectionObserver(
      (masuk) => {
        for (const m of masuk) {
          if (!m.isIntersecting) continue;
          node.dataset.shown = "true";
          pengamat.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    pengamat.observe(node);
    return () => pengamat.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
