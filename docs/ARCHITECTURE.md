# Stele — Rancangan Arsitektur

Proyek hobi. Solana **devnet** saja. Vercel Hobby plan.
Status: rancangan. Belum ada kode.

---

## 1. Pergeseran inti: bukan upah, tapi tanda terima

Ini keputusan desain terpenting di seluruh dokumen, dan semua hal lain mengikutinya.

Versi Bitcoin/satoshi yang jadi rujukan Anda mati karena satu kalimat: *ia membayar orang
untuk membaca*. Begitu ada harga per ayat, yang datang bukan pembaca — melainkan skrip.
Dan begitu hadiahnya habis, tidak ada yang tersisa, karena tidak pernah ada alasan lain
untuk datang.

Stele membalik hubungannya. Token bukan bayaran atas bacaan; token adalah **catatan bahwa
bacaan itu terjadi**. Anda tidak digaji karena membaca — Anda mendapat bukti permanen dan
bisa diverifikasi bahwa Anda menjalani praktik ini selama 40 hari berturut-turut, dan bukti
itu tidak bisa dipalsukan atau dibeli.

Perubahan ini menyelesaikan tiga hal sekaligus:

**Melumpuhkan insentif bot.** Tanda terima hanya bernilai bagi orang yang benar-benar
membacanya. Bot yang memalsukan 10.000 sesi baca hanya memiliki 10.000 catatan tak
bermakna tentang dirinya sendiri. Tidak ada yang bisa dijual. Botnya masih mungkin, tapi
tidak ada gunanya — dan pertahanan terbaik melawan penyalahgunaan selalu "tidak ada yang
bisa dicuri", bukan "gerbangnya tinggi".

**Menjawab keberatan pemuka agama.** "Aplikasi yang membayar Anda membaca kitab suci"
memang terdengar seperti mengkomersialkan ibadah. "Aplikasi yang menyimpan catatan tak
terhapus atas disiplin membaca Anda" adalah hal yang berbeda secara mendasar — lebih dekat
ke buku catatan atau kartu kehadiran daripada ke slot machine. Ini bukan permainan kata;
ini menentukan apa yang sebenarnya dibangun.

**Menyelamatkan retensi.** Yang membuat orang kembali adalah beruntun yang tidak ingin
diputus, bukan hadiahnya. Duolingo dibangun di atas kenyataan ini.

Konsekuensi jujurnya: token Stele **sengaja tidak berharga** secara finansial. Di devnet
ia memang tidak berharga; perbedaannya, di sini itu fitur, bukan keterbatasan.

---

## 2. Verifikasi baca — apa yang benar-benar bisa dilakukan

Tidak ada cara membuktikan seseorang membaca. Yang bisa dibuktikan hanyalah bahwa perilaku
sesi ini **konsisten dengan** membaca, dan tidak konsisten dengan otomatisasi. Sistemnya
bertingkat; tidak ada satu lapisan pun yang menentukan sendiri.

### Lapis 1 — Batas laju baca

Setiap perikop punya jumlah kata. Kecepatan baca manusia berada di 150–400 kata per menit;
membaca perenungan lebih lambat lagi, sekitar 80–150 wpm.

- Sesi selesai **lebih cepat** dari 400 wpm → ditolak. Ini bukan manusia.
- Sesi selesai **lebih lambat** dari 40 wpm → tidak ditolak, tapi tidak dihitung penuh.
  Kemungkinan tab ditinggal terbuka.
- Sesi dengan waktu yang *terlalu presisi* — deviasi antar-sesi mendekati nol — ditandai.
  Manusia tidak konsisten; skrip sangat konsisten.

### Lapis 2 — Bentuk perhatian

Yang direkam bukan isi, hanya bentuknya:

- Kejadian `visibilitychange` dan `blur`. Tab tersembunyi → penghitung waktu berhenti.
- Kedalaman gulir sebagai fungsi waktu. Manusia menggulir tersendat, berhenti, kadang
  balik ke atas. Otomatisasi menggulir linear atau melompat.
- Titik kembali. Pembaca sungguhan sering menggulir naik untuk membaca ulang satu ayat.
  Ketiadaan total perilaku ini pada sesi panjang adalah sinyal.

