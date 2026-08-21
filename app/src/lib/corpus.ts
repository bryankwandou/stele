/**
 * Lapisan korpus.
 *
 * Teks suci tidak pernah disimpan di database kita. Setiap perikop diambil saat
 * diminta dari CDN sumbernya, lalu di-cache di edge Next.js. Itu sebabnya
 * database 256MB lebih dari cukup: yang kita simpan hanya catatan pembacaan.
 *
 * Setiap sumber punya kewajiban atribusinya sendiri. Kewajiban itu ikut
 * dikembalikan bersama teks, bukan disimpan terpisah, supaya mustahil
 * menampilkan perikop tanpa kreditnya.
 */

import { GITA, GITA_VERSIONS } from "./gita";
import { MISHNAH } from "./mishnah";

export type TraditionId =
  | "christian"
  | "islam"
  | "buddhist"
  | "jewish"
  | "hindu"
  | "sikh";

export interface Attribution {
  /** Nama yang ditampilkan di kaki halaman pembaca. */
  label: string;
  /** Tautan balik. Sebagian lisensi mensyaratkan ini, bukan opsional. */
  href: string;
}

export interface Verse {
  n: number;
  text: string;
}

export interface Passage {
  traditionId: TraditionId;
  translationId: string;
  translationName: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verses: Verse[];
  wordCount: number;
  /** "rtl" memicu tata letak kanan-ke-kiri untuk Arab dan Ibrani. */
  direction: "ltr" | "rtl";
  attribution: Attribution;
}

export interface TranslationSummary {
  id: string;
  name: string;
  language: string;
  direction: "ltr" | "rtl";
  /**
   * Benar bila sumbernya memberi penomoran ayat yang baku. Terjemahan lama di
   * SuttaCentral hanya tersedia sebagai satu blok HTML per vagga, sehingga
   * nomor yang kita tampilkan untuknya adalah urutan baris, bukan nomor syair
   * Dhammapada. Pembaca berhak tahu bedanya.
   */
  canonicalNumbering?: boolean;
}

export interface BookSummary {
  id: string;
  name: string;
  chapters: number;
}

export interface Tradition {
  id: TraditionId;
  /** Nama tradisi dalam bahasa Indonesia. */
  name: string;
  /** Satu kalimat, ditulis netral. Aplikasi ini tidak menilai iman siapa pun. */
  blurb: string;
  attribution: Attribution;
}

export const TRADITIONS: Tradition[] = [
  {
    id: "christian",
    name: "Alkitab",
    blurb: "Perjanjian Lama dan Perjanjian Baru, dari terjemahan domain publik.",
    attribution: {
      label: "Free Use Bible API — AO Lab",
      href: "https://bible.helloao.org",
    },
  },
  {
    id: "islam",
    name: "Al-Qur'an",
    blurb: "Teks Arab beserta ratusan terjemahan dalam puluhan bahasa.",
    attribution: {
      label: "Tanzil.net · quran-api",
      href: "https://tanzil.net",
    },
  },
  {
    id: "buddhist",
    name: "Dhammapada",
    blurb: "423 syair dalam 26 vagga, beserta teks akar Pali, dari arsip SuttaCentral.",
    attribution: {
      label: "SuttaCentral",
      href: "https://suttacentral.net",
    },
  },
  {
    id: "jewish",
    name: "Mishnah",
    blurb: "63 traktat dalam enam seder, beserta teks Ibraninya, dari arsip Sefaria.",
    attribution: {
      label: "Sefaria",
      href: "https://www.sefaria.org",
    },
  },
  {
    id: "hindu",
    name: "Bhagawadgita",
    blurb:
      "701 syair dalam 18 adhyaya, beserta teks Sanskertanya, dari arsip Vedic Scriptures.",
    attribution: {
      label: "Vedic Scriptures",
      href: "https://vedicscriptures.github.io",
    },
  },
  {
    id: "sikh",
    name: "Guru Granth Sahib",
    blurb:
      "1.430 ang dalam aksara Gurmukhi, beserta terjemahannya, dari arsip GurbaniNow.",
    attribution: {
      label: "GurbaniNow",
      href: "https://gurbaninow.com",
    },
  },
];

/**
 * Kredit satu tradisi, dicari berdasarkan namanya.
 *
 * Sebelumnya perikop mengambilnya lewat indeks larik. Indeks itu benar tepat
 * sampai ada tradisi baru disisipkan di tengah, dan bentuk kegagalannya adalah
 * teks yang tampil membawa kredit sumber lain — pelanggaran lisensi yang tidak
 * memicu satu pun galat.
 */
