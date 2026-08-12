# Stele — berkas pengajuan

Ringkasan yang bisa disalin ke borang pengajuan, beserta hal-hal yang biasa
ditanyakan juri. Angka di sini diambil dari sistem yang berjalan, bukan dari
perkiraan.

## Satu kalimat

Stele mencatat kebiasaan membaca teks suci ke Solana devnet, dengan token yang
sengaja tidak bernilai — ia tanda terima, bukan upah.

## Paragraf pembuka

Setiap aplikasi yang membayar orang untuk membaca akan mengundang skrip alih-alih
pembaca; sudah pernah ada yang mencobanya dengan satoshi dan aplikasi itu mati.
Stele membalik hubungannya. Token yang terbit tidak bisa ditukar apa pun, jadi
memalsukan sesi hanya menghasilkan catatan kosong tentang pemalsunya sendiri. Di
atas itu ada plafon tiga bacaan tercatat per hari per dompet, ditegakkan di
server dan sekaligus di program on-chain, sehingga pembaca paling gigih dan
penyerang paling gigih mendapat jumlah yang persis sama.

Yang membuat rantai diperlukan bukan ketahanan terhadap sensor. Aplikasi yang
mencatat kesalehan penggunanya punya alasan kuat untuk membesarkan angkanya
sendiri, dan pengguna tidak punya cara memeriksanya. Di Stele, catatan hanya
lahir dari pernyataan 64 byte yang ditandatangani kunci penilai lalu diverifikasi
program lewat introspeksi instruksi Ed25519. Penyelenggara secara struktural
tidak mampu menerbitkan catatan yang tidak lolos penilaiannya sendiri.

## Yang dibangun

| Bagian | Isi |
|---|---|
| Aplikasi | Next.js 16, React 19, wallet adapter, enam halaman produksi |
| Program | Anchor 1.0 (Rust): verifikasi ed25519, nonce PDA anti-ulang, plafon harian |
| Korpus | 1.781 terjemahan dalam 1.074 bahasa dari tiga arsip terbuka |
| Basis data | Neon Postgres — hanya profil pembaca dan metadata sesi |

## Cakupan korpus

Dihitung ulang setiap jam langsung dari sumbernya; angka di halaman muka bukan
tulisan tangan.

| Tradisi | Sumber | Cakupan |
|---|---|---|
| Alkitab | bible.helloao.org | 1.256 terjemahan, 1.004 bahasa |
| Al-Qur'an | quran-api (Tanzil) | 492 terjemahan, 98 bahasa |
| Dhammapada | SuttaCentral | 33 terjemahan, 24 bahasa, plus teks akar Pali |

Tidak ada satu ayat pun tersimpan di basis data. Setiap perikop diambil saat
dibuka dan disinggahkan di tepi, dengan kewajiban atribusi menempel pada teksnya
sehingga mustahil menampilkan perikop tanpa kreditnya.

## Alur satu sesi

1. Perikop diambil dari arsip sumbernya, disinggahkan satu jam di tepi.
2. Sesi dinilai: kecepatan terhadap jumlah kata, detik ketika tab benar-benar
   terlihat, pola gulir, dan satu pertanyaan jangkar yang jawabannya hanya ada di
   halaman itu.
3. Bila lolos, server menandatangani `{dompet, nonce, jumlah, kedaluwarsa}` dengan
   kunci ed25519. Hanya itu yang dilakukan server.
4. Program memverifikasi tanda tangan lewat introspeksi instruksi, memeriksa nonce
   PDA agar tidak bisa dipakai ulang, lalu menegakkan plafon harian.
5. Token dicetak dari PDA perbendaharaan.

Membongkar kode di peramban tidak memberi siapa pun kunci penandatangan, dan
membobol server pun tidak melewati plafon.

## Keadaan sekarang

