<p align="center">
  <img src="brand/wordmark.svg" width="260" alt="Stele">
</p>

<p align="center">
  <em>Bacaan Anda meninggalkan catatan yang tidak bisa dihapus siapa pun.</em>
</p>

---

Stele mencatat kebiasaan membaca teks suci ke Solana devnet. Tiga tradisi tersedia
sejak awal — Alkitab, Al-Qur'an, dan Dhammapada — lewat arsip terbuka yang dirawat
pihak lain, bukan salinan yang kami simpan sendiri.

Namanya diambil dari lempeng batu berpahat yang dipakai hampir setiap peradaban
kuno untuk menyimpan catatan publik: prasasti Mesir, Kode Hammurabi, pilar Ashoka,
stela Maya. Bentuk yang sama muncul berulang di tempat-tempat yang tidak pernah
saling bertemu, dengan alasan yang sama — sebuah catatan sebaiknya hidup lebih lama
daripada orang yang membuatnya.

## Yang membedakannya

Token di sini bukan upah. Ia tanda terima.

Perbedaan itu terdengar kecil, tetapi mengubah hampir semua hal. Aplikasi yang
membayar orang membaca akan mengundang skrip, bukan pembaca; ekonominya runtuh
begitu ada yang menghitung berapa keuntungan per jam. Stele memutus insentif itu
dari akar: plafon tiga bacaan per hari per dompet, ditegakkan di server **dan** di
program on-chain. Bahkan bila seluruh heuristik gagal sekaligus, kerugian
maksimalnya sama dengan pembaca paling rajin. Tidak ada skala yang bisa dikejar.

Yang tersisa untuk dikejar hanyalah beruntun — dan beruntun tidak bisa dibeli.

## Yang tidak kami klaim

Membaca tidak bisa dibuktikan secara kriptografis. Kami tidak berpura-pura bisa.

Yang dinilai adalah apakah bentuk sebuah sesi konsisten dengan membaca: kecepatan
terhadap jumlah kata, detik ketika tab benar-benar terlihat, pola gulir, dan satu
pertanyaan jangkar tentang letak sebuah kata. Semuanya bisa ditiru skrip yang cukup
sabar. Plafon harian tidak. Itulah sebabnya plafon yang jadi pertahanan utama, bukan
deteksi.

Rinciannya ada di [`/how-it-works`](app/src/app/how-it-works/page.tsx) dan
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Di rantai

| | |
|---|---|
| Program | [`B7iJ9rGP5jPFx3XmWPPAxgvxrv2SvVLRuKNq16iUJWKK`](https://explorer.solana.com/address/B7iJ9rGP5jPFx3XmWPPAxgvxrv2SvVLRuKNq16iUJWKK?cluster=devnet) |
| Mint $STL | [`6jLXArDFsvzdDEWaAyHaJ8HB2fAqWGmW6AHV1Sg7rCzY`](https://explorer.solana.com/address/6jLXArDFsvzdDEWaAyHaJ8HB2fAqWGmW6AHV1Sg7rCzY?cluster=devnet) |
| Config PDA | [`EBmnypdVLJiV4VgJ5wE8ri2TxMzw59Kjt7h7DqZ2BYf5`](https://explorer.solana.com/address/EBmnypdVLJiV4VgJ5wE8ri2TxMzw59Kjt7h7DqZ2BYf5?cluster=devnet) |

Otoritas cetak dipegang PDA config, bukan dompet siapa pun. Tidak ada otoritas
beku sama sekali — token ini tanda terima, bukan alat kendali.

Dua skrip di `app/scripts/` menulis buktinya sendiri, jadi tidak ada angka di
repositori ini yang perlu dipercaya begitu saja:

```bash
node scripts/prove-chain.mjs   # delapan percobaan terhadap program → docs/BUKTI.md
node scripts/prove-live.mjs    # situs produksi sampai ke rantai   → docs/BUKTI-LIVE.md
```

Tujuh dari delapan percobaan di `prove-chain.mjs` adalah serangan yang harus
ditolak: nonce diulang, ditandatangani kunci lain, jumlah dinaikkan diam-diam,
jumlah dinaikkan melewati plafon, attestation kedaluwarsa, attestation milik
dompet lain, dan klaim keempat pada hari yang sama. Nama galat di laporannya
diambil dari log runtime.

## Susunan

```
app/       Next.js 16, React 19, wallet adapter, rute API
onchain/   Program Anchor 1.0 (Rust) — verifikasi ed25519, nonce PDA, plafon
brand/     Lambang dan wordmark
docs/      Alasan di balik keputusan rancangan
```

Server tidak pernah mencetak token. Ia hanya menandatangani pernyataan 64 byte
bahwa sebuah sesi lolos penilaian; program on-chain memverifikasi tanda tangan itu
lewat introspeksi instruksi Ed25519SigVerify, lalu mencetak. Membongkar kode di
peramban tidak memberi siapa pun kunci penandatangan, dan membobol server pun tidak
melewati plafon.

## Menjalankan secara lokal

```bash
cd app
cp .env.example .env.local     # isi DATABASE_URL dan alamat program
npm install
node scripts/migrate.mjs       # menyiapkan skema Postgres
npm run dev
```

Untuk sisi rantai:

```bash
cd onchain
anchor build
anchor deploy --provider.cluster devnet
cd ../app && node scripts/init-chain.mjs   # mint, pindah otoritas, initialize
```

## Sumber teks

Tidak ada satu ayat pun tersimpan di basis data kami. Setiap perikop diambil saat
dibuka lalu disinggahkan di cache tepi, dan kreditnya ikut ditampilkan di kaki
halaman bacaan — bukan hanya di berkas ini.

Angka di bawah dihitung ulang setiap jam langsung dari sumbernya, dan angka yang
sama itulah yang tampil di halaman muka — tidak ada yang diketik tangan.

| Tradisi | Sumber | Cakupan |
|---|---|---|
| Alkitab | [bible.helloao.org](https://bible.helloao.org) | 1.256 terjemahan, 1.004 bahasa |
| Al-Qur'an | [quran-api](https://github.com/fawazahmed0/quran-api) | 492 terjemahan, 98 bahasa |
| Dhammapada | [SuttaCentral](https://suttacentral.net) | 33 terjemahan, 24 bahasa, plus akar Pali |

Digabung, himpunan bahasanya berjumlah 1.074 — bukan penjumlahan ketiga baris,
karena banyak bahasa muncul di lebih dari satu tradisi.

Sebagian terjemahan Dhammapada hanya tersedia sebagai satu blok per vagga, bukan
per syair. Untuk terjemahan itu nomor di samping baris adalah urutan tampil, dan
pemilih terjemahan menyebutkannya di tempat sebelum perikopnya dibuka.

## Catatan

Berjalan di **Solana devnet**. Token $STL tidak punya nilai tukar dan tidak
dimaksudkan punya. Jangan perlakukan apa pun di sini sebagai aset.

Audit lawan atas ide ini — termasuk hal-hal yang belum terjawab, seperti model
pendapatan — ada di [`docs/AUDIT.md`](docs/AUDIT.md). Berkas itu ditulis untuk
menyerang produknya sendiri, bukan untuk memasarkannya.

Aplikasi: [stele-gamma.vercel.app](https://stele-gamma.vercel.app)
