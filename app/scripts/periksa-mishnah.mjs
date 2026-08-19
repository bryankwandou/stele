/**
 * Mencocokkan jumlah bab tiap traktat di `src/lib/mishnah.ts` dengan indeks
 * Sefaria.
 *
 * Daftar traktat ditulis sebagai tetapan supaya menu tidak memerlukan 63
 * permintaan jaringan setiap kali dibuka. Harga dari keputusan itu adalah
 * angka yang bisa salah tanpa ada yang memberitahu, dan berkas ini yang
 * membayarnya: sekali jalan, setiap angka diadu dengan sumbernya.
 *
 *   node scripts/periksa-mishnah.mjs
 *
 * Keluar dengan status bukan nol bila ada yang meleset, sehingga bisa dipasang
 * di rangkaian pemeriksaan tanpa perlu ada yang membaca keluarannya.
 */

import { readFileSync } from "node:fs";

const sumber = readFileSync(new URL("../src/lib/mishnah.ts", import.meta.url), "utf8");

const daftar = [...sumber.matchAll(/id: "([^"]+)".*?chapters: (\d+)/g)].map((m) => ({
  id: m[1],
  bab: Number(m[2]),
}));

if (daftar.length === 0) {
  console.error("Daftar traktat tidak terbaca. Bentuk berkasnya mungkin berubah.");
  process.exit(1);
}

/** Sefaria membalas 429 bila diberondong; jeda kecil membuatnya tetap ramah. */
const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

let meleset = 0;
let gagal = 0;

for (const traktat of daftar) {
  const url = `https://www.sefaria.org/api/v2/index/${encodeURIComponent(
    traktat.id.replace(/ /g, "_")
  )}`;

  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (galat) {
    console.error(`?  ${traktat.id} — tidak bisa diperiksa (${galat.message})`);
    gagal += 1;
    await jeda(120);
    continue;
  }

  // `lengths[0]` adalah jumlah bab; kedalaman kedua adalah jumlah mishnah per bab.
  const sebenarnya = data?.schema?.lengths?.[0];

  if (typeof sebenarnya !== "number") {
    console.error(`?  ${traktat.id} — indeks tidak menyebut jumlah bab`);
    gagal += 1;
  } else if (sebenarnya !== traktat.bab) {
    console.error(`X  ${traktat.id} — tertulis ${traktat.bab}, sebenarnya ${sebenarnya}`);
    meleset += 1;
  } else {
    console.log(`ok ${traktat.id} — ${sebenarnya} bab`);
  }

  await jeda(120);
}

console.log(
  `\n${daftar.length} traktat diperiksa · ${meleset} meleset · ${gagal} tidak terperiksa`
);

process.exit(meleset > 0 ? 1 : 0);