function atribusi(id: TraditionId): Attribution {
  const t = TRADITIONS.find((x) => x.id === id);
  if (!t) throw new Error(`Tradisi tidak dikenal: ${id}`);
  return t.attribution;
}

/** Cache satu jam di edge; teks suci tidak berubah, tetapi daftar bisa bertambah. */
const FETCH_OPTS: RequestInit = { next: { revalidate: 3600 } } as RequestInit;

/**
 * Pengambilan yang tahan gangguan sesaat.
 *
 * Semua arsip di bawah ini milik orang lain, dan tidak satu pun menjanjikan
 * ketersediaan. Sekali kedip di jaringan seharusnya tidak membatalkan bacaan
 * seseorang, jadi percobaan diulang dua kali dengan jeda yang menanjak. Yang
 * sengaja tidak diulang adalah 404: perikop yang memang tidak ada tidak akan
 * menjadi ada karena ditanya tiga kali.
 *
 * Batas waktu delapan detik ada supaya sumber yang menggantung gagal cepat,
 * bukan menahan render sampai batas fungsi Vercel.
 */
async function ambil(url: string, percobaan = 3): Promise<Response> {
  let terakhir: unknown;

  for (let i = 0; i < percobaan; i += 1) {
    try {
      const res = await fetch(url, {
        ...FETCH_OPTS,
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500) return res;
      terakhir = new Error(`Sumber menjawab ${res.status}.`);
    } catch (e) {
      terakhir = e;
    }
    if (i < percobaan - 1) {
      await new Promise((r) => setTimeout(r, 250 * 2 ** i));
    }
  }

  throw terakhir instanceof Error
    ? terakhir
    : new Error("Sumber korpus tidak bisa dihubungi.");
}

function countWords(verses: Verse[]): number {
  return verses.reduce(
    (total, v) => total + v.text.trim().split(/\s+/).filter(Boolean).length,
    0
  );
}

function stripMarkup(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(stripMarkup).join("");
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("text" in obj) return stripMarkup(obj.text);
    if ("content" in obj) return stripMarkup(obj.content);
  }
  return "";
}

// ---------------------------------------------------------------------------
// Kristen — bible.helloao.org
// ---------------------------------------------------------------------------

const HELLOAO = "https://bible.helloao.org/api";

async function christianTranslations(): Promise<TranslationSummary[]> {
  const res = await ambil(`${HELLOAO}/available_translations.json`);
  if (!res.ok) throw new Error(`Daftar terjemahan Alkitab gagal dimuat (${res.status}).`);
  const data = await res.json();
  return (data.translations as Record<string, unknown>[]).map((t) => ({
    id: String(t.id),
    name: String(t.englishName ?? t.name),
    language: String(t.languageEnglishName ?? t.language),
    direction: t.textDirection === "rtl" ? "rtl" : "ltr",
  }));
}

async function christianBooks(translationId: string): Promise<BookSummary[]> {
  const res = await ambil(`${HELLOAO}/${translationId}/books.json`);
  if (!res.ok) throw new Error(`Daftar kitab gagal dimuat (${res.status}).`);
  const data = await res.json();
  return (data.books as Record<string, unknown>[]).map((b) => ({
    id: String(b.id),
    name: String(b.commonName ?? b.name),
    chapters: Number(b.numberOfChapters ?? 1),
  }));
}

async function christianPassage(
  translationId: string,
  bookId: string,
  chapter: number
): Promise<Passage> {
  const res = await ambil(`${HELLOAO}/${translationId}/${bookId}/${chapter}.json`);
  if (!res.ok) throw new Error(`Perikop tidak ditemukan (${res.status}).`);
  const data = await res.json();

  const verses: Verse[] = [];
  for (const item of data.chapter?.content ?? []) {
    if (item?.type !== "verse") continue;
    const text = stripMarkup(item.content).replace(/\s+/g, " ").trim();
    if (text) verses.push({ n: Number(item.number), text });
  }

  const tradition = TRADITIONS[0];
  return {
    traditionId: "christian",
    translationId,
    translationName: String(data.translation?.englishName ?? translationId),
    bookId,
    bookName: String(data.book?.commonName ?? bookId),
    chapter,
    verses,
    wordCount: countWords(verses),
    direction: data.translation?.textDirection === "rtl" ? "rtl" : "ltr",
    attribution: tradition.attribution,
  };
}