Semua diproses di klien, dikirim sebagai ringkasan statistik, bukan rekaman mentah. Tidak
ada pelacakan kursor atau perekaman sesi — itu tidak sepadan dan akan merusak kepercayaan
di aplikasi bertema keagamaan.

### Lapis 3 — Jangkar pada teks

Setelah perikop selesai, muncul satu pertanyaan pendek yang jawabannya hanya ada di teks
yang barusan tampil di layar. Bukan kuis pemahaman — itu terasa seperti ujian dan merusak
suasana. Cukup jangkar ringan:

> Ayat mana yang menyebut *padang gurun*?
> [ 12 ] [ 17 ] [ 23 ]

Dibuat otomatis dari teks itu sendiri saat build, jadi tidak ada biaya runtime. Menjawab
salah tidak menghapus bacaan — hanya membuat sesi itu tidak diperhitungkan untuk beruntun.
Nadanya harus lembut. Aplikasi ini tidak boleh terasa curiga terhadap penggunanya.

### Lapis 4 — Batas ekonomi

Pertahanan yang paling tidak bisa dilewati adalah batas keras, bukan deteksi.

- Maksimum **3 sesi yang dihitung per hari** per dompet. Bukan 100.
- Beruntun hanya bertambah **sekali per hari kalender** (zona waktu pengguna, dikunci saat
  pendaftaran agar tidak bisa dipindah-pindah).
- Batas laju per IP dan per dompet. Puluhan dompet dari satu IP → semua diturunkan bobotnya.
- Klaim tidak instan. Tersedia setelah **jeda 60 detik** sejak sesi selesai — cukup untuk
  membunuh pola tembak-beruntun tanpa terasa mengganggu bagi manusia.

Dengan plafon 3 sesi/hari, penyerang paling gigih pun hanya memperoleh apa yang diperoleh
pengguna paling rajin. Tidak ada skala yang bisa dieksploitasi.

### Yang tidak akan dilakukan

CAPTCHA di aplikasi devosi. KYC. Sidik jari perangkat invasif. Semua mengusir pengguna
sungguhan lebih cepat daripada mengusir bot, dan pada produk bertema ibadah, harganya
adalah kepercayaan.

---

## 3. Arsitektur sistem

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js (App Router) di Vercel Hobby                       │
│                                                              │
│  Halaman statis ──────────────► CDN Vercel (tak hitung fn)  │
│  Teks kitab suci ─────────────► jsDelivr / API sumber       │
│                                  (0 byte, 0 bandwidth kita) │
│                                                              │
│  Route Handlers (<10 detik):                                │
│   /api/session/start   → terbitkan nonce sesi               │
│   /api/session/finish  → nilai heuristik, tanda tangani     │
│   /api/leaderboard     → agregat ter-cache                  │
└──────────┬────────────────────────────┬─────────────────────┘
           │                            │
   ┌───────▼────────┐         ┌─────────▼──────────────┐
   │ Postgres 256MB │         │ Solana devnet          │
   │ (Neon/Vercel)  │         │  • Program Anchor      │
   │                │         │  • SPL token $STL     │
   │ progres, klaim,│         │  • cNFT lencana beruntun│
   │ nonce, streak  │         │  • Memo receipt        │
   └────────────────┘         └────────────────────────┘
```

**Teks kitab suci tidak pernah menyentuh database.** Ini yang membuat 256MB cukup — bahkan
berlebihan. Yang tersimpan hanya metadata pembacaan.

### Alur klaim (pola attestation)

Klien tidak boleh bisa memanggil program secara langsung untuk mencetak token — itu berarti
siapa pun bisa mencetak tanpa membaca. Polanya:

```
1. Klien: mulai sesi           → server terbitkan nonce + catat waktu mulai
2. Klien: baca                  → kumpulkan metrik perhatian di sisi klien
3. Klien: selesai + jawab jangkar
4. Server: nilai semua lapisan
        lolos → tanda tangani pesan attestation dengan kunci ed25519 server
                {wallet, passage_id, nonce, timestamp}
        gagal → tolak, tanpa membocorkan lapisan mana yang gagal
5. Klien: kirim transaksi berisi attestation + instruksi program
6. Program: verifikasi tanda tangan server lewat Ed25519 program,
            cek nonce belum terpakai (PDA), cek batas harian,
            baru mencetak token & perbarui beruntun on-chain
