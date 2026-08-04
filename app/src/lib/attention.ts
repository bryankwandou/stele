/**
 * Penilaian perhatian.
 *
 * Tidak ada satu pun fungsi di sini yang membuktikan seseorang membaca. Itu
 * memang tidak bisa dibuktikan. Yang dinilai adalah apakah bentuk sesi ini
 * konsisten dengan membaca, dan tidak konsisten dengan otomatisasi.
 *
 * Lapisan yang paling menentukan justru bukan heuristik mana pun di berkas ini,
 * melainkan plafon harian di `DAILY_CAP`. Deteksi bisa dikelabui; plafon tidak.
 */

/** Sesi terhitung per hari, per dompet. Ditegakkan lagi di on-chain. */
export const DAILY_CAP = 3;

/** Batas atas kecepatan baca manusia. Di atas ini, tidak ada yang terbaca. */
export const MAX_WPM = 400;

/** Di bawah ini kemungkinan besar tab ditinggal terbuka, bukan dibaca. */
export const MIN_WPM = 40;

/** Jeda sebelum klaim bisa dikirim. Membunuh pola tembak-beruntun. */
export const CLAIM_DELAY_MS = 60_000;

/** Batas bawah waktu baca agar perikop sangat pendek tetap butuh perhatian. */
export const MIN_ACTIVE_MS = 20_000;

export type Verdict =
  | "counted"
  | "too_fast"
  | "too_slow"
  | "idle"
  | "anchor_failed"
  | "rate_limited"
  | "too_soon";

export interface AttentionSignals {
  /** Milidetik saat tab benar-benar terlihat. Waktu tersembunyi tidak dihitung. */
  activeMs: number;
  /** Total waktu dinding, termasuk saat tab tersembunyi. */
  wallMs: number;
  scrollEvents: number;
  /** Berapa kali pembaca menggulir kembali ke atas. */
  backtracks: number;
  /** Jawaban atas pertanyaan jangkar benar atau tidak. */
  anchorOk: boolean;
  wordCount: number;
}

export interface Assessment {
  verdict: Verdict;
  /** 0–100. Turun berarti sinyal makin mirip otomatisasi. */
  confidence: number;
  /** Ditampilkan ke pembaca. Nadanya sengaja lembut, bukan menuduh. */
  message: string;
}

export function assess(signals: AttentionSignals, countedTodayAlready: number): Assessment {
  const { activeMs, wordCount, anchorOk, scrollEvents, backtracks } = signals;

  if (countedTodayAlready >= DAILY_CAP) {
    return {
      verdict: "rate_limited",
      confidence: 100,
      message: `Sudah ${DAILY_CAP} bacaan tercatat hari ini. Sisanya tetap bisa dibaca, hanya tidak dicatat lagi sampai besok.`,
    };
  }

  if (activeMs < MIN_ACTIVE_MS) {
    return {
      verdict: "too_fast",
      confidence: 95,
      message: "Terlalu singkat untuk dicatat. Perikopnya masih di sini kalau mau dibaca lagi.",
    };
  }

  const minutes = activeMs / 60_000;
  const wpm = wordCount / Math.max(minutes, 0.0001);

  if (wpm > MAX_WPM) {
    return {
      verdict: "too_fast",
      confidence: 90,
      message: "Bacaan ini lewat lebih cepat daripada yang bisa dibaca. Tidak dicatat kali ini.",
    };
  }

  if (wpm < MIN_WPM) {
    return {
      verdict: "too_slow",
      confidence: 60,
      message: "Halaman ini terbuka lama tanpa banyak aktivitas. Tidak dicatat, tetapi tidak masalah.",
    };
  }

  if (!anchorOk) {
    return {
      verdict: "anchor_failed",
      confidence: 70,
      message: "Jawabannya belum tepat. Bacaannya tetap sah — hanya beruntun yang tidak bertambah.",
    };
  }

  // Sesi panjang tanpa satu pun gulir atau tanpa pernah kembali ke atas adalah
  // pola yang jarang muncul pada manusia. Tidak ditolak, hanya diturunkan
  // keyakinannya — menolak berdasarkan sinyal lemah akan mengusir orang sungguhan.
  let confidence = 100;
  if (scrollEvents === 0 && wordCount > 120) confidence -= 30;
  if (backtracks === 0 && activeMs > 240_000) confidence -= 15;

  return {
    verdict: "counted",
    confidence,
    message: "Tercatat.",
  };
}

/** Hari kalender lokal pembaca. Harus cocok persis dengan `local_day` di program. */
export function localDay(unixSeconds: number, tzOffsetMinutes: number): number {
  const shifted = unixSeconds + tzOffsetMinutes * 60;
  return Math.floor(shifted / 86_400);
}

/**
 * Menyusun pertanyaan jangkar dari teks yang barusan tampil.
 *
 * Ini bukan kuis pemahaman. Tujuannya hanya memastikan teksnya benar-benar ada
 * di layar, bukan menguji siapa pun. Kata yang dipilih adalah kata panjang yang
 * muncul persis sekali, sehingga jawabannya tidak ambigu.
 */
export function buildAnchor(
  verses: { n: number; text: string }[]
): { word: string; answer: number; options: number[] } | null {
  if (verses.length < 3) return null;

  const seen = new Map<string, number[]>();
  for (const verse of verses) {
    for (const raw of verse.text.toLowerCase().split(/[^\p{L}]+/u)) {
      if (raw.length < 6) continue;
      const list = seen.get(raw) ?? [];
      if (!list.includes(verse.n)) list.push(verse.n);
      seen.set(raw, list);
    }
  }

  const unique = [...seen.entries()].filter(([, vs]) => vs.length === 1);
  if (unique.length === 0) return null;

  const [word, [answer]] = unique[Math.floor(Math.random() * unique.length)];

  const others = verses
    .map((v) => v.n)
    .filter((n) => n !== answer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  return {
    word,
    answer,
    options: [answer, ...others].sort(() => Math.random() - 0.5),
  };
}