// ---------------------------------------------------------------------------
// Islam — quran-api lewat jsDelivr, bersumber dari Tanzil
// ---------------------------------------------------------------------------

const QURAN = "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1";

/** 114 surah beserta jumlah ayat — statis, jadi tidak perlu diambil dari jaringan. */
const SURAH_VERSES = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110,
  98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88,
  75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24,
  13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3,
  9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

const SURAH_NAMES = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am",
  "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim",
  "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj",
  "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas",
  "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin",
  "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf",
  "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah",
  "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah",
  "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam",
  "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir",
  "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq",
  "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha",
  "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah",
  "Al-'Adiyat", "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil",
  "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr", "Al-Masad",
  "Al-Ikhlas", "Al-Falaq", "An-Nas",
];

async function islamTranslations(): Promise<TranslationSummary[]> {
  const res = await ambil(`${QURAN}/editions.json`);
  if (!res.ok) throw new Error(`Daftar terjemahan Qur'an gagal dimuat (${res.status}).`);
  const data = (await res.json()) as Record<string, Record<string, unknown>>;

  return Object.values(data).map((e) => ({
    id: String(e.name),
    name: String(e.author || e.name),
    language: String(e.language),
    direction: e.direction === "rtl" ? "rtl" : "ltr",
  }));
}

async function islamBooks(): Promise<BookSummary[]> {
  return SURAH_NAMES.map((name, i) => ({
    id: String(i + 1),
    name: `${i + 1}. ${name}`,
    chapters: 1,
  }));
}

async function islamPassage(translationId: string, surah: number): Promise<Passage> {
  const res = await ambil(`${QURAN}/editions/${translationId}/${surah}.json`);
  if (!res.ok) throw new Error(`Surah tidak ditemukan (${res.status}).`);
  const data = await res.json();

  const verses: Verse[] = (data.chapter as Record<string, unknown>[]).map((v) => ({
    n: Number(v.verse),
    text: String(v.text).replace(/\s+/g, " ").trim(),
  }));

  const isArabic = translationId.startsWith("ara");
  return {
    traditionId: "islam",
    translationId,
    translationName: translationId,
    bookId: String(surah),
    bookName: SURAH_NAMES[surah - 1] ?? `Surah ${surah}`,
    chapter: surah,
    verses,
    wordCount: countWords(verses),
    direction: isArabic ? "rtl" : "ltr",
    attribution: TRADITIONS[1].attribution,
  };
}

// ---------------------------------------------------------------------------
// Buddha — SuttaCentral
// ---------------------------------------------------------------------------

const SUTTACENTRAL = "https://suttacentral.net/api";

/** Dhammapada terbagi 26 vagga. Rentang syair setiap vagga bersifat tetap. */
const DHAMMAPADA_VAGGA: { uid: string; name: string }[] = [
  { uid: "dhp1-20", name: "Yamakavagga — Pasangan" },
  { uid: "dhp21-32", name: "Appamadavagga — Kewaspadaan" },
  { uid: "dhp33-43", name: "Cittavagga — Pikiran" },
  { uid: "dhp44-59", name: "Pupphavagga — Bunga" },
  { uid: "dhp60-75", name: "Balavagga — Orang Dungu" },
  { uid: "dhp76-89", name: "Panditavagga — Orang Bijaksana" },
  { uid: "dhp90-99", name: "Arahantavagga — Arahat" },
  { uid: "dhp100-115", name: "Sahassavagga — Ribuan" },
  { uid: "dhp116-128", name: "Papavagga — Kejahatan" },
  { uid: "dhp129-145", name: "Dandavagga — Hukuman" },
  { uid: "dhp146-156", name: "Jaravagga — Usia Tua" },
  { uid: "dhp157-166", name: "Attavagga — Diri Sendiri" },
  { uid: "dhp167-178", name: "Lokavagga — Dunia" },
  { uid: "dhp179-196", name: "Buddhavagga — Buddha" },
  { uid: "dhp197-208", name: "Sukhavagga — Kebahagiaan" },
  { uid: "dhp209-220", name: "Piyavagga — Kesenangan" },
  { uid: "dhp221-234", name: "Kodhavagga — Kemarahan" },
  { uid: "dhp235-255", name: "Malavagga — Noda" },
  { uid: "dhp256-272", name: "Dhammatthavagga — Yang Adil" },
  { uid: "dhp273-289", name: "Maggavagga — Jalan" },
  { uid: "dhp290-305", name: "Pakinnakavagga — Aneka" },
  { uid: "dhp306-319", name: "Nirayavagga — Neraka" },
  { uid: "dhp320-333", name: "Nagavagga — Gajah" },
  { uid: "dhp334-359", name: "Tanhavagga — Nafsu Keinginan" },
  { uid: "dhp360-382", name: "Bhikkhuvagga — Bhikkhu" },
  { uid: "dhp383-423", name: "Brahmanavagga — Brahmana" },
];

