"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Menampakkan anaknya saat ia masuk ke layar.
 *
 * Gerakannya sengaja kecil — naik delapan piksel, tanpa skala, tanpa putaran.
 * Halaman ini isinya teks panjang untuk dibaca lama; animasi yang menarik
 * perhatian ke dirinya sendiri justru bekerja melawan itu.
 *
 * Bila pengguna meminta gerakan dikurangi lewat setelan sistem, isinya langsung
 * tampil tanpa transisi apa pun. Itu diperiksa di sini, bukan hanya di CSS,
 * supaya elemen tidak pernah sempat berada dalam keadaan transparan.
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
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (calm.matches) {
      setShown(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    // Sekali tampak, biarkan tampak. Elemen yang memudar lagi saat digulir ke
    // atas membuat pembaca merasa kehilangan tempatnya.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(8px)",
        transition: `opacity 620ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 620ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
