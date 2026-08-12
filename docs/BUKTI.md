# Bukti jalannya di devnet

Berkas ini ditulis oleh `app/scripts/prove-chain.mjs`, bukan diketik tangan.
Jalankan ulang kapan pun untuk memeriksa isinya sendiri.

Dijalankan: 2026-08-08T11:14:11.853Z

| Bagian | Alamat |
|---|---|
| Program | [`B7iJ9rGP5jPFx3XmWPPAxgvxrv2SvVLRuKNq16iUJWKK`](https://explorer.solana.com/address/B7iJ9rGP5jPFx3XmWPPAxgvxrv2SvVLRuKNq16iUJWKK?cluster=devnet) |
| Mint \$STL | [`6jLXArDFsvzdDEWaAyHaJ8HB2fAqWGmW6AHV1Sg7rCzY`](https://explorer.solana.com/address/6jLXArDFsvzdDEWaAyHaJ8HB2fAqWGmW6AHV1Sg7rCzY?cluster=devnet) |
| Config PDA | [`EBmnypdVLJiV4VgJ5wE8ri2TxMzw59Kjt7h7DqZ2BYf5`](https://explorer.solana.com/address/EBmnypdVLJiV4VgJ5wE8ri2TxMzw59Kjt7h7DqZ2BYf5?cluster=devnet) |
| Kunci penilai | `HAXHHdiAvySjAKt9nEATDdhvi9DZJwRYsPEaB44QAUqK` |

Dompet pembaca dibuat baru setiap kali skrip dijalankan, jadi tidak ada keadaan
lama yang bisa menutupi kegagalan: `J891XuZJmLyhmfDFPEMFtUKcuz4kRxtw864VCGc5Ybyn`

## Hasil

Baris pertama menguji jalur yang seharusnya berhasil; sisanya adalah serangan
yang seharusnya ditolak program. Kolom terakhir memuat nama galat yang benar
benar dilemparkan runtime, diambil dari log transaksi — bukan ringkasan kami.

| # | Percobaan | Harapan | Hasil | Catatan |
|---|---|---|---|---|
| 1 | Klaim sah mencetak token | berhasil | sesuai | saldo 0 → 0.1 $STL, tx 47EVzH1zCS1TDLS7LRHdcFTfteTuVP7uWUpxomHAQzFmWqNP6EQL592axLqpavRf9iYHtuBdN8ZnZNsR7gTwNmrQ |
| 2 | Nonce yang sama dipakai dua kali | ditolak | sesuai | akun PDA nonce sudah terpakai |
| 3 | Ditandatangani kunci selain kunci penilai | ditolak | sesuai | UnknownAttestor — Penanda tangan bukan attestor terdaftar. |
| 4 | Jumlah dinaikkan setelah ditandatangani (masih di bawah plafon) | ditolak | sesuai | AttestationMismatch — Pesan yang ditandatangani tidak cocok dengan klaim ini. |
| 5 | Jumlah dinaikkan sampai melewati plafon on-chain | ditolak | sesuai | RewardOutOfRange — Besar hadiah nol atau melampaui plafon on-chain. |
| 6 | Attestation yang sudah kedaluwarsa | ditolak | sesuai | AttestationExpired — Attestation sudah kedaluwarsa. |
| 7 | Attestation dompet lain dipakai dompet ini | ditolak | sesuai | AttestationMismatch — Pesan yang ditandatangani tidak cocok dengan klaim ini. |
| 8 | Klaim keempat pada hari yang sama | ditolak | sesuai | DailyCapReached — Plafon bacaan harian sudah tercapai. Kembali besok. |

Saldo akhir dompet pembaca: **0.3 \$STL** — tiga klaim yang sah, bukan enam.
Plafon harian memotong percobaan keempat meskipun attestation-nya sah dan
nonce-nya baru.

## Transaksi yang berhasil

1. [`47EVzH1zCS1TDLS7LRHdcFTfteTuVP7u…`](https://explorer.solana.com/tx/47EVzH1zCS1TDLS7LRHdcFTfteTuVP7uWUpxomHAQzFmWqNP6EQL592axLqpavRf9iYHtuBdN8ZnZNsR7gTwNmrQ?cluster=devnet)
2. [`28fSMJ3vXD6nz1stvmk1mZJNr8GP3yfY…`](https://explorer.solana.com/tx/28fSMJ3vXD6nz1stvmk1mZJNr8GP3yfYucmsK6TT9g2P7VfJj2KkYdpEnbrLzpArSq6Dqr88XZBBEjgb1rLkRafs?cluster=devnet)
3. [`64rdyFcikE2R2wYhP9LWqm4CFLTU1cDs…`](https://explorer.solana.com/tx/64rdyFcikE2R2wYhP9LWqm4CFLTU1cDskRYNF2q1FMi3fqfgvvBzXZFjKEEWhjTQaJF2fMdGbRPyVS5EztwtHaWY?cluster=devnet)

## Yang dibuktikan tabel ini

Menandatangani attestation sendiri tidak cukup — percobaan 3 memakai kunci lain
dan ditolak. Menaikkan angkanya juga tidak cukup — percobaan 4 mengubah jumlah
setelah pesan ditandatangani, dan verifikasi Ed25519 langsung menangkapnya.
Menyimpan satu attestation sah lalu memutarnya berkali-kali juga tidak jalan,
karena PDA nonce hanya bisa dibuat sekali.

Yang tersisa hanyalah membaca tiga kali sehari, sama seperti orang lain.