/** Bahasa yang ditulis kanan-ke-kiri di antara terjemahan SuttaCentral. */
const RTL_LANGS = new Set(["he", "ar", "fa", "ur"]);

/**
 * Daftar terjemahan diambil dari SuttaCentral, bukan ditulis tangan.
 *
 * Sebelumnya hanya dua terjemahan Inggris yang tercantum di sini, padahal
 * arsipnya menyediakan puluhan dalam banyak bahasa. Menuliskannya manual berarti
 * daftar itu akan basi setiap kali ada terjemahan baru masuk, jadi sekarang
 * diambil dari suttaplex vagga pertama — daftar penerjemah Dhammapada sama untuk
 * seluruh vagga.
 */
async function buddhistTranslations(): Promise<TranslationSummary[]> {
  const res = await ambil(`${SUTTACENTRAL}/suttas/${DHAMMAPADA_VAGGA[0].uid}`);
  if (!res.ok) throw new Error(`Daftar terjemahan Dhammapada gagal dimuat (${res.status}).`);
  const data = await res.json();

  const rows = (data.suttaplex?.translations ?? []) as Record<string, unknown>[];
  const seen = new Set<string>();
  const out: TranslationSummary[] = [];

  for (const row of rows) {
    const author = String(row.author_uid ?? "");
    const lang = String(row.lang ?? "");
    if (!author || !lang) continue;

    const id = `${author}/${lang}`;
    if (seen.has(id)) continue;
    seen.add(id);

    // Teks akar Pali disajikan sebagai "terjemahan" oleh suttaplex, tetapi
    // sebetulnya ia sumbernya. Diberi label supaya pembaca tidak salah kira.
    const isRoot = lang === "pli";
    out.push({
      id,
      name: isRoot ? "Pāli (teks akar)" : String(row.author ?? author),
      language: String(row.lang_name ?? lang),
      direction: RTL_LANGS.has(lang) ? "rtl" : "ltr",
      canonicalNumbering: row.segmented === true,
    });
  }

  // Yang penomorannya baku ditaruh lebih dulu; sisanya tetap bisa dipilih.
  out.sort((a, b) => Number(b.canonicalNumbering) - Number(a.canonicalNumbering));

  if (out.length === 0) throw new Error("SuttaCentral tidak mengembalikan terjemahan.");
  return out;
}

async function buddhistBooks(): Promise<BookSummary[]> {
  return DHAMMAPADA_VAGGA.map((v, i) => ({
    id: String(i + 1),
    name: `${i + 1}. ${v.name}`,
    chapters: 1,
  }));
}

/**
 * Bentuk bersegmen. Kunci berupa `dhp{syair}:{baris}`; baris-baris satu syair
 * disatukan supaya yang tampil adalah syair utuh, bukan potongan baris.
 * Segmen `:0.x` adalah judul dan penomoran koleksi, bukan bagian syair.
 */
async function segmentedSutta(
  uid: string,
  author: string,
  lang: string
): Promise<Verse[] | null> {
  const res = await ambil(
    `${SUTTACENTRAL}/bilarasuttas/${uid}/${author}?lang=${lang}`
  );
  if (!res.ok) return null;

  const data = await res.json();

  // root_text hanya boleh dipakai bila yang diminta memang teks akar Pali.
  // Endpoint ini tetap mengembalikan root_text untuk penerjemah yang karyanya
  // belum bersegmen, jadi memakainya sebagai cadangan umum akan menyajikan Pali
  // kepada orang yang memilih bahasa Tamil atau Ibrani — salah tanpa terlihat
  // salah. Untuk kasus itu kembalikan null saja supaya jatuh ke bentuk lama.
  const text = (lang === "pli" ? data.root_text : data.translation_text) as
    | Record<string, string>
    | undefined;
  if (!text) return null;

  const grouped = new Map<number, string[]>();
  for (const key of Object.keys(text)) {
    const match = key.match(/^dhp(\d+):(\d+)$/);
    if (!match) continue;
    const verse = Number(match[1]);
    const line = text[key]?.trim();
    if (!line) continue;
    grouped.set(verse, [...(grouped.get(verse) ?? []), line]);
  }

  if (grouped.size === 0) return null;

  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([n, lines]) => ({ n, text: lines.join(" ") }));
}