```

Kunci penandatangan hanya ada di server. Nonce sekali pakai, tersimpan di PDA, sehingga
transaksi yang sama tidak bisa diputar ulang. Bahkan jika seseorang membongkar klien
sepenuhnya, ia tetap tidak bisa mencetak apa pun tanpa lolos penilaian server.

### Kenapa SPL token, bukan transfer SOL devnet

Faucet devnet punya batas laju yang ketat dan sering kosong; aplikasi yang bergantung pada
airdrop SOL akan mati di hari peluncuran. Sebagai gantinya, aplikasi mencetak token SPL-nya
sendiri (`$STL`) dari treasury PDA. Suplai dikendalikan penuh, tidak bergantung faucet,
dan sesuai dengan posisi "ini tanda terima, bukan uang" di §1.

Biaya transaksi tetap butuh SOL devnet — ditangani dengan **fee payer di sisi server**
untuk klaim pertama pengguna, lalu pengguna diarahkan ke faucet untuk selanjutnya.

---

## 4. Skema database

Cukup untuk 256MB dengan jauh lebih dari cukup ruang tersisa.

```sql
-- identitas minimal; tidak ada email, tidak ada nama
create table readers (
  wallet          text primary key,          -- base58 pubkey
  tz              text not null,             -- dikunci saat daftar
  created_at      timestamptz default now(),
  streak_current  int  default 0,
  streak_best     int  default 0,
  last_counted_on date,                      -- tanggal lokal pembaca
  total_passages  int  default 0,
  trust_score     smallint default 100       -- turun bila heuristik curiga
);

-- satu baris per sesi baca yang dimulai
create table sessions (
  id            uuid primary key,
  wallet        text references readers(wallet),
  passage_id    text not null,               -- 'bible/en-web/john/3'
  word_count    int  not null,
  started_at    timestamptz not null,
  finished_at   timestamptz,
  active_ms     int,                         -- waktu tab terlihat saja
  scroll_events int,
  backtracks    int,
  anchor_ok     boolean,
  verdict       text,                        -- counted | too_fast | idle | anchor_failed | rate_limited
  nonce         bytea unique not null
);

-- klaim on-chain yang berhasil
create table claims (
  nonce      bytea primary key references sessions(nonce),
  wallet     text not null,
  signature  text not null,                  -- tx signature devnet
  amount     bigint not null,
  claimed_at timestamptz default now()
);

