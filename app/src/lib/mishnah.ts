/**
 * Daftar traktat Mishnah beserta jumlah babnya.
 *
 * Ditulis sebagai tetapan, bukan diambil dari jaringan, karena menyusun daftar
 * ini lewat API berarti 63 permintaan indeks hanya untuk menggambar satu menu.
 * Isinya kanon yang tidak berubah, jadi biaya ketinggalan zamannya nol; yang
 * tetap diambil saat dibuka hanyalah teksnya sendiri.
 *
 * Setiap angka di sini sudah dicocokkan dengan `schema.lengths` pada indeks
 * Sefaria lewat `scripts/periksa-mishnah.mjs`. Nomor bab yang meleset akan
 * memunculkan perikop kosong, dan itu terlihat sebagai kesalahan kita, bukan
 * kesalahan arsipnya.
 */

export interface Tractate {
  /** Nama rujukan Sefaria, dipakai apa adanya di URL. */
  id: string;
  /** Nama yang ditampilkan. */
  name: string;
  /** Seder — bagian besar tempat traktat ini berada. */
  seder: string;
  chapters: number;
}

export const MISHNAH: Tractate[] = [
  // Zeraim — benih.
  { id: "Mishnah Berakhot", name: "Berakhot", seder: "Zeraim", chapters: 9 },
  { id: "Mishnah Peah", name: "Peah", seder: "Zeraim", chapters: 8 },
  { id: "Mishnah Demai", name: "Demai", seder: "Zeraim", chapters: 7 },
  { id: "Mishnah Kilayim", name: "Kilayim", seder: "Zeraim", chapters: 9 },
  { id: "Mishnah Sheviit", name: "Sheviit", seder: "Zeraim", chapters: 10 },
  { id: "Mishnah Terumot", name: "Terumot", seder: "Zeraim", chapters: 11 },
  { id: "Mishnah Maasrot", name: "Maasrot", seder: "Zeraim", chapters: 5 },
  { id: "Mishnah Maaser Sheni", name: "Maaser Sheni", seder: "Zeraim", chapters: 5 },
  { id: "Mishnah Challah", name: "Challah", seder: "Zeraim", chapters: 4 },
  { id: "Mishnah Orlah", name: "Orlah", seder: "Zeraim", chapters: 3 },
  { id: "Mishnah Bikkurim", name: "Bikkurim", seder: "Zeraim", chapters: 4 },

  // Moed — waktu yang ditetapkan.
  { id: "Mishnah Shabbat", name: "Shabbat", seder: "Moed", chapters: 24 },
  { id: "Mishnah Eruvin", name: "Eruvin", seder: "Moed", chapters: 10 },
  { id: "Mishnah Pesachim", name: "Pesachim", seder: "Moed", chapters: 10 },
  { id: "Mishnah Shekalim", name: "Shekalim", seder: "Moed", chapters: 8 },
  { id: "Mishnah Yoma", name: "Yoma", seder: "Moed", chapters: 8 },
  { id: "Mishnah Sukkah", name: "Sukkah", seder: "Moed", chapters: 5 },
  { id: "Mishnah Beitzah", name: "Beitzah", seder: "Moed", chapters: 5 },
  { id: "Mishnah Rosh Hashanah", name: "Rosh Hashanah", seder: "Moed", chapters: 4 },
  { id: "Mishnah Taanit", name: "Taanit", seder: "Moed", chapters: 4 },
  { id: "Mishnah Megillah", name: "Megillah", seder: "Moed", chapters: 4 },
  { id: "Mishnah Moed Katan", name: "Moed Katan", seder: "Moed", chapters: 3 },
  { id: "Mishnah Chagigah", name: "Chagigah", seder: "Moed", chapters: 3 },

  // Nashim — perempuan.
  { id: "Mishnah Yevamot", name: "Yevamot", seder: "Nashim", chapters: 16 },
  { id: "Mishnah Ketubot", name: "Ketubot", seder: "Nashim", chapters: 13 },
  { id: "Mishnah Nedarim", name: "Nedarim", seder: "Nashim", chapters: 11 },
  { id: "Mishnah Nazir", name: "Nazir", seder: "Nashim", chapters: 9 },
  { id: "Mishnah Sotah", name: "Sotah", seder: "Nashim", chapters: 9 },
  { id: "Mishnah Gittin", name: "Gittin", seder: "Nashim", chapters: 9 },
  { id: "Mishnah Kiddushin", name: "Kiddushin", seder: "Nashim", chapters: 4 },

  // Nezikin — kerugian.
  { id: "Mishnah Bava Kamma", name: "Bava Kamma", seder: "Nezikin", chapters: 10 },
  { id: "Mishnah Bava Metzia", name: "Bava Metzia", seder: "Nezikin", chapters: 10 },
  { id: "Mishnah Bava Batra", name: "Bava Batra", seder: "Nezikin", chapters: 10 },
  { id: "Mishnah Sanhedrin", name: "Sanhedrin", seder: "Nezikin", chapters: 11 },
  { id: "Mishnah Makkot", name: "Makkot", seder: "Nezikin", chapters: 3 },
  { id: "Mishnah Shevuot", name: "Shevuot", seder: "Nezikin", chapters: 8 },
  { id: "Mishnah Eduyot", name: "Eduyot", seder: "Nezikin", chapters: 8 },
  { id: "Mishnah Avodah Zarah", name: "Avodah Zarah", seder: "Nezikin", chapters: 5 },
  { id: "Pirkei Avot", name: "Avot", seder: "Nezikin", chapters: 6 },
  { id: "Mishnah Horayot", name: "Horayot", seder: "Nezikin", chapters: 3 },

  // Kodashim — hal-hal kudus.
  { id: "Mishnah Zevachim", name: "Zevachim", seder: "Kodashim", chapters: 14 },
  { id: "Mishnah Menachot", name: "Menachot", seder: "Kodashim", chapters: 13 },
  { id: "Mishnah Chullin", name: "Chullin", seder: "Kodashim", chapters: 12 },
  { id: "Mishnah Bekhorot", name: "Bekhorot", seder: "Kodashim", chapters: 9 },
  { id: "Mishnah Arakhin", name: "Arakhin", seder: "Kodashim", chapters: 9 },
  { id: "Mishnah Temurah", name: "Temurah", seder: "Kodashim", chapters: 7 },
  { id: "Mishnah Keritot", name: "Keritot", seder: "Kodashim", chapters: 6 },
  { id: "Mishnah Meilah", name: "Meilah", seder: "Kodashim", chapters: 6 },
  { id: "Mishnah Tamid", name: "Tamid", seder: "Kodashim", chapters: 7 },
  { id: "Mishnah Middot", name: "Middot", seder: "Kodashim", chapters: 5 },
  { id: "Mishnah Kinnim", name: "Kinnim", seder: "Kodashim", chapters: 3 },

  // Tahorot — kemurnian.
  { id: "Mishnah Kelim", name: "Kelim", seder: "Tahorot", chapters: 30 },
  { id: "Mishnah Oholot", name: "Oholot", seder: "Tahorot", chapters: 18 },
  { id: "Mishnah Negaim", name: "Negaim", seder: "Tahorot", chapters: 14 },
  { id: "Mishnah Parah", name: "Parah", seder: "Tahorot", chapters: 12 },
  { id: "Mishnah Tahorot", name: "Tahorot", seder: "Tahorot", chapters: 10 },
  { id: "Mishnah Mikvaot", name: "Mikvaot", seder: "Tahorot", chapters: 10 },
  { id: "Mishnah Niddah", name: "Niddah", seder: "Tahorot", chapters: 10 },
  { id: "Mishnah Makhshirin", name: "Makhshirin", seder: "Tahorot", chapters: 6 },
  { id: "Mishnah Zavim", name: "Zavim", seder: "Tahorot", chapters: 5 },
  { id: "Mishnah Tevul Yom", name: "Tevul Yom", seder: "Tahorot", chapters: 4 },
  { id: "Mishnah Yadayim", name: "Yadayim", seder: "Tahorot", chapters: 4 },
  { id: "Mishnah Oktzin", name: "Oktzin", seder: "Tahorot", chapters: 3 },
];
