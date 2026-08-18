# Bukti jalur lengkap: situs produksi → devnet

Ditulis oleh `app/scripts/prove-live.mjs`. Skrip ini tidak memegang kunci
penilai; kunci itu ada di server Vercel. Yang dikirim ke rantai adalah
attestation yang benar-benar diterbitkan situs produksi.

Dijalankan: 2026-08-18T07:33:09.392Z
Situs: https://stele-gamma.vercel.app
Dompet uji: `6ibZ1m8aU6cpvnJoNfqQmUdtRwGoe8bGuwN5qdbaEJ3A` (baru, sekali pakai)

Perikop yang dibaca: Mazmur 23, King James Version — 118 kata.
Pertanyaan jangkar: kata "beside", dijawab ayat 2.

| Langkah | Hasil | Catatan |
|---|---|---|
| Situs produksi membuka sesi | sesuai | sesi c678914e…, 118 kata, jangkar "beside" |
| Pertanyaan jangkar dijawab dari isi perikop | sesuai | "beside" hanya ada di ayat 2 |
| Server menilai sesi dan menandatangani attestation | sesuai | putusan "counted", ditandatangani HAXHHdiA… |
| Kunci penandatangan cocok dengan yang terdaftar di config on-chain | sesuai | server HAXHHdiA… / rantai HAXHHdiA… |
| Mint yang dipakai situs sama dengan mint di config on-chain | sesuai | 6jLXArDF… |
| Program menerima attestation itu dan mencetak token | sesuai | 0.2 $STL, tx 4tR3SKdjhgreh39Y6DhoAWxbLKBuvS15ktkSaDhJbgT9RFV2J8BeFP1Qi5gAeEMwsJVPWxDheV9QStLzPkPVqJuX |

Transaksi pencetakan:
[`4tR3SKdjhgreh39Y6DhoAWxbLKBuvS15ktkSaDhJbgT9RFV2J8BeFP1Qi5gAeEMwsJVPWxDheV9QStLzPkPVqJuX`](https://explorer.solana.com/tx/4tR3SKdjhgreh39Y6DhoAWxbLKBuvS15ktkSaDhJbgT9RFV2J8BeFP1Qi5gAeEMwsJVPWxDheV9QStLzPkPVqJuX?cluster=devnet)

Saldo dompet uji setelahnya: **0.2 \$STL**.

Yang membedakan berkas ini dari [`BUKTI.md`](BUKTI.md): di sana kami
menandatangani attestation sendiri untuk menguji program. Di sini kunci
penandatangan tidak pernah ada di mesin yang menjalankan skrip, jadi yang
dibuktikan adalah sambungan penuhnya — penilaian sesi, penerbitan attestation,
dan pencetakan on-chain adalah satu rantai yang sama.
