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

| Tradisi | Sumber | Cakupan |
|---|---|---|
| Alkitab | [bible.helloao.org](https://bible.helloao.org) | 1.000+ terjemahan |
| Al-Qur'an | [quran-api](https://github.com/fawazahmed0/quran-api) | 492 terjemahan, 90+ bahasa |
| Dhammapada | [SuttaCentral](https://suttacentral.net) | Sujato, Buddharakkhita |

## Catatan

Berjalan di **Solana devnet**. Token $STL tidak punya nilai tukar dan tidak
dimaksudkan punya. Jangan perlakukan apa pun di sini sebagai aset.
