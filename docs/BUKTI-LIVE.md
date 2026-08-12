# Bukti jalur lengkap: situs produksi → devnet

Ditulis oleh `app/scripts/prove-live.mjs`. Skrip ini tidak memegang kunci
penilai; kunci itu ada di server Vercel. Yang dikirim ke rantai adalah
attestation yang benar-benar diterbitkan situs produksi.

Dijalankan: 2026-08-12T00:51:35.101Z
Situs: https://stele-gamma.vercel.app
Dompet uji: `Ai9W2vvyihTY2TfwrinpcZp5wieAE2iuSBgZ7rTxtBf2` (baru, sekali pakai)

Perikop yang dibaca: Mazmur 23, King James Version — 118 kata.
Pertanyaan jangkar: kata "righteousness", dijawab ayat 3.

| Langkah | Hasil | Catatan |
|---|---|---|
| Situs produksi membuka sesi | sesuai | sesi 553a98fb…, 118 kata, jangkar "righteousness" |
| Pertanyaan jangkar dijawab dari isi perikop | sesuai | "righteousness" hanya ada di ayat 3 |
| Server menilai sesi dan menandatangani attestation | sesuai | putusan "counted", ditandatangani HAXHHdiA… |
| Kunci penandatangan cocok dengan yang terdaftar di config on-chain | sesuai | server HAXHHdiA… / rantai HAXHHdiA… |
| Mint yang dipakai situs sama dengan mint di config on-chain | sesuai | 6jLXArDF… |
| Program menerima attestation itu dan mencetak token | sesuai | 0.2 $STL, tx 2pdSvCAjZ25EDvCZEz8GS7bbpGwS6K8yS6ZX28BKEg7ZvrzyKpb83WBUBDVX5cXTnkzNgT3fskwNTME5L6f6TAyy |

Transaksi pencetakan:
[`2pdSvCAjZ25EDvCZEz8GS7bbpGwS6K8yS6ZX28BKEg7ZvrzyKpb83WBUBDVX5cXTnkzNgT3fskwNTME5L6f6TAyy`](https://explorer.solana.com/tx/2pdSvCAjZ25EDvCZEz8GS7bbpGwS6K8yS6ZX28BKEg7ZvrzyKpb83WBUBDVX5cXTnkzNgT3fskwNTME5L6f6TAyy?cluster=devnet)

Saldo dompet uji setelahnya: **0.2 \$STL**.

Yang membedakan berkas ini dari [`BUKTI.md`](BUKTI.md): di sana kami
menandatangani attestation sendiri untuk menguji program. Di sini kunci
penandatangan tidak pernah ada di mesin yang menjalankan skrip, jadi yang
dibuktikan adalah sambungan penuhnya — penilaian sesi, penerbitan attestation,
dan pencetakan on-chain adalah satu rantai yang sama.
