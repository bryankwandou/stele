"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lempeng batu yang dipahat baris demi baris.
 *
 * Ini satu-satunya animasi besar di halaman muka, dan ia ada karena punya
 * pekerjaan: menunjukkan apa yang sebenarnya dilakukan aplikasi ini. Setiap
 * garis adalah satu hari membaca yang tercatat. Garis terakhir berhenti di
 * tengah dengan warna tanah — hari ini, yang belum selesai.
 *
 * Pahatannya digambar dua kali: alur gelap, lalu serong terang sedikit di
 * bawahnya. Itu yang membuatnya terbaca sebagai torehan ke dalam batu dan bukan
 * garis yang ditempel di atasnya. Arah cahayanya dijaga konsisten dengan
 * lambangnya.
 */

const LINES = [
  { y: 62, len: 108 },
  { y: 88, len: 108 },
  { y: 114, len: 108 },
  { y: 140, len: 108 },
  { y: 166, len: 108 },
  { y: 192, len: 108 },
];

/** Baris berjalan: hari ini, masih separuh. */
const TODAY = { y: 218, len: 54 };

export function Carving() {
  const ref = useRef<SVGSVGElement>(null);
  const [cut, setCut] = useState(0);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setCalm(true);
      setCut(LINES.length + 1);
      return;
    }

    const node = ref.current;
    if (!node) return;

    let timers: ReturnType<typeof setTimeout>[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        // Jeda antar pahatan dibuat agak lambat. Memahat batu bukan pekerjaan
        // yang tergesa, dan temponya di sini ikut menyampaikan itu.
        timers = [...LINES, TODAY].map((_, i) =>
          setTimeout(() => setCut(i + 1), 240 + i * 300)
        );
      },
      { rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  function stroke(len: number, index: number) {
    const done = cut > index;
    return {
      strokeDasharray: len,
      strokeDashoffset: done ? 0 : len,
      transition: calm
        ? "none"
        : "stroke-dashoffset 760ms cubic-bezier(0.16, 1, 0.3, 1)",
    };
  }

  return (
    <svg
      ref={ref}
      viewBox="0 0 232 268"
      className="h-auto w-full max-w-[232px]"
      role="img"
      aria-label="Lempeng batu berpahat; enam baris selesai, baris ketujuh masih separuh."
    >
      <defs>
        <linearGradient id="cvStone" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#F2ECDF" />
          <stop offset="0.52" stopColor="#DFD3BC" />
          <stop offset="1" stopColor="#C2B49A" />
        </linearGradient>
        <linearGradient id="cvEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="0.78" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#4A3F2C" stopOpacity="0.2" />
        </linearGradient>
        <clipPath id="cvSlab">
          <path d="M40 244 V72 a44 44 0 0 1 88 0 V244 Z" transform="translate(28)" />
        </clipPath>
      </defs>

      <ellipse cx="116" cy="245" rx="62" ry="7" fill="#4A3F2C" opacity="0.16" />

      <g transform="translate(28)">
        <path d="M40 244 V72 a44 44 0 0 1 88 0 V244 Z" fill="url(#cvStone)" />
        <path d="M40 244 V72 a44 44 0 0 1 88 0 V244 Z" fill="url(#cvEdge)" />
        <path
          d="M40 244 V72 a44 44 0 0 1 88 0 V244 Z"
          fill="none"
          stroke="#8A7A5E"
          strokeOpacity="0.55"
          strokeWidth="1.4"
        />
      </g>

      <g clipPath="url(#cvSlab)" strokeLinecap="round" strokeWidth="7">
        {/* Serong terang: sisi bawah alur yang tertimpa cahaya. */}
        <g stroke="#FFFFFF" strokeOpacity="0.5" transform="translate(58 3.4)">
          {LINES.map((line, i) => (
            <line
              key={`b${line.y}`}
              x1="14"
              y1={line.y}
              x2={14 + line.len}
              y2={line.y}
              style={stroke(line.len, i)}
            />
          ))}
          <line
            x1="14"
            y1={TODAY.y}
            x2={14 + TODAY.len}
            y2={TODAY.y}
            style={stroke(TODAY.len, LINES.length)}
          />
        </g>

        {/* Alur gelap. */}
        <g stroke="#6B5C42" strokeOpacity="0.78" transform="translate(58)">
          {LINES.map((line, i) => (
            <line
              key={`d${line.y}`}
              x1="14"
              y1={line.y}
              x2={14 + line.len}
              y2={line.y}
              style={stroke(line.len, i)}
            />
          ))}
        </g>

        {/* Hari ini. Warna tanah, dan sengaja tidak sampai ujung. */}
        <g transform="translate(58)">
          <line
            x1="14"
            y1={TODAY.y}
            x2={14 + TODAY.len}
            y2={TODAY.y}
            stroke="#B5502A"
            style={stroke(TODAY.len, LINES.length)}
          />
        </g>
      </g>
    </svg>
  );
}
