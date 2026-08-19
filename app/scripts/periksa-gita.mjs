/**
 * Memeriksa dua hal yang ditulis tangan di `lib/gita.ts` terhadap arsipnya.
 *
 * Pertama, jumlah syair tiap adhyaya: kalau meleset, pembaca akan melihat
 * larik kosong di ekor bab, atau kehilangan syair terakhirnya tanpa tanda.
 *
 * Kedua, setiap penerjemah yang didaftarkan benar-benar punya ruas terjemahan
 * pada tiap syair yang diambil. Penerjemah yang hanya melengkapi sebagian bab
 * akan tampil di menu sebagai pilihan yang setengahnya kosong, dan itu jenis
 * cacat yang hanya ketahuan kalau ada yang benar-benar membuka babnya.
 *
 *   node scripts/periksa-gita.mjs          — sampel tiga syair per adhyaya
 *   node scripts/periksa-gita.mjs --penuh  — seluruh 701 syair
 */

import { GITA, GITA_VERSIONS } from "../src/lib/gita.ts";

const VEDIC = "https://vedicscriptures.github.io";
const penuh = process.argv.includes("--penuh");

async function json(url) {
  for (let i = 0; i < 3; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
      if (res.status === 404) return null;
    } catch {
      // Diulang di bawah.
    }
    await new Promise((r) => setTimeout(r, 400 * (i + 1)));
  }
  throw new Error(`gagal: ${url}`);
}

const bab = await json(`${VEDIC}/chapters`);
let meleset = 0;

for (const a of GITA) {
  const asli = bab.find((c) => c.chapter_number === a.n);
  if (asli.verses_count !== a.verses) {
    meleset += 1;
    console.log(`adhyaya ${a.n}: kita ${a.verses}, arsip ${asli.verses_count}`);
  }
}

// Arsipnya menyimpan satu entri lagi setelah syair terakhir tiap adhyaya:
// kolofon "ॐ तत्सदिति…" yang menutup bab. Ia bernomor, tetapi bukan syair, dan
// karena itu tidak ikut dibaca. Yang diperiksa di sini justru bahwa entri
// tambahan itu memang kolofon dan tidak ada apa-apa lagi sesudahnya — kalau
// suatu saat ia berisi syair sungguhan, berarti catatan jumlah kita yang
// tertinggal, bukan arsipnya yang berlebih.
for (const a of GITA) {
  const kolofon = await json(`${VEDIC}/slok/${a.n}/${a.verses + 1}`);
  if (kolofon && !kolofon.slok?.startsWith("ॐ")) {
    meleset += 1;
    console.log(`adhyaya ${a.n}: entri ${a.verses + 1} bukan kolofon`);
  }

  const sesudahnya = await json(`${VEDIC}/slok/${a.n}/${a.verses + 2}`);
  if (sesudahnya && sesudahnya.slok) {
    meleset += 1;
    console.log(`adhyaya ${a.n}: syair ${a.verses + 2} ternyata ada`);
  }
}

const kosong = new Map(GITA_VERSIONS.map((v) => [v.id, 0]));
let diperiksa = 0;

for (const a of GITA) {
  const nomor = penuh
    ? Array.from({ length: a.verses }, (_, i) => i + 1)
    : [1, Math.ceil(a.verses / 2), a.verses];

  for (const n of nomor) {
    const data = await json(`${VEDIC}/slok/${a.n}/${n}`);
    diperiksa += 1;

    for (const v of GITA_VERSIONS) {
      const teks =
        v.field === "slok" || v.field === "transliteration"
          ? data?.[v.field]
          : data?.[v.id]?.[v.field];

      if (typeof teks !== "string" || teks.trim() === "") {
        kosong.set(v.id, kosong.get(v.id) + 1);
      }
    }
  }
}

// Satu-dua syair yang belum diterjemahkan bukan alasan mencabut seluruh
// versinya; larik kosong memang disaring sebelum sampai ke pembaca, dan
// nomor syair yang tersisa tetap benar karena diberikan sebelum penyaringan.
// Yang tidak boleh lolos adalah versi yang sebenarnya setengah jadi, jadi
// batasnya ditaruh di seperduapuluh: di bawah itu dicatat, di atas itu gagal.
const BATAS_CELAH = 0.05;

for (const [id, n] of kosong) {
  if (n === 0) continue;

  const catatan = `versi ${id}: ${n} dari ${diperiksa} syair tanpa teks`;
  if (n / diperiksa > BATAS_CELAH) {
    meleset += 1;
    console.log(`${catatan} — di atas batas`);
  } else {
    console.log(`${catatan} — masih di bawah batas`);
  }
}

console.log(
  `${GITA.length} adhyaya, ${diperiksa} syair diperiksa, ` +
    `${GITA_VERSIONS.length} versi, ${meleset} meleset`
);

process.exit(meleset === 0 ? 0 : 1);
