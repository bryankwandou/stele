/**
 * Daftar adhyaya Bhagawadgita, beserta penerjemah yang tersedia di arsipnya.
 *
 * Dua-duanya ditulis di sini alih-alih diambil saat menyusun menu. Arsipnya
 * memang menyediakan endpoint `/chapters`, tetapi menu tradisi harus tetap
 * tampil ketika arsipnya sedang tidak bisa dihubungi — yang gagal cukup
 * pembacaannya, bukan halaman pemilihannya. Angka syair di bawah diambil dari
 * endpoint itu pada 19 Agustus 2026 dan diperiksa ulang oleh
 * `scripts/periksa-gita.mjs`.
 */

export interface Adhyaya {
  /** Nomor bab, 1–18. Sekaligus dipakai sebagai `bookId`. */
  n: number;
  /**
   * Jumlah syair, tidak termasuk kolofon.
   *
   * Arsipnya menyimpan satu entri bernomor lagi sesudah syair terakhir tiap
   * adhyaya: rumusan penutup "ॐ तत्सदिति…" yang menamai babnya. Entri itu punya
   * nomor, tetapi bukan syair, dan tidak ikut dibaca. Angka di sini karena itu
   * satu lebih kecil daripada entri terakhir yang dilayani arsipnya — bukan
   * kekeliruan hitung.
   */
  verses: number;
  /** Nama bab dalam alih aksara Latin. */
  name: string;
}

export const GITA: Adhyaya[] = [
  { n: 1, verses: 47, name: "Arjun Viṣhād Yog" },
  { n: 2, verses: 72, name: "Sānkhya Yog" },
  { n: 3, verses: 43, name: "Karm Yog" },
  { n: 4, verses: 42, name: "Jñāna Karm Sanyās Yog" },
  { n: 5, verses: 29, name: "Karm Sanyās Yog" },
  { n: 6, verses: 47, name: "Dhyān Yog" },
  { n: 7, verses: 30, name: "Jñāna Vijñāna Yog" },
  { n: 8, verses: 28, name: "Akṣhar Brahma Yog" },
  { n: 9, verses: 34, name: "Rāja Vidyā Yog" },
  { n: 10, verses: 42, name: "Vibhūti Yog" },
  { n: 11, verses: 55, name: "Viśhwarūp Darśhan Yog" },
  { n: 12, verses: 20, name: "Bhakti Yog" },
  { n: 13, verses: 35, name: "Kṣhetra Kṣhetrajña Vibhāg Yog" },
  { n: 14, verses: 27, name: "Guṇa Traya Vibhāg Yog" },
  { n: 15, verses: 20, name: "Puruṣhottam Yog" },
  { n: 16, verses: 24, name: "Daivāsura Sampad Vibhāg Yog" },
  { n: 17, verses: 28, name: "Śhraddhā Traya Vibhāg Yog" },
  { n: 18, verses: 78, name: "Mokṣha Sanyās Yog" },
];

export interface GitaVersion {
  /** Kunci pada balasan arsip, atau `slok`/`transliteration` untuk teks akar. */
  id: string;
  name: string;
  language: string;
  /**
   * Ruas yang memuat terjemahannya. Arsipnya memisahkan `et` (terjemahan
   * Inggris) dari `ec` (uraian Inggris) dan `ht`/`hc` untuk pasangan Hindinya.
   * Yang diambil selalu ruas terjemahan; uraian panjang bukan teks yang sedang
   * dibaca orang di sini.
   */
  field: "slok" | "transliteration" | "et" | "ht";
}

/**
 * Hanya penerjemah yang benar-benar punya ruas terjemahan yang didaftarkan.
 * Sebagian penyunting di arsip itu hanya menyertakan uraian Sanskerta (`sc`);
 * menawarkannya sebagai pilihan berarti menjanjikan bacaan yang tidak ada.
 */
export const GITA_VERSIONS: GitaVersion[] = [
  { id: "slok", name: "संस्कृत — teks akar", language: "Sanskrit", field: "slok" },
  {
    id: "transliteration",
    name: "IAST — alih aksara",
    language: "Sanskrit",
    field: "transliteration",
  },
  { id: "purohit", name: "English — Shri Purohit Swami", language: "English", field: "et" },
  { id: "siva", name: "English — Swami Sivananda", language: "English", field: "et" },
  { id: "gambir", name: "English — Swami Gambirananda", language: "English", field: "et" },
  { id: "adi", name: "English — Swami Adidevananda", language: "English", field: "et" },
  { id: "san", name: "English — Dr. S. Sankaranarayan", language: "English", field: "et" },
  { id: "raman", name: "English — Sri Ramanuja", language: "English", field: "et" },
  { id: "abhinav", name: "English — Sri Abhinav Gupta", language: "English", field: "et" },
  { id: "prabhu", name: "English — A.C. Bhaktivedanta Swami", language: "English", field: "et" },
  { id: "tej", name: "हिन्दी — Swami Tejomayananda", language: "Hindi", field: "ht" },
  { id: "rams", name: "हिन्दी — Swami Ramsukhdas", language: "Hindi", field: "ht" },
  { id: "sankar", name: "हिन्दी — Sri Shankaracharya", language: "Hindi", field: "ht" },
];
