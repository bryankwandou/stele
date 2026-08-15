/**
 * Nilai bersama untuk seluruh adegan.
 *
 * Warnanya diambil dari palet aplikasi, bukan dipilih ulang di sini. Video yang
 * warnanya meleset sedikit dari produknya terlihat seperti buatan pihak lain.
 */

export const WARNA = {
  batu1: "#EFE9DC",
  batu2: "#E0D7C4",
  batu3: "#C6B99E",
  pahat: "#4A3F2C",
  tinta: "#1B1A17",
  tintaLembut: "#6B6355",
  tanah: "#B5502A",
  patina: "#3F5C55",
} as const;

export const HURUF = {
  ukir: '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
  badan: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif',
  angka: 'ui-monospace, "Cascadia Mono", Consolas, monospace',
} as const;

export const FPS = 30;

/** Durasi tiap adegan dalam bingkai. */
export const ADEGAN = {
  pembuka: 5 * FPS,
  masalah: 5 * FPS,
  balik: 5 * FPS,
  rantai: 6 * FPS,
  // Adegan terpanjang, dan sengaja. Tujuh baris yang muncul satu per satu
  // butuh waktu untuk terbaca; memotongnya akan membuat bagian yang paling
  // membuktikan justru jadi yang paling terburu-buru.
  bukti: 9 * FPS,
  cakupan: 5 * FPS,
  plafon: 5 * FPS,
  penutup: 4 * FPS,
} as const;

export const TOTAL = Object.values(ADEGAN).reduce((a, b) => a + b, 0);
