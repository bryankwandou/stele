# Audit lawan terhadap Stele

Ditulis untuk mencari alasan proyek ini gagal, bukan alasan ia layak menang.
Tidak ada bagian "kekuatan" di sini. Yang bagus tidak perlu dibela; yang rapuh
perlu ditemukan sebelum juri atau pengguna menemukannya.

---

## 1. Pertanyaan yang mematikan: kenapa perlu blockchain

Ini keberatan terkuat terhadap Stele, dan seluruh sisa dokumen ini kurang
penting dibandingkan bagian ini.

Argumen kami sendiri berbunyi: token ini sengaja tidak bernilai. Ia tanda terima,
bukan upah. Tetapi begitu sebuah token dinyatakan tidak bernilai, blockchain
kehilangan satu-satunya hal yang membuatnya sulit digantikan. Catatan "orang ini
membaca Kejadian 1 pada 5 Agustus" bisa disimpan sebagai baris Postgres yang
ditandatangani server, dan 99% pengguna tidak akan bisa membedakannya. Lebih
murah, lebih cepat, tanpa dompet.

Jawaban yang biasa dipakai — tahan sensor, portabel, bisa diverifikasi siapa saja
— tidak menyentuh masalah nyata siapa pun. Tidak ada yang khawatir catatan
bacaan Alkitabnya dihapus rezim. Tidak ada yang ingin memindahkan riwayat
devosinya ke aplikasi lain.

Juri hackathon Solana akan menanyakan ini dalam sepuluh detik pertama. Bila
jawabannya "supaya catatannya permanen", proyek ini kalah dari argumen yang bisa
ditulis di satu baris: pakai database.

**Jawaban yang sebenarnya bisa dipertahankan, dan harus dipakai:** yang menarik
bukan permanennya, melainkan bahwa penerbit catatan tidak bisa berbohong
belakangan. Stele bisa dituduh mengarang beruntun demi angka pengguna, dan tanpa
rantai tuduhan itu tidak terbantahkan. Dengan attestation ed25519 yang
diverifikasi program, Stele secara struktural tidak mampu menerbitkan catatan
yang tidak lolos penilaiannya sendiri, dan plafon tiga per hari ditegakkan di
tempat yang tidak bisa kami ubah diam-diam. Ini bukan soal pengguna tidak
percaya pemerintah; ini soal pengguna tidak perlu percaya **kami**.

Itu argumen yang benar dan jarang dipakai. Ia harus jadi kalimat pertama di
pitch, bukan catatan kaki.

## 2. Papan peringkat bertentangan dengan produknya sendiri

Ini kesalahan terbesar yang murni buatan sendiri.

Stele menaruh papan peringkat beruntun di navigasi utama. Untuk pembaca Kristen
— segmen terbesar dari korpus yang tersedia — ini bertabrakan langsung dengan
Matius 6:1, yang secara harfiah melarang mempertontonkan kesalehan. Bagi banyak
pengguna sasaran, fitur itu bukan sekadar hambar, melainkan hal yang membuat
mereka menutup tab.

Lebih buruk lagi, ia melawan tesis produk. Halaman muka berargumen bahwa yang
tersisa untuk dikejar hanyalah beruntun, dan beruntun tidak bisa dibeli. Lalu
kami memasang papan yang mengubah beruntun jadi kompetisi publik — persis dinamika
"maksimalkan angka" yang katanya kami tolak.

**Perbaikannya:** papan peringkat dihapus dari navigasi, atau diubah jadi angka
agregat tanpa nama ("2.410 orang membaca hari ini"). Perbandingan diri sendiri
terhadap diri sendiri boleh; perangkingan antarorang tidak.

## 3. Irisan audiensnya nyaris kosong

Dua kelompok yang harus bertemu di sini adalah orang yang membaca teks suci tiap
hari, dan orang yang punya dompet Solana. Kelompok pertama condong lebih tua dan
tidak berminat pada kripto. Kelompok kedua sebagian besar tidak sedang mencari
kebiasaan devosi harian.

Meminta seseorang memasang Phantom sebelum membaca Kejadian 1 adalah corong yang
kejam. YouVersion punya lebih dari 700 juta unduhan justru karena tidak meminta
apa pun sebelum ayat pertama.

