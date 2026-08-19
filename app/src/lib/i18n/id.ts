/**
 * Bahasa Indonesia — kamus acuan.
 *
 * Bentuk objek inilah yang menjadi tipe `Copy`, jadi setiap kunci yang
 * ditambahkan di sini wajib ikut diterjemahkan di seluruh berkas bahasa lain
 * sebelum proyek bisa dikompilasi.
 */
export const id = {
  nav: {
    read: "Baca",
    streak: "Beruntun",
    mine: "Catatan Anda",
    how: "Cara kerja",
    sources: "Sumber",
  },
  meta: {
    title: "Stele — catatan atas bacaan Anda",
    description:
      "Membaca teks suci dari beberapa tradisi, dengan catatan yang tersimpan di Solana devnet.",
  },
  footer: {
    devnet:
      "Berjalan di devnet. Token yang dicetak di sini tidak punya nilai finansial, dan memang tidak dimaksudkan punya.",
    textsBy: "Teks disediakan oleh",
    and: "dan",
    licenseDetail: "Rincian lisensi ada di",
    sourcesPage: "halaman sumber",
  },
  lang: {
    label: "Bahasa",
    other: "English",
    switchTo: "Switch to English",
  },
  home: {
    eyebrow: "Solana devnet",
    title: "Bacaan Anda meninggalkan catatan yang tidak bisa dihapus siapa pun.",
    lede: "Stele bukan aplikasi yang membayar Anda membaca. Yang dicatat adalah bahwa Anda membaca — hari demi hari, di rantai publik, dalam bentuk yang tidak bisa dipalsukan dan tidak bisa dibeli.",
    ctaRead: "Mulai membaca",
    ctaHow: "Cara kerjanya",
    factTranslations: "Terjemahan",
    factLanguages: "Bahasa terjemahan",
    factInterface: "Bahasa antarmuka",
    factTraditions: "Tradisi",
    factCap: "Plafon harian",
    rewardHeading: "Kenapa bukan hadiah",
    rewardP3:
      "Ada plafon tiga bacaan tercatat per hari. Pembaca paling gigih dan penyerang paling gigih mendapat jumlah yang persis sama.",
    chainHeading: "Kenapa harus di rantai",
    chainP3:
      "Rantai di sini bukan supaya Anda tidak perlu percaya negara. Ia supaya Anda tidak perlu percaya kami.",
    claimHeading: "Yang tidak kami klaim",
    claimP2:
      "Itu bukan bukti. Kami menyebutnya apa adanya, dan merancang seluruh sistemnya dengan asumsi bahwa pemeriksaan itu bisa dilewati.",
    claimLink: "Rincian lengkapnya",
  },
  traditions: {
    christian: "Alkitab",
    christianBlurb:
      "Perjanjian Lama dan Perjanjian Baru, dari terjemahan domain publik.",
    islam: "Al-Qur'an",
    islamBlurb: "Teks Arab beserta ratusan terjemahan dalam puluhan bahasa.",
    buddhist: "Dhammapada",
    buddhistBlurb:
      "423 syair dalam 26 vagga, beserta teks akar Pali, dari arsip SuttaCentral.",
    jewish: "Mishnah",
    jewishBlurb:
      "63 traktat dalam enam seder, beserta teks Ibraninya, dari arsip Sefaria.",
    hindu: "Bhagawadgita",
    hinduBlurb:
      "701 syair dalam 18 adhyaya, beserta teks Sanskertanya, dari arsip Vedic Scriptures.",
    sikh: "Guru Granth Sahib",
    sikhBlurb:
      "1.430 ang dalam aksara Gurmukhi, beserta terjemahannya, dari arsip GurbaniNow.",
  },
  how: {
    title: "Cara kerjanya",
    metaTitle: "Cara kerjanya — Stele",
    metaDescription:
      "Apa yang diperiksa Stele, apa yang dicatat, dan apa yang sengaja tidak diklaim.",
    lede: "Membaca tidak bisa dibuktikan secara kriptografis. Halaman ini menjelaskan apa yang benar-benar diperiksa, supaya Anda bisa menilai sendiri seberapa berarti catatan yang Anda dapat.",
    checkedHeading: "Yang diperiksa",
    paceLabel: "Kecepatan.",
    paceText:
      "Waktu baca dibandingkan dengan jumlah kata. Di bawah 40 kata per menit dianggap tab yang ditinggalkan; di atas 400 kata per menit bukan kecepatan baca manusia.",
    visibleLabel: "Waktu tab terlihat.",
    visibleText:
      "Yang dihitung hanya detik ketika halaman benar-benar terlihat. Pindah tab menghentikan hitungan.",
    scrollLabel: "Bentuk gulir.",
    scrollText: "Perikop panjang yang dibaca tanpa satu pun gulir bukan bacaan.",
    anchorLabel: "Jangkar.",
    anchorText:
      "Satu pertanyaan tentang letak sebuah kata. Ini bukti kehadiran, bukan bukti pemahaman, dan menjawab keliru tidak menghapus bacaan Anda.",
    capLabel: "Plafon.",
    capText:
      "Tiga bacaan tercatat per dompet per hari, ditegakkan di server dan di program on-chain.",
    capHeading: "Kenapa plafon yang paling penting",
    capBody:
      "Semua pemeriksaan di atas bisa ditiru oleh skrip yang cukup sabar. Plafon tidak. Bahkan jika seluruh heuristik gagal sekaligus, kerugian maksimalnya tetap tiga catatan per hari per dompet, jumlah yang sama dengan pembaca paling rajin. Tidak ada skala yang bisa dikejar di sana.",
    recordedHeading: "Yang dicatat",
    recordedBody:
      "Di rantai: alamat dompet, hari kalender lokal, panjang beruntun, dan jumlah token. Di basis data: metadata sesi berupa durasi, jumlah gulir, dan perikop yang dibuka. Tidak ada isi bacaan, tidak ada gerak kursor, tidak ada rekaman sesi, tidak ada identitas di luar alamat dompet.",
    notClaimedHeading: "Yang tidak diklaim",
    notClaimedBody:
      "Stele tidak mengklaim Anda memahami yang dibaca, tidak menilai kesungguhan, dan tidak berpihak pada satu tradisi. Token $STL hidup di devnet, tidak punya nilai tukar, dan tidak dimaksudkan punya. Ia tanda terima atas kebiasaan, bukan upah atas ibadah.",
  },
  sources: {
    title: "Sumber teks",
    metaTitle: "Sumber teks — Stele",
    metaDescription: "Dari mana setiap teks diambil, dan di bawah lisensi apa.",
    lede: "Stele tidak menyimpan satu pun ayat. Setiap perikop diambil saat dibuka dari sumber di bawah ini dan hanya disinggahkan di cache. Kredit ikut ditampilkan di kaki setiap halaman bacaan, bukan hanya di sini.",
    correctionHeading: "Koreksi",
    correctionBody:
      "Kekeliruan teks berasal dari sumbernya, dan perbaikannya harus terjadi di sana agar semua yang memakai sumber itu ikut terkoreksi. Laporkan ke proyek yang bersangkutan lewat tautan di atas.",
  },
  readIndex: {
    metaTitle: "Baca — Stele",
    title: "Pilih tradisi",
    lede: "Semuanya diambil dari arsip terbuka yang dirawat pihak lain. Stele tidak menyunting, menafsirkan, atau menerjemahkan apa pun sendiri.",
  },
  me: {
    metaTitle: "Catatan Anda — Stele",
    metaDescription: "Beruntun, perikop yang tercatat, dan transaksi devnet Anda.",
    title: "Catatan Anda",
    lede: "Semua yang ada di halaman ini terikat pada alamat dompet Anda, bukan pada identitas Anda.",
  },
  board: {
    metaTitle: "Beruntun — Stele",
    metaDescription: "Peringkat berdasarkan hari berturut-turut, bukan jumlah token.",
    title: "Beruntun",
    lede: "Diurutkan berdasarkan hari berturut-turut, bukan jumlah token. Plafon harian membuat kolom mana pun yang berbasis volume mentok di angka yang sama untuk semua orang, jadi tidak ada gunanya memeringkatnya. Yang tersisa untuk dibedakan hanyalah kesinambungan, dan itu tidak bisa dikejar dalam satu malam.",
    archiveHeading: "Seluruh arsip sejauh ini",
    statReaders: "pembaca terdaftar",
    statCounted: "perikop tercatat",
    statRejected: "sesi tidak dicatat",
    statLongest: "beruntun terpanjang",
    rejectedNote:
      "Kolom ketiga dipajang dengan sengaja. Sesi yang ditutup tanpa dicatat bukan kegagalan sistem, melainkan bentuk normal dari halaman yang dibuka lalu ditinggal, dan menyembunyikannya akan membuat penilaian terdengar lebih tajam daripada yang sebenarnya.",
    runningHeading: "Yang sedang berjalan",
    empty: "Belum ada beruntun yang berjalan. Baris pertama masih kosong.",
    colReader: "Pembaca",
    colStreak: "Beruntun",
    colBest: "Terbaik",
    colPassages: "Perikop",
    days: "hari",
    footnote:
      "Alamat dipendekkan. Tidak ada nama, tidak ada foto, dan tidak ada cara menaikkan posisi selain kembali besok.",
  },
  picker: {
    language: "Bahasa",
    translation: "Terjemahan",
    loading: "Memuat…",
    book: "Kitab",
    surah: "Surah",
    vagga: "Vagga",
    tractate: "Traktat",
    adhyaya: "Adhyaya",
    ang: "Ang",
    chapter: "Pasal",
    numberingNote:
      "Arsip menyimpan terjemahan ini sebagai satu blok utuh per vagga, bukan per syair. Nomor di samping baris adalah urutan tampil, bukan nomor syair Dhammapada. Terjemahan di urutan atas daftar punya penomoran baku.",
  },
  reader: {
    verses: "ayat",
    words: "kata",
    readSuffix: "dibaca",
    noWallet:
      "Teksnya bisa dibaca tanpa dompet. Sambungkan dompet devnet hanya bila Anda ingin bacaan ini tercatat.",
    sourceLink: "Sumber",
    recordedTodayBefore: "Tercatat",
    recordedTodayMiddle: "dari",
    recordedTodayAfter: "bacaan hari ini.",
    doneReading: "Selesai membaca",
    anchorQuestionBefore: "Ayat mana yang memuat kata",
    anchorNote:
      "Menjawab keliru tidak menghapus bacaan Anda. Hanya beruntun yang tidak bertambah hari ini.",
    verseOption: "Ayat",
    submit: "Kirim",
    recordThis: "Catat bacaan ini",
    streakLabel: "Beruntun:",
    days: "hari",
    sessionOpenFailed: "Sesi gagal dibuka.",
    sessionCloseFailed: "Sesi gagal ditutup.",
    generalError: "Terjadi kesalahan.",
    txFailed: "Transaksi gagal dikirim.",
    sending: "Mengirim transaksi…",
    record: "Catat di rantai",
    seconds: "dtk",
    recordedOnDevnet: "Tercatat di devnet.",
    viewTx: "Lihat transaksinya",
  },
  profile: {
    connectPrompt: "Sambungkan dompet devnet untuk melihat catatan Anda.",
    loading: "Memuat…",
    noRecord:
      "Belum ada catatan untuk dompet ini. Bacaan pertama yang tercatat akan memulai beruntun Anda.",
    statStreak: "Beruntun",
    statBest: "Terbaik",
    statPassages: "Perikop",
    statToday: "Hari ini",
    days: "hari",
    historyHeading: "Riwayat",
    txLink: "transaksi",
    noSessions: "Belum ada sesi.",
    countedBefore: "dari",
    countedAfter: "sesi terhitung.",
    countedNote:
      "Sesi yang tidak terhitung bukan tuduhan; tab yang ditinggalkan dan bacaan yang terpotong lebih sering jadi sebabnya.",
    notClosed: "Belum ditutup",
    loadFailed: "Profil gagal dimuat.",
    counted: "Tercatat",
    tooFast: "Terlalu cepat",
    tooSlow: "Terlalu lambat",
    idle: "Tab ditinggalkan",
    anchorFailed: "Jangkar keliru",
    rateLimited: "Plafon harian",
    tooSoon: "Terlalu berdekatan",
  },
  traditionPage: {
    unavailable:
      "Daftar terjemahan sedang tidak bisa diambil dari sumbernya. Ini gangguan di sisi penyedia teks, bukan di bacaan Anda. Coba lagi sebentar lagi.",
    translationsAvailable: "terjemahan tersedia.",
  },
} as const;