create index on sessions (wallet, started_at desc);
create index on readers (streak_current desc) where streak_current > 0;
```

Perkiraan ukuran: satu baris `sessions` ≈ 200 byte. 256MB menampung sekitar **1,3 juta
sesi** — puluhan tahun lalu lintas untuk proyek hobi. Baris lebih tua dari 90 hari bisa
diringkas jadi agregat harian bila perlu.

---

## 5. Sumber teks

Tidak ada penerjemahan yang dilakukan. Semua sudah ada, sudah diterjemahkan manusia, dan
berlisensi terbuka. Menerjemahkan kitab suci dengan mesin akan sekaligus mahal, tidak
akurat, dan menyinggung — jangan.

| Tradisi | Sumber | Cakupan | Lisensi |
|---|---|---|---|
| Kristen | Free Use Bible API (eBible/fetch.bible) | 1.250+ terjemahan | Domain publik |
| Islam | Tanzil + fawazahmed0/quran-api | Arab + 90+ bahasa, 400+ terjemahan | CC BY 3.0 — **atribusi & link wajib** |
| Yahudi | Sefaria API | Tanakh, Talmud | CC BY / campuran per teks |
| Buddha | SuttaCentral API | Pali Canon, multi bahasa | CC0 / CC BY |
| Hindu | Bhagavad Gita API | Sanskerta + terjemahan | Terbuka |
| Sikh | SikhiToTheMax / GurbaniDB | Guru Granth Sahib | Terbuka |

**Kewajiban lisensi bukan opsional.** Tanzil mensyaratkan atribusi dan tautan balik ke
tanzil.net di setiap tampilan. Ini masuk ke komponen footer pembaca, bukan disembunyikan di
halaman kredit. Terjemahan modern (NIV, ESV, NLT) berhak cipta penuh — **tidak dipakai**,
titik. Halaman `/sources` mencantumkan setiap teks, sumbernya, dan lisensinya.

Strategi ingest: script Node lokal atau GitHub Action menarik metadata (daftar kitab, bab,
jumlah kata, ayat jangkar) dan meng-commit-nya sebagai JSON statis. Teks lengkapnya diambil
saat runtime dari CDN sumber. Batas 10 detik fungsi Vercel tidak pernah tersentuh karena
ingest tidak pernah berjalan di Vercel.

---

## 6. Halaman

| Rute | Isi |
|---|---|
| `/` | Landing. Proposisi, demo pembaca langsung tanpa dompet, angka jujur |
| `/read` | Pemilih tradisi → bahasa → kitab → perikop |
| `/read/[tradition]/[translation]/[book]/[chapter]` | Pembaca. Inti produk |
| `/me` | Beruntun, riwayat, saldo, lencana |
| `/leaderboard` | Beruntun terpanjang. **Bukan** total token — itu mengundang farming |
| `/sources` | Setiap teks, sumber, lisensi, atribusi |
| `/how-it-works` | Cara verifikasi bekerja, apa yang direkam, apa yang tidak |
| `/faq` | Termasuk jawaban langsung atas keberatan "apakah ini menjual ibadah" |

Papan peringkat diurutkan berdasarkan **beruntun**, bukan jumlah token. Detail kecil dengan
akibat besar: memeringkat berdasarkan volume adalah undangan terbuka untuk farming.

---

## 7. Tumpukan teknologi

- Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui
- `@solana/wallet-adapter` — Phantom, Solflare, Backpack
- Anchor untuk program devnet; `@solana/web3.js` + `@solana/spl-token` di klien
- Metaplex Bubblegum untuk lencana beruntun berbentuk cNFT (murah, ribuan lencana ≈ sen)
- Neon Postgres via `@vercel/postgres` atau Drizzle
- Semua teks kitab suci dari CDN sumber, di-cache di edge

---

## 8. Urutan pengerjaan

| Tahap | Isi | Selesai bila |
|---|---|---|
| 0 | Scaffold, koneksi dompet devnet, satu perikop hardcoded | Dompet tersambung, teks tampil |
| 1 | Ingest metadata + pembaca multi-tradisi multi-bahasa | Bisa membaca lintas 6 tradisi |
| 2 | Pelacakan sesi + heuristik lapis 1–2, belum on-chain | Sesi dinilai benar di database |
| 3 | Program Anchor + attestation + mint $STL | Klaim berhasil di devnet, terlihat di explorer |
| 4 | Beruntun, lencana cNFT, papan peringkat | Beruntun bertahan lintas hari |
| 5 | Halaman sumber/FAQ, atribusi lisensi, poles | Kewajiban lisensi terpenuhi |

Tahap 0–2 sudah merupakan aplikasi baca multi-agama yang berguna tanpa satu pun komponen
kripto. Itu disengaja: kalau bagian Web3-nya dilepas, yang tersisa tetap ada gunanya.
Kalau tidak begitu, produknya memang tidak pernah nyata.

---

## 9. Yang masih terbuka

- **Nama `Stele` belum diverifikasi** ketersediaannya di GitHub/Vercel. Sesi ini tanpa
  kredensial dan saya tidak akan mengklaim tersedia tanpa mengecek. Cek dengan:
  `gh repo view <user>/Stele` · `curl -sI https://Stele.vercel.app`
  Cadangan: `Stele-app`, `useStele`, `Steledaily`, `slowread`.
- Perlakuan teks kanan-ke-kiri (Arab, Ibrani) butuh penanganan tata letak tersendiri.
- Kebijakan privasi harus ditulis sungguhan. Aplikasi ini tahu kitab suci apa yang dibaca
  seseorang — itu data keagamaan, kategori sensitif di GDPR. Menyimpan sesedikit mungkin,
  dan mengatakannya terus terang.
- Berkas `E:\Download\wallet hackaton darurat.txt` berisi kredensial dompet dalam teks
  polos. Untuk devnet risikonya kecil, tapi jangan pernah pakai dompet itu di mainnet.