**Perbaikannya:** membaca harus berjalan tanpa dompet sama sekali. Dompet baru
diminta ketika pengguna ingin mencatatkan bacaan, dan itu pun setelah beberapa
hari. Saat ini urutannya masih terbalik di kepala pengguna karena tombol dompet
duduk di kepala halaman sejak awal.

## 4. Tidak ada model pendapatan, dan hampir semua jalan tertutup

Token tidak bernilai secara sengaja, jadi tidak ada penjualan token. Iklan di
halaman kitab suci akan dibaca sebagai penistaan. Langganan untuk membaca
kitab suci punya masalah yang sama. Menjual data devosi jelas tidak bisa.

Yang tersisa: hibah, donasi, dan penjualan ke institusi. Ketiganya lambat dan
berbasis relasi, bukan produk yang menskalakan sendiri.

Ini artinya Stele, apa adanya, adalah proyek — bukan startup. Menyebutnya
startup di pitch tanpa menjawab ini akan dianggap tidak serius.

## 5. Aset paling bernilai justru bukan yang dipromosikan

Bagian yang benar-benar sulit dibuat orang lain bukan attestation-nya. Yang
sulit adalah lapisan korpusnya: 1.781 terjemahan dalam 1.074 bahasa dari tiga
arsip dengan bentuk API yang berbeda-beda, termasuk dua format SuttaCentral yang
tidak saling kompatibel, penanganan arah tulisan kanan-ke-kiri, dan kewajiban
atribusi yang menempel pada teksnya sehingga mustahil menampilkan perikop tanpa
kreditnya.

Tidak ada satu pun endpoint publik yang melakukan itu di seluruh tradisi.
Pengembang yang ingin membuat aplikasi devosi hari ini harus membangunnya
sendiri, dan itu memakan waktu berminggu-minggu.

**Ini yang seharusnya dijual.** Attestation adalah demonstrasi di atas
infrastruktur itu, bukan sebaliknya.

## 6. Ketergantungan penuh pada tiga API pihak ketiga tanpa jaminan

Seluruh produk mati bila `bible.helloao.org` mati. Tidak ada SLA, tidak ada
kontrak, tidak ada cadangan. Cache tepi satu jam hanya menunda kematian, bukan
mencegahnya.

Untuk proyek yang menjual diri sebagai infrastruktur (lihat poin 5), ini cacat
yang serius. Cadangan minimal untuk terjemahan domain publik yang paling sering
dibuka harus ada.

## 7. Pemeriksaan bacaannya lebih lemah daripada yang tersirat

Pertanyaan jangkar tentang letak sebuah kata bisa dijawab model bahasa yang
membaca halaman yang sama dalam waktu di bawah satu detik. Gerbang kecepatan
hanya menyaring skrip yang paling malas. Pelacakan gulir bisa dipalsukan dengan
beberapa baris kode.

Dokumentasinya memang mengakui ini, dan pengakuan itu benar. Tetapi menyebut
pemeriksaan tersebut "berlapis" memberi kesan pertahanan berlapis, padahal
seluruh lapisan itu runtuh oleh penyerang yang sama. Yang benar-benar bekerja
hanya plafon tiga per hari. Sebaiknya dikatakan begitu saja: satu pertahanan
yang tegak, bukan empat yang rapuh.

## 8. Netral antaragama berarti tidak jadi pilihan pertama siapa pun

Tidak ada orang yang identitasnya "multiagama". Pembaca Kristen ingin aplikasi
Kristen. Pembaca Muslim ingin aplikasi yang menghormati adab tilawah, arah
kiblat, dan waktu. Dengan melayani semuanya secara setara, Stele tidak jadi
pilihan pertama bagi siapa pun, dan kalah dari aplikasi khusus di tiap segmen.

Netralitas itu benar secara etis dan lemah secara distribusi. Keduanya bisa
benar sekaligus. Jalan keluarnya bukan meninggalkan netralitas, melainkan
memilih satu tradisi sebagai pintu masuk pertama dan membiarkan sisanya ada
tanpa dipromosikan.

## 9. Plafon harian juga memotong pengguna terbaik

Plafon tiga per hari membuat penyerang paling gigih setara dengan pembaca paling
gigih. Itu memang tujuannya, dan itu bekerja. Tetapi konsekuensinya jarang
disebut: orang yang membaca dua jam sehari tidak punya cara menunjukkannya.
Pengguna paling berdedikasi justru yang paling cepat menabrak langit-langit.