/** Bentuk lama: satu blok HTML yang dipreteli jadi baris-baris polos. */
async function legacySutta(
  uid: string,
  author: string,
  lang: string
): Promise<Verse[]> {
  const res = await ambil(`${SUTTACENTRAL}/suttas/${uid}/${author}?lang=${lang}`);
  if (!res.ok) throw new Error(`Vagga tidak ditemukan (${res.status}).`);
  const data = await res.json();

  const raw = data.translation?.text ?? data.root_text?.text ?? "";
  const plain = String(raw)
    .replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&[a-z]+;/g, " ")
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean);

  if (plain.length === 0) throw new Error("Terjemahan kosong.");

  return plain.map((text: string, i: number) => ({ n: i + 1, text }));
}

async function buddhistPassage(translationId: string, vagga: number): Promise<Passage> {
  const entry = DHAMMAPADA_VAGGA[vagga - 1];
  if (!entry) throw new Error("Vagga tidak dikenal.");

  const [author, lang] = translationId.split("/");

  // SuttaCentral menyimpan dua bentuk terjemahan. Yang lebih baru dipecah per
  // segmen (satu baris syair per kunci); yang lama berupa satu blok HTML.
  // Keduanya harus ditangani — memilih salah satu berarti membuang separuh
  // terjemahan yang tersedia.
  const verses =
    (await segmentedSutta(entry.uid, author, lang)) ??
    (await legacySutta(entry.uid, author, lang));

  const listed = (await buddhistTranslations()).find((t) => t.id === translationId);

  return {
    traditionId: "buddhist",
    translationId,
    translationName: listed?.name ?? author,
    bookId: String(vagga),
    bookName: entry.name,
    chapter: vagga,
    verses,
    wordCount: countWords(verses),
    direction: listed?.direction ?? "ltr",
    attribution: TRADITIONS[2].attribution,
  };
}

// ---------------------------------------------------------------------------
// Yahudi — Sefaria
// ---------------------------------------------------------------------------

const SEFARIA = "https://www.sefaria.org/api";

/**
 * Sefaria menyimpan banyak versi per traktat dan sudah menandai satu yang
 * utama untuk tiap bahasa. Dua yang ditawarkan di sini adalah keduanya: teks
 * Ibrani dan terjemahan Inggris. Menyodorkan seluruh daftar versi berarti
 * memberi puluhan pilihan yang bedanya hanya terasa bagi orang yang sudah tahu
 * persis apa yang dicarinya.
 */
async function jewishTranslations(): Promise<TranslationSummary[]> {
  return [
    {
      id: "hebrew",
      name: "עברית — teks Ibrani",
      language: "Hebrew",
      direction: "rtl",
      canonicalNumbering: true,
    },
    {
      id: "english",
      name: "English — Sefaria",
      language: "English",
      direction: "ltr",
      canonicalNumbering: true,
    },
  ];
}

async function jewishBooks(): Promise<BookSummary[]> {
  return MISHNAH.map((t) => ({
    id: t.id,
    name: `${t.name} — ${t.seder}`,
    chapters: t.chapters,
  }));
}

