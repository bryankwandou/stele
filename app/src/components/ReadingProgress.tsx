"use client";

import { useEffect, useState } from "react";

/**
 * Garis tipis di tepi atas yang menunjukkan sejauh mana perikop sudah dilewati.
 *
 * Halaman bacaan tidak punya nomor halaman, jadi tanpa penanda seperti ini
 * pembaca kehilangan gambaran berapa banyak yang tersisa — hal yang di buku
 * cetak diberitahu begitu saja oleh tebal kertas di tangan kanan.
 *
 * Yang berubah hanya satu properti kustom, dan yang dianimasikan hanya lebar
 * satu elemen yang berdiri sendiri, sehingga tidak ada tata letak yang dihitung
 * ulang saat halaman digulir. Nilainya juga dibaca lewat `requestAnimationFrame`
 * agar tidak ada pengukuran yang dilakukan lebih sering daripada layar digambar.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      // Halaman yang lebih pendek dari layar tidak punya kemajuan untuk
      // ditunjukkan; garisnya dibiarkan kosong, bukan dipenuhi.
      setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="progress-rail"
      aria-hidden
      style={{ "--progress": `${progress}%` } as React.CSSProperties}
    />
  );
}