| Bagian | Keadaan | Bukti |
|---|---|---|
| Enam halaman produksi | Jalan | Seluruhnya menjawab 200 |
| Korpus tiga tradisi | Jalan | 1.781 terjemahan, dihitung dari sumbernya |
| Penilaian sesi dan pertanyaan jangkar | Jalan | Menulis ke Postgres dari Vercel |
| Penandatanganan attestation | Jalan | Tanda tangan sah terhadap tata byte yang diperiksa program |
| Program Anchor di devnet | Jalan | [`B7iJ9rGP…`](https://explorer.solana.com/address/B7iJ9rGP5jPFx3XmWPPAxgvxrv2SvVLRuKNq16iUJWKK?cluster=devnet) |
| Mint \$STL, otoritas di PDA | Jalan | [`6jLXArDF…`](https://explorer.solana.com/address/6jLXArDFsvzdDEWaAyHaJ8HB2fAqWGmW6AHV1Sg7rCzY?cluster=devnet) |
| Pencetakan on-chain | Jalan | Delapan percobaan, [`docs/BUKTI.md`](BUKTI.md) |

### Yang diuji di rantai, bukan diklaim

`app/scripts/prove-chain.mjs` membuat dompet baru setiap kali dijalankan, lalu
melancarkan tujuh serangan terhadap program yang sudah digelar. Nama galat di
kolom kanan diambil dari log runtime, bukan ditulis ulang oleh kami.

| Percobaan | Ditolak dengan |
|---|---|
| Nonce dipakai ulang | PDA nonce sudah terpakai |
| Ditandatangani kunci lain | `UnknownAttestor` |
| Jumlah dinaikkan diam-diam | `AttestationMismatch` |
| Jumlah dinaikkan lewat plafon | `RewardOutOfRange` |
| Attestation kedaluwarsa | `AttestationExpired` |
| Attestation dompet lain | `AttestationMismatch` |
| Klaim keempat pada hari sama | `DailyCapReached` |

Dompet uji berakhir dengan 0,3 \$STL — tiga klaim sah, bukan sepuluh.

```bash
cd app && node scripts/prove-chain.mjs   # menulis ulang docs/BUKTI.md
```

## Pertanyaan yang wajar ditanyakan

**Kenapa tidak pakai basis data saja?** Untuk sekadar menyimpan, memang cukup.
Yang tidak bisa dilakukan basis data adalah membuat penyelenggara tidak mampu
berbohong belakangan. Plafon yang ditegakkan di program tidak bisa diubah
diam-diam oleh kami; plafon di basis data bisa.

**Bisakah dibuktikan seseorang benar-benar membaca?** Tidak. Kami menyebutnya
apa adanya di halaman muka dan di dokumentasi. Pertanyaan jangkar bisa dijawab
model bahasa dalam waktu di bawah satu detik. Yang bekerja bukan deteksinya,
melainkan plafonnya — hadiah maksimalnya terlalu kecil untuk dikejar siapa pun.

**Bagaimana ini menghasilkan uang?** Belum terjawab, dan tidak ada gunanya
mengarang jawaban. Token sengaja tidak bernilai, iklan pada halaman kitab suci
tidak pantas, dan langganan untuk membaca teks suci punya masalah yang sama.
Jalan yang paling masuk akal adalah membuka lapisan korpus sebagai infrastruktur
bagi pengembang lain — hari ini tidak ada endpoint publik yang menyatukan ketiga
tradisi dengan penanganan atribusi dan arah tulisan.

**Apakah ini menjual ibadah?** Sebaliknya. Token tidak bernilai justru supaya
pertanyaan itu tidak pernah relevan. Bila suatu hari token ini bisa ditukar,
seluruh alasan produk ini ada akan runtuh.

## Pranala

- Aplikasi — https://stele-gamma.vercel.app
- Repositori — https://github.com/VincentiusBryanKwandou/stele
- Program di devnet — https://explorer.solana.com/address/B7iJ9rGP5jPFx3XmWPPAxgvxrv2SvVLRuKNq16iUJWKK?cluster=devnet
- Bukti delapan percobaan di rantai — [`docs/BUKTI.md`](BUKTI.md)
- Audit lawan atas ide ini — [`docs/AUDIT.md`](AUDIT.md)