async function jewishPassage(
  translationId: string,
  tractateId: string,
  chapter: number
): Promise<Passage> {
  const tractate = MISHNAH.find((t) => t.id === tractateId);
  if (!tractate) throw new Error("Traktat tidak dikenal.");

  const versi = translationId === "hebrew" ? "hebrew" : "english";
  const ref = encodeURIComponent(`${tractate.id} ${chapter}`);
  const res = await ambil(`${SEFARIA}/v3/texts/${ref}?version=${versi}`);
  if (!res.ok) throw new Error(`Bab tidak ditemukan (${res.status}).`);

  const data = await res.json();
  const version = (data.versions as Record<string, unknown>[] | undefined)?.[0];
  const isi = version?.text;

  if (!Array.isArray(isi) || isi.length === 0) {
    throw new Error("Bab kosong pada versi ini.");
  }

  // Teks Sefaria membawa penanda tipografi — huruf awal yang dibesarkan,
  // catatan kaki, sesekali tabel. Dibersihkan di sini supaya yang sampai ke
  // pembaca hanya kalimatnya; nomor mishnah sudah dibawa oleh urutan lariknya.
  const verses: Verse[] = isi
    .map((baris, i) => ({
      n: i + 1,
      text: stripMarkup(baris)
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&[a-z]+;/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((v) => v.text.length > 0);

  if (verses.length === 0) throw new Error("Bab kosong setelah dibersihkan.");

  return {
    traditionId: "jewish",
    translationId,
    translationName:
      versi === "hebrew" ? "עברית" : String(version?.versionTitle ?? "English"),
    bookId: tractate.id,
    bookName: `${tractate.name} — ${tractate.seder}`,
    chapter,
    verses,
    wordCount: countWords(verses),
    direction: versi === "hebrew" ? "rtl" : "ltr",
    attribution: atribusi("jewish"),
  };
}

// ---------------------------------------------------------------------------
// Hindu — Vedic Scriptures
// ---------------------------------------------------------------------------

const VEDIC = "https://vedicscriptures.github.io";

/** Batas kerja paralel saat satu adhyaya diambil syair demi syair. */
const PARALEL = 8;

async function hinduTranslations(): Promise<TranslationSummary[]> {
  return GITA_VERSIONS.map((v) => ({
    id: v.id,
    name: v.name,
    language: v.language,
    direction: "ltr" as const,
    canonicalNumbering: true,
  }));
}

async function hinduBooks(): Promise<BookSummary[]> {
  return GITA.map((a) => ({
    id: String(a.n),
    name: `${a.n}. ${a.name}`,
    chapters: 1,
  }));
}

/**
 * Arsipnya hanya melayani satu syair per permintaan; tidak ada endpoint yang
 * mengembalikan satu adhyaya utuh. Adhyaya terpanjang berisi 78 syair, jadi
 * pengambilannya dijalankan berombongan delapan-delapan: cukup cepat bagi
 * pembaca, dan tidak menjatuhkan tujuh puluh delapan permintaan sekaligus ke
 * situs statis milik orang lain. Hasilnya disinggahkan sejam oleh lapisan
 * fetch, sehingga ongkos ini hanya dibayar pembaca pertama.
 */
async function hinduPassage(translationId: string, adhyaya: number): Promise<Passage> {
  const bab = GITA.find((a) => a.n === adhyaya);
  if (!bab) throw new Error("Adhyaya tidak dikenal.");

  const versi = GITA_VERSIONS.find((v) => v.id === translationId);
  if (!versi) throw new Error("Terjemahan tidak dikenal.");

  const nomor = Array.from({ length: bab.verses }, (_, i) => i + 1);
  const teks: string[] = new Array(bab.verses).fill("");

  for (let i = 0; i < nomor.length; i += PARALEL) {
    await Promise.all(
      nomor.slice(i, i + PARALEL).map(async (n) => {
        const res = await ambil(`${VEDIC}/slok/${adhyaya}/${n}`);
        if (!res.ok) return;

        const data = (await res.json()) as Record<string, unknown>;
        const mentah =
          versi.field === "slok" || versi.field === "transliteration"
            ? data[versi.field]
            : (data[versi.id] as Record<string, unknown> | undefined)?.[versi.field];

        teks[n - 1] = bersihkanSyair(stripMarkup(mentah));
      })
    );
  }

  const verses: Verse[] = teks
    .map((text, i) => ({ n: i + 1, text }))
    .filter((v) => v.text.length > 0);

  if (verses.length === 0) throw new Error("Adhyaya kosong pada versi ini.");

  return {
    traditionId: "hindu",
    translationId,
    translationName: versi.name,
    bookId: String(adhyaya),
    bookName: `${adhyaya}. ${bab.name}`,
    chapter: 1,
    verses,
    wordCount: countWords(verses),
    direction: "ltr",
    attribution: atribusi("hindu"),
  };
}

/**
 * Membuang penanda nomor yang dibawa sebagian penerjemah di awal atau ujung
 * barisnya — "।।2.47।।" di depan terjemahan Hindi, "||2-47||" di ekor teks
 * akar. Nomornya sudah dibawa oleh urutan larik, dan menampilkannya dua kali
 * membuat syair terbaca seperti keluaran mentah.
 */
/**
 * Angka, dalam angka Arab maupun Devanagari. Arsipnya memakai keduanya: teks
 * akar Sanskertanya menomori syair dengan ०–९, sementara sebagian penerjemah
 * Hindi dan Inggris memakai 0–9 di baris yang sama bentuknya.
 */
const ANGKA = String.raw`[0-9\u0966-\u096F]`;

/** Danda tunggal, danda ganda, dan garis tegak biasa — ketiganya dipakai. */
const DANDA = String.raw`[\u0964\u0965|]{1,2}`;

/** "।।2.47।।", "||२-१||", "॥18-78॥" — penanda yang sama dengan tiga wajah. */
const PENANDA = String.raw`${DANDA}\s*${ANGKA}+[.\-\u0964]${ANGKA}+\s*${DANDA}`;

const DI_DEPAN = new RegExp(String.raw`^\s*${PENANDA}\s*`, "u");
const DI_EKOR = new RegExp(String.raw`\s*${PENANDA}\s*$`, "u");

function bersihkanSyair(teks: string): string {
  return teks
    .replace(DI_DEPAN, "")
    .replace(DI_EKOR, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Sikh — GurbaniNow
// ---------------------------------------------------------------------------

const GURBANI = "https://api.gurbaninow.com/v2";

/** Jumlah ang dalam satu jilid baku Guru Granth Sahib. */
const ANG = 1430;

interface BarisGurbani {
  gurmukhi?: { unicode?: string };
  translation?: {
    english?: { default?: string };
    punjabi?: { default?: { unicode?: string } };
    spanish?: string;
  };
  transliteration?: {
    english?: { text?: string };
    devanagari?: { text?: string };
  };
}

/** Cara satu versi dibaca dari satu baris. Ditulis sekali, dipakai dua kali. */
const GURBANI_VERSIONS: {
  id: string;
  name: string;
  language: string;
  baca: (b: BarisGurbani) => string | undefined;
}[] = [
  {
    id: "gurmukhi",
    name: "ਗੁਰਮੁਖੀ — teks akar",
    language: "Gurmukhi",
    baca: (b) => b.gurmukhi?.unicode,
  },
  {
    id: "english",
    name: "English — Sant Singh Khalsa",
    language: "English",
    baca: (b) => b.translation?.english?.default,
  },
  {
    id: "punjabi",
    name: "ਪੰਜਾਬੀ — Prof. Sahib Singh",
    language: "Punjabi",
    baca: (b) => b.translation?.punjabi?.default?.unicode,
  },
  {
    id: "spanish",
    name: "Español",
    language: "Spanish",
    baca: (b) => b.translation?.spanish,
  },
  {
    id: "transliteration",
    name: "Latin — alih aksara",
    language: "English",
    baca: (b) => b.transliteration?.english?.text,
  },
  {
    id: "devanagari",
    name: "देवनागरी — alih aksara",
    language: "Hindi",
    baca: (b) => b.transliteration?.devanagari?.text,
  },
];

async function sikhTranslations(): Promise<TranslationSummary[]> {
  return GURBANI_VERSIONS.map((v) => ({
    id: v.id,
    name: v.name,
    language: v.language,
    // Gurmukhi ditulis kiri-ke-kanan, sekalipun kerabat aksaranya tidak.
    direction: "ltr" as const,
    canonicalNumbering: true,
  }));
}

/**
 * Satu jilid, seribu empat ratus tiga puluh ang. Dibentuk sebagai satu kitab
 * dengan angnya sebagai bab, karena begitulah orang menyebut letak sebuah baris
 * di dalamnya — "ang 917", bukan bab sekian dari bagian sekian.
 */
async function sikhBooks(): Promise<BookSummary[]> {
  return [{ id: "ggs", name: "Sri Guru Granth Sahib", chapters: ANG }];
}

async function sikhPassage(translationId: string, ang: number): Promise<Passage> {
  if (!Number.isInteger(ang) || ang < 1 || ang > ANG) {
    throw new Error("Ang di luar jangkauan.");
  }

  const versi = GURBANI_VERSIONS.find((v) => v.id === translationId);
  if (!versi) throw new Error("Terjemahan tidak dikenal.");

  const res = await ambil(`${GURBANI}/ang/${ang}`);
  if (!res.ok) throw new Error(`Ang tidak ditemukan (${res.status}).`);

  const data = (await res.json()) as { page?: { line?: BarisGurbani }[] };

  const verses: Verse[] = (data.page ?? [])
    .map((p, i) => ({
      n: i + 1,
      text: stripMarkup(p.line ? versi.baca(p.line) : "")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((v) => v.text.length > 0);

  if (verses.length === 0) throw new Error("Ang kosong pada versi ini.");

  return {
    traditionId: "sikh",
    translationId,
    translationName: versi.name,
    bookId: "ggs",
    bookName: "Sri Guru Granth Sahib",
    chapter: ang,
    verses,
    wordCount: countWords(verses),
    direction: "ltr",
    attribution: atribusi("sikh"),
  };
}

// ---------------------------------------------------------------------------
// Muka tunggal
// ---------------------------------------------------------------------------

export async function listTranslations(tradition: TraditionId): Promise<TranslationSummary[]> {
  switch (tradition) {
    case "christian":
      return christianTranslations();
    case "islam":
      return islamTranslations();
    case "buddhist":
      return buddhistTranslations();
    case "jewish":
      return jewishTranslations();
    case "hindu":
      return hinduTranslations();
    case "sikh":
      return sikhTranslations();
  }
}

export async function listBooks(
  tradition: TraditionId,
  translationId: string
): Promise<BookSummary[]> {
  switch (tradition) {
    case "christian":
      return christianBooks(translationId);
    case "islam":
      return islamBooks();
    case "buddhist":
      return buddhistBooks();
    case "jewish":
      return jewishBooks();
    case "hindu":
      return hinduBooks();
    case "sikh":
      return sikhBooks();
  }
}

export async function getPassage(
  tradition: TraditionId,
  translationId: string,
  bookId: string,
  chapter: number
): Promise<Passage> {
  switch (tradition) {
    case "christian":
      return christianPassage(translationId, bookId, chapter);
    case "islam":
      return islamPassage(translationId, Number(bookId));
    case "buddhist":
      return buddhistPassage(translationId, Number(bookId));
    case "jewish":
      return jewishPassage(translationId, bookId, chapter);
    case "hindu":
      return hinduPassage(translationId, Number(bookId));
    case "sikh":
      return sikhPassage(translationId, chapter);
  }
}

export interface CorpusCount {
  translations: number;
  languages: number;
  traditions: number;
}

/**
 * Menghitung cakupan nyata dari seluruh sumber.
 *
 * Angka ini muncul di halaman muka. Menuliskannya tangan berarti ia akan
 * meleset diam-diam setiap kali sumbernya bertambah, dan angka yang meleset di
 * halaman muka adalah hal pertama yang akan dibantah orang. Jadi dihitung saja.
 *
 * Bahasa dihitung sebagai himpunan gabungan: satu bahasa yang punya terjemahan
 * di dua tradisi tetap satu bahasa.
 */
export async function countCorpus(): Promise<CorpusCount> {
  const lists = await Promise.allSettled(
    TRADITIONS.map((t) => listTranslations(t.id))
  );

  let translations = 0;
  const languages = new Set<string>();

  for (const result of lists) {
    if (result.status !== "fulfilled") continue;
    translations += result.value.length;
    for (const t of result.value) languages.add(t.language.toLowerCase());
  }

  // Bila setiap sumber sedang tidak bisa dihubungi, jangan tampilkan nol —
  // itu lebih menyesatkan daripada tidak menampilkan apa pun.
  if (translations === 0) {
    return { translations: 1781, languages: 1074, traditions: TRADITIONS.length };
  }

  return { translations, languages: languages.size, traditions: TRADITIONS.length };
}

/**
 * Apakah teks ini menyebut salah satu tradisi yang benar-benar ada.
 *
 * Diturunkan dari `TRADITIONS`, bukan ditulis ulang sebagai daftar di tiap rute.
 * Daftar yang disalin akan tertinggal diam-diam begitu ada tradisi baru, dan
 * bentuk kegagalannya adalah tradisi yang tampil di menu tetapi ditolak saat
 * dibuka — persis jenis cacat yang paling lama tidak ketahuan.
 */
export function isTradition(value: unknown): value is TraditionId {
  return (
    typeof value === "string" && TRADITIONS.some((t) => t.id === value)
  );
}

/** Pengenal stabil satu perikop; dipakai sebagai kunci sesi dan di attestation. */
export function passageId(
  tradition: TraditionId,
  translationId: string,
  bookId: string,
  chapter: number
): string {
  return `${tradition}/${translationId}/${bookId}/${chapter}`;
}

export const SURAH_VERSE_COUNTS = SURAH_VERSES;
