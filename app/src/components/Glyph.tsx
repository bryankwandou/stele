import type { TraditionId } from "@/lib/corpus";

/**
 * Satu tanda per kitab, diambil dari tulisan kitab itu sendiri.
 *
 * Halaman muka dan halaman pilih tradisi sebelumnya hanya berisi nama dan satu
 * kalimat. Pembaca yang belum kenal nama "Dhammapada" atau "Guru Granth Sahib"
 * tidak mendapat apa pun untuk dipegang matanya; keenam kartu terbaca sebagai
 * enam kotak teks yang sama.
 *
 * Yang dipasang di sini bukan foto sampul. Foto kitab suci hampir selalu foto
 * terbitan tertentu — ada pemegang haknya, dan memilih satu terbitan berarti
 * ikut memilih satu mazhab yang menerbitkannya, sesuatu yang aplikasi ini
 * sengaja tidak lakukan. Satu aksara dari tulisan kitabnya sendiri tidak
 * memihak, tidak berpemilik, dan justru lebih dikenali daripada sampul mana pun
 * oleh orang yang memang membacanya.
 *
 * Tandanya dinyatakan `aria-hidden` karena nama kitabnya selalu berdiri tepat
 * di sebelahnya; dibacakan dua kali hanya akan jadi pengulangan bagi pengguna
 * pembaca layar.
 */

/**
 * Aksara pembuka atau lambang yang paling dikenali dari tiap tulisan.
 *
 * Alfa untuk Alkitab — "Akulah Alfa dan Omega". Qaf untuk Al-Qur'an. Roda
 * dhamma untuk Dhammapada. Alef untuk Mishnah. Om untuk Bhagawadgita. Ik Onkar
 * untuk Guru Granth Sahib, aksara yang benar-benar membuka ang pertamanya.
 */
const TANDA: Record<TraditionId, string> = {
  christian: "Ω",
  islam: "ق",
  buddhist: "☸",
  jewish: "א",
  hindu: "ॐ",
  sikh: "ੴ",
};

/**
 * Tiap aksara butuh huruf yang memuatnya, dan tidak ada satu huruf pun yang
 * memuat keenamnya. Cadangannya disebut namanya di sini, bukan diserahkan pada
 * pilihan peramban, supaya kartunya tidak berubah rupa dari satu sistem ke
 * sistem lain — dan supaya yang muncul bukan kotak kosong.
 */
const HURUF: Record<TraditionId, string> = {
  christian: '"Cambria Math", "Segoe UI Symbol", "Noto Serif", serif',
  islam: '"Segoe UI", "Noto Naskh Arabic", "Geeza Pro", "Traditional Arabic", serif',
  buddhist: '"Segoe UI Symbol", "Noto Sans Symbols 2", "Apple Symbols", sans-serif',
  jewish: '"Segoe UI", "Noto Sans Hebrew", "Times New Roman", serif',
  hindu: '"Nirmala UI", "Noto Sans Devanagari", "Devanagari Sangam MN", serif',
  sikh: '"Nirmala UI", "Noto Sans Gurmukhi", "Gurmukhi MN", serif',
};

export function Glyph({ tradition }: { tradition: TraditionId }) {
  return (
    <span
      aria-hidden
      className="grid size-11 shrink-0 place-items-center rounded-md bg-paper-sunk text-2xl leading-none text-accent"
      style={{
        fontFamily: HURUF[tradition],
        // Tanda yang terbaca sebagai pahatan, bukan sebagai huruf yang
        // ditempelkan: satu bayang tipis ke bawah, satu sorot tipis ke atas.
        textShadow: "0 1px 0 var(--cut-light), 0 -1px 0 var(--cut-shadow)",
      }}
    >
      {TANDA[tradition]}
    </span>
  );
}
