import type { id } from "./id";

/**
 * Melebarkan tiap teks dari tipe literalnya menjadi `string`.
 *
 * Tanpa ini, `as const` pada kamus acuan membuat setiap kalimat Indonesia
 * menjadi tipe tersendiri, sehingga kalimat bahasa lain apa pun dianggap salah.
 * Yang ingin dijaga adalah susunan kuncinya, bukan bunyi kalimatnya.
 */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/**
 * Bentuk seluruh teks antarmuka.
 *
 * Setiap berkas bahasa menuliskan `: Copy` pada objeknya, dan anotasi itulah
 * yang membuat satu kunci yang terlewat gagal saat kompilasi alih-alih tampil
 * sebagai ruang kosong setelah tayang.
 */
export type Copy = Widen<typeof id>;