Kedalaman perlu punya jalan keluar yang bukan jumlah. Panjang perikop, misalnya,
atau menyelesaikan satu kitab utuh.

---

## Ringkas

| Kelemahan | Berat | Keadaan |
|---|---|---|
| Argumen "kenapa rantai" belum dipakai yang benar | Fatal | Diperbaiki |
| Papan peringkat melawan tesis sendiri | Berat | Diperbaiki |
| Dompet diminta terlalu awal | Berat | Diperbaiki |
| Tidak ada model pendapatan | Berat | Terbuka |
| Nilai sebenarnya ada di korpus, bukan attestation | Berat | Sebagian |
| Ketergantungan API tanpa cadangan | Sedang | Terbuka |
| Pemeriksaan digambarkan terlalu kuat | Sedang | Diperbaiki |
| Netralitas melemahkan distribusi | Sedang | Terbuka |
| Plafon memotong pengguna terbaik | Ringan | Terbuka |

---

## Yang berubah setelah audit ini ditulis

**1 — argumen rantai.** Bagian "Kenapa harus di rantai" sekarang jadi blok kedua
di halaman muka, sebelum penjelasan fitur apa pun. Kalimatnya persis argumen di
poin 1: bukan supaya pengguna tidak perlu percaya negara, melainkan supaya tidak
perlu percaya kami.

Sejak itu argumennya tidak lagi berhenti sebagai kalimat. Program sudah digelar
di devnet, dan `app/scripts/prove-chain.mjs` melancarkan tujuh serangan
terhadapnya — termasuk mencoba menandatangani attestation dengan kunci sendiri
dan menaikkan jumlah setelah pesan ditandatangani. Ketujuhnya ditolak dengan
nama galat yang bisa dibaca di `docs/BUKTI.md`. Klaim "kami tidak mampu
berbohong" kini punya berkas yang membuktikannya, bukan hanya menyatakannya.

**2 — papan peringkat.** Tidak dihapus, tetapi dibalik maksudnya. Halaman
sekarang dibuka oleh angka agregat seluruh arsip, dan salah satu dari empat
angka itu adalah jumlah sesi yang ditutup **tanpa** dicatat. Memasang angka
kegagalan sendiri di tempat yang paling terbaca mengubah halaman dari papan
skor menjadi laporan keadaan.

Peringkat beruntun tetap ada karena beruntun adalah satu-satunya kolom yang
tidak bisa dipercepat: plafon harian membuat semua kolom berbasis volume mentok
di angka yang sama. Alamat dipendekkan, tanpa nama dan tanpa foto. Keberatan
Matius 6:1 di poin 2 tetap berlaku dan tidak hilang oleh perubahan ini —
menaruhnya di navigasi utama masih keputusan yang bisa digugat.

**3 — dompet.** Halaman bacaan dirender di server dan tidak pernah menunggu
dompet. Tanpa dompet tersambung, perikopnya tetap tampil utuh, dengan satu
kalimat yang menyebutkan bahwa dompet hanya diperlukan bila pembaca ingin
bacaannya tercatat.

**7 — cara menggambarkan pemeriksaan.** Kata "berlapis" dibuang dari halaman
muka dan berkas pengajuan. Yang tertulis sekarang: pertanyaan jangkar bisa
dijawab model bahasa dalam waktu di bawah satu detik, dan yang benar-benar
bekerja adalah plafonnya.

## Yang masih terbuka, dan tidak ditutupi

**4 — pendapatan.** Belum terjawab. Menyebut arah yang paling masuk akal
(membuka lapisan korpus sebagai infrastruktur) bukan model pendapatan; itu baru
hipotesis tanpa satu pun pelanggan.

**5 — posisi.** Korpus sudah disebut sebagai aset di berkas pengajuan, tetapi
belum ada endpoint publik yang bisa dipakai pengembang lain. Sampai itu ada,
poin ini baru setengah dikerjakan.

**6 — ketergantungan API.** Masih tanpa cadangan. Bila `bible.helloao.org` mati,
sebagian besar korpus ikut hilang.

**8 dan 9 — netralitas dan plafon.** Keduanya konsekuensi dari keputusan yang
disengaja, bukan cacat yang lupa diperbaiki. Disebut di sini supaya tidak perlu
ditemukan orang lain.
