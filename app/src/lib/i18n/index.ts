/**
 * Satu berkas per bahasa, satu bentuk untuk semuanya.
 *
 * Kamus Indonesia adalah acuan: tipe `Copy` diturunkan dari bentuknya, dan
 * setiap kamus lain menuliskan `: Copy` pada objeknya. Satu kunci yang lupa
 * diterjemahkan karena itu menjadi galat kompilasi, bukan ruang kosong yang
 * baru ketahuan setelah tayang. Tidak ada pustaka i18n di sini: menambah
 * dependensi untuk sesuatu yang muat dalam satu direktori hanya menambah hal
 * yang bisa rusak.
 *
 * Bahasa dipilih lewat kuki, bukan lewat awalan URL, supaya setiap tautan yang
 * pernah dibagikan tetap menunjuk ke halaman yang sama apa pun bahasanya.
 */

import { id } from "./id";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { zh } from "./zh";
import { ar } from "./ar";
import type { TraditionId } from "@/lib/corpus";
import type { Copy } from "./types";

export type { Copy } from "./types";

/**
 * Keterangan satu bahasa.
 *
 * `label` sengaja ditulis dalam bahasa itu sendiri, bukan diterjemahkan ke
 * bahasa yang sedang aktif, supaya pembaca yang tersesat di antarmuka yang
 * tidak ia mengerti tetap bisa menemukan bahasanya sendiri di dalam daftar.
 */
export type LocaleInfo = {
  /** Kode BCP 47, dipakai untuk atribut `lang` dan pemformatan angka. */
  readonly tag: string;
  /** Nama bahasa dalam bahasa itu sendiri. */
  readonly label: string;
  /** Arah tulisan. Menentukan atribut `dir` pada elemen `html`. */
  readonly dir: "ltr" | "rtl";
};

/**
 * Daftar bahasa yang tersedia.
 *
 * Menambah bahasa berarti menambah satu berkas kamus lalu satu baris di sini;
 * tidak ada tempat ketiga yang harus diingat.
 */
export const LOCALE_INFO = {
  id: { tag: "id-ID", label: "Bahasa Indonesia", dir: "ltr" },
  en: { tag: "en-US", label: "English", dir: "ltr" },
  es: { tag: "es-ES", label: "Español", dir: "ltr" },
  fr: { tag: "fr-FR", label: "Français", dir: "ltr" },
  zh: { tag: "zh-CN", label: "简体中文", dir: "ltr" },
  ar: { tag: "ar", label: "العربية", dir: "rtl" },
} as const satisfies Record<string, LocaleInfo>;

export type Locale = keyof typeof LOCALE_INFO;

export const LOCALES = Object.keys(LOCALE_INFO) as Locale[];

export const DEFAULT_LOCALE: Locale = "id";

/** Nama kuki penyimpan pilihan bahasa. Dibaca di server, ditulis lewat /api/locale. */
export const LOCALE_COOKIE = "stele_lang";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in LOCALE_INFO;
}

/** Arah tulisan bahasa ini. Bahasa Arab ditulis dari kanan ke kiri. */
export function direction(locale: Locale): "ltr" | "rtl" {
  return LOCALE_INFO[locale].dir;
}

const DICTS: Record<Locale, Copy> = { id, en, es, fr, zh, ar };

/** Ambil seluruh salinan teks untuk satu bahasa. */
export function copy(locale: Locale): Copy {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}

/**
 * Nama dan keterangan tradisi dalam bahasa pembaca.
 *
 * Teksnya tinggal di kamus, bukan di `TRADITIONS`, supaya lapisan korpus tetap
 * mengurus asal teks dan lisensinya saja tanpa ikut memikirkan bahasa
 * antarmuka.
 *
 * Kuncinya disusun dari `TraditionId`, bukan dipilih lewat `switch`. Bentuk
 * yang lama menuntut satu cabang baru untuk tiap tradisi baru, dan cabang yang
 * terlupa akan mengembalikan `undefined` — tradisi yang tampil sebagai kartu
 * kosong, bukan sebagai galat kompilasi. Sekarang kamus mana pun yang belum
 * memuat pasangan `nama`/`namaBlurb` gagal sebelum tayang.
 */
export function traditionCopy(
  c: Copy,
  tradition: TraditionId
): { name: string; blurb: string } {
  return {
    name: c.traditions[tradition],
    blurb: c.traditions[`${tradition}Blurb`],
  };
}

/**
 * Kalimat lisensi satu arsip dalam bahasa pembaca.
 *
 * Nama arsip dan alamatnya tetap tinggal di lapisan korpus — keduanya nama
 * diri, dan menerjemahkannya justru memutus kredit yang disyaratkan lisensi.
 * Kalimat lisensinya bukan nama diri, jadi ia pindah ke kamus. Selama ia masih
 * ikut duduk di korpus, halaman berbahasa apa pun menutup dirinya dengan satu
 * baris Indonesia.
 */
export function licenseCopy(c: Copy, tradition: TraditionId): string {
  return c.licenses[tradition];
}

/** Pemisah ribuan mengikuti bahasa pembaca, bukan mengikuti mesin. */
export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(LOCALE_INFO[locale].tag);
}
