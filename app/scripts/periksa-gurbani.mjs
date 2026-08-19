/**
 * Memeriksa bahwa setiap versi Guru Granth Sahib yang ditawarkan di menu
 * benar-benar punya teks di sepanjang jilidnya.
 *
 * Enam versi didaftarkan di `lib/corpus.ts`, dan tidak semuanya lengkap sampai
 * ang terakhir — terjemahan Spanyol, misalnya, berhenti jauh sebelum akhir di
 * sebagian salinan basis datanya. Versi yang kosong di separuh jilid tidak
 * boleh berdiri di menu seolah setara dengan yang lengkap, jadi cakupannya
 * diukur, bukan diandaikan.
 *
 *   node scripts/periksa-gurbani.mjs        — 30 ang tersebar rata
 *   node scripts/periksa-gurbani.mjs 120    — sebanyak yang diminta
 */

const GURBANI = "https://api.gurbaninow.com/v2";
const ANG = 1430;

/** Sama seperti di lapisan korpus: bagaimana satu versi dibaca dari satu baris. */
const VERSI = [
  ["gurmukhi", (b) => b.gurmukhi?.unicode],
  ["english", (b) => b.translation?.english?.default],
  ["punjabi", (b) => b.translation?.punjabi?.default?.unicode],
  ["spanish", (b) => b.translation?.spanish],
  ["transliteration", (b) => b.transliteration?.english?.text],
  ["devanagari", (b) => b.transliteration?.devanagari?.text],
];

/**
 * Di bawah cakupan ini sebuah versi dianggap setengah jadi.
 *
 * Ditaruh di 85%, bukan lebih tinggi, karena teeka Prof. Sahib Singh memang
 * duduk sekitar 89%: uraiannya ditulis per kelompok baris, bukan per baris,
 * dan satu bagian penutup jilid — ang 1430 — tidak diuraikannya sama sekali.
 * Itu bentuk karyanya, bukan basis data yang rusak. Pembaca yang memilihnya
 * lalu membuka ang tanpa uraian akan melihat pesan bahwa ang itu kosong pada
 * versi tersebut, dan itu keterangan yang jujur; yang tidak boleh terjadi
 * adalah versi yang benar-benar setengah jadi lolos ke menu tanpa ketahuan.
 */
const BATAS_CAKUPAN = 0.85;

const sampel = Number(process.argv[2]) || 30;

async function json(url) {
  for (let i = 0; i < 3; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch {
      // Diulang di bawah.
    }
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  throw new Error(`gagal: ${url}`);
}

// Tersebar rata dari ang pertama sampai terakhir, bukan diacak: hasilnya harus
// sama setiap kali dijalankan supaya bisa dibandingkan antar tanggal.
const angs = Array.from({ length: sampel }, (_, i) =>
  Math.max(1, Math.round(((i + 1) * ANG) / sampel))
);

const terisi = new Map(VERSI.map(([id]) => [id, 0]));
let baris = 0;
let meleset = 0;

for (const n of angs) {
  const data = await json(`${GURBANI}/ang/${n}`);
  const halaman = data.page ?? [];

  if (halaman.length === 0) {
    meleset += 1;
    console.log(`ang ${n}: kosong`);
    continue;
  }

  for (const p of halaman) {
    baris += 1;
    for (const [id, baca] of VERSI) {
      const teks = p.line ? baca(p.line) : undefined;
      if (typeof teks === "string" && teks.trim() !== "") {
        terisi.set(id, terisi.get(id) + 1);
      }
    }
  }
}

for (const [id, n] of terisi) {
  const cakupan = n / baris;
  const catatan = `versi ${id}: ${(cakupan * 100).toFixed(1)}% dari ${baris} baris`;

  if (cakupan < BATAS_CAKUPAN) {
    meleset += 1;
    console.log(`${catatan} — di bawah batas`);
  } else {
    console.log(catatan);
  }
}

console.log(`${angs.length} ang diperiksa, ${meleset} meleset`);

process.exit(meleset === 0 ? 0 : 1);
