/**
 * Dua bahasa, satu bentuk.
 *
 * Kamus Inggris diturunkan tipenya dari kamus Indonesia, sehingga satu kunci
 * yang lupa diterjemahkan menjadi galat kompilasi, bukan sesuatu yang baru
 * ketahuan setelah tayang. Tidak ada pustaka i18n di sini: seluruh teks situs
 * ini muat dalam satu berkas, dan menambah dependensi untuk itu hanya menambah
 * hal yang bisa rusak.
 *
 * Bahasa dipilih lewat kuki, bukan lewat awalan URL, supaya setiap tautan yang
 * pernah dibagikan tetap menunjuk ke halaman yang sama apa pun bahasanya.
 */

export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";

/** Nama kuki penyimpan pilihan bahasa. Dibaca di server, ditulis lewat /api/locale. */
export const LOCALE_COOKIE = "stele_lang";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

const id = {
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
    factLanguages: "Bahasa",
    factTraditions: "Tradisi",
    factCap: "Plafon harian",
    rewardHeading: "Kenapa bukan hadiah",
    rewardP1:
      "Aplikasi yang memasang harga per ayat akan mengundang skrip, bukan pembaca. Ketika hadiahnya habis, tidak ada yang tersisa, karena tidak pernah ada alasan lain untuk datang.",
    rewardP2:
      "Stele menolak menjadi mesin itu. Token yang Anda terima adalah tanda terima, bukan upah. Nilainya hanya ada bagi orang yang benar-benar membacanya. Program yang memalsukan sepuluh ribu sesi hanya menghasilkan sepuluh ribu catatan kosong tentang dirinya sendiri.",
    rewardP3:
      "Ada plafon tiga bacaan tercatat per hari. Pembaca paling gigih dan penyerang paling gigih mendapat jumlah yang persis sama.",
    chainHeading: "Kenapa harus di rantai",
    chainP1:
      "Pertanyaan yang wajar, dan jawaban yang biasa diberikan tidak cukup baik. Catatan bacaan tidak sedang terancam sensor. Untuk sekadar menyimpan, satu baris di basis data sudah selesai dan jauh lebih murah.",
    chainP2:
      "Alasannya adalah kami sendiri tidak bisa berbohong. Aplikasi yang mencatat kesalehan penggunanya punya alasan kuat untuk membesarkan angkanya sendiri, dan Anda tidak punya cara memeriksanya. Di sini catatan hanya lahir dari pernyataan 64 byte yang ditandatangani kunci penilai lalu diperiksa program on-chain. Plafon tiga per hari ditegakkan di tempat yang tidak bisa kami ubah diam-diam.",
    chainP3:
      "Rantai di sini bukan supaya Anda tidak perlu percaya negara. Ia supaya Anda tidak perlu percaya kami.",
    claimHeading: "Yang tidak kami klaim",
    claimP1:
      "Tidak ada cara membuktikan seseorang membaca. Yang bisa diperiksa hanya apakah bentuk sebuah sesi masuk akal sebagai bacaan manusia: kecepatan yang wajar, perhatian yang terputus-putus seperti perhatian orang sungguhan, dan satu pertanyaan pendek yang jawabannya cuma ada di halaman itu.",
    claimP2:
      "Itu bukan bukti. Kami menyebutnya apa adanya, dan merancang seluruh sistemnya dengan asumsi bahwa pemeriksaan itu bisa dilewati.",
    claimLink: "Rincian lengkapnya",
    moneyHeading: "Soal uang",
    moneyP1:
      "Token Stele berjalan di devnet dan tidak punya nilai finansial. Itu bukan keterbatasan yang sedang menunggu diperbaiki, melainkan bentuk yang memang diinginkan.",
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
    lede: "Ketiganya diambil dari arsip terbuka yang dirawat pihak lain. Stele tidak menyunting, menafsirkan, atau menerjemahkan apa pun sendiri.",
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

/**
 * Melebarkan tiap teks dari tipe literalnya menjadi `string`.
 *
 * Tanpa ini, `as const` membuat setiap kalimat Indonesia menjadi tipe tersendiri,
 * sehingga kalimat Inggris apa pun dianggap salah. Yang ingin dijaga adalah
 * susunan kuncinya, bukan bunyi kalimatnya.
 */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Copy = Widen<typeof id>;

/**
 * Kamus Inggris wajib punya bentuk yang sama persis. Anotasi `: Copy` inilah
 * yang membuat kunci yang terlewat gagal saat kompilasi.
 */
const en: Copy = {
  nav: {
    read: "Read",
    streak: "Streaks",
    mine: "Your record",
    how: "How it works",
    sources: "Sources",
  },
  meta: {
    title: "Stele — a record of what you read",
    description:
      "Read scripture from several traditions, with a record kept on Solana devnet.",
  },
  footer: {
    devnet:
      "Running on devnet. Tokens minted here carry no financial value, and are not meant to.",
    textsBy: "Texts provided by",
    and: "and",
    licenseDetail: "Licence details are on the",
    sourcesPage: "sources page",
  },
  lang: {
    label: "Language",
    other: "Bahasa Indonesia",
    switchTo: "Beralih ke Bahasa Indonesia",
  },
  home: {
    eyebrow: "Solana devnet",
    title: "What you read leaves a record no one can quietly erase.",
    lede: "Stele does not pay you to read. What it records is that you read — day after day, on a public chain, in a form that cannot be forged and cannot be bought.",
    ctaRead: "Start reading",
    ctaHow: "How it works",
    factTranslations: "Translations",
    factLanguages: "Languages",
    factTraditions: "Traditions",
    factCap: "Daily cap",
    rewardHeading: "Why there is no reward",
    rewardP1:
      "An app that puts a price on each verse attracts scripts, not readers. Once the rewards run out nothing remains, because there was never another reason to show up.",
    rewardP2:
      "Stele refuses to be that machine. The token you receive is a receipt, not a wage. It means something only to the person who actually did the reading. A program that fakes ten thousand sessions produces ten thousand empty records about itself.",
    rewardP3:
      "Three recorded readings per day, and no more. The most devoted reader and the most determined attacker end up with exactly the same amount.",
    chainHeading: "Why it has to be on-chain",
    chainP1:
      "A fair question, and the usual answers are not good enough. Reading records are not under threat of censorship. For storage alone, one database row would do, and cost far less.",
    chainP2:
      "The reason is that we ourselves cannot lie. An app that records how devout its users are has every incentive to inflate its own numbers, and you have no way to check. Here a record can only come from a 64-byte statement signed by the scoring key and verified by the on-chain program. The three-per-day cap is enforced somewhere we cannot quietly change.",
    chainP3:
      "The chain is not here so you need not trust a government. It is here so you need not trust us.",
    claimHeading: "What we do not claim",
    claimP1:
      "There is no way to prove someone read. All that can be checked is whether the shape of a session is plausible as human reading: a sensible pace, attention that breaks up the way real attention does, and one short question whose answer appears only on that page.",
    claimP2:
      "That is not proof. We say so plainly, and the whole system is designed assuming those checks can be beaten.",
    claimLink: "The full detail",
    moneyHeading: "About money",
    moneyP1:
      "Stele tokens run on devnet and hold no financial value. That is not a limitation waiting to be fixed, it is the intended shape.",
  },
  traditions: {
    christian: "The Bible",
    christianBlurb: "Old and New Testament, from public-domain translations.",
    islam: "The Qur'an",
    islamBlurb:
      "The Arabic text alongside hundreds of translations in dozens of languages.",
    buddhist: "The Dhammapada",
    buddhistBlurb:
      "423 verses across 26 vaggas, with the Pali root text, from the SuttaCentral archive.",
  },
  how: {
    title: "How it works",
    metaTitle: "How it works — Stele",
    metaDescription:
      "What Stele checks, what it records, and what it deliberately does not claim.",
    lede: "Reading cannot be proven cryptographically. This page sets out what is actually checked, so you can judge for yourself how much the record you earn is worth.",
    checkedHeading: "What is checked",
    paceLabel: "Pace.",
    paceText:
      "Reading time measured against word count. Under 40 words per minute reads as an abandoned tab; over 400 words per minute is not human reading speed.",
    visibleLabel: "Visible time.",
    visibleText:
      "Only the seconds when the page is genuinely on screen are counted. Switching tabs stops the clock.",
    scrollLabel: "Scroll shape.",
    scrollText: "A long passage read without a single scroll is not reading.",
    anchorLabel: "Anchor question.",
    anchorText:
      "One question about where a word sits. It is evidence of presence, not of comprehension, and answering wrongly does not erase your reading.",
    capLabel: "Cap.",
    capText:
      "Three recorded readings per wallet per day, enforced on the server and in the on-chain program.",
    capHeading: "Why the cap matters most",
    capBody:
      "Every check above can be imitated by a sufficiently patient script. The cap cannot. Even if all the heuristics failed at once, the maximum damage is still three records per day per wallet, the same amount the most diligent reader gets. There is no scale worth chasing there.",
    recordedHeading: "What is recorded",
    recordedBody:
      "On-chain: wallet address, local calendar day, streak length, and token amount. In the database: session metadata, meaning duration, scroll count, and which passage was opened. No reading content, no cursor movement, no session recording, no identity beyond the wallet address.",
    notClaimedHeading: "What is not claimed",
    notClaimedBody:
      "Stele does not claim you understood what you read, does not grade sincerity, and does not favour any one tradition. The $STL token lives on devnet, has no exchange value, and is not meant to. It is a receipt for a habit, not a wage for worship.",
  },
  sources: {
    title: "Where the texts come from",
    metaTitle: "Sources — Stele",
    metaDescription: "Where each text is drawn from, and under which licence.",
    lede: "Stele stores no verses at all. Every passage is fetched when opened from the sources below and only held in cache. Credit appears at the foot of every reading page, not just here.",
    correctionHeading: "Corrections",
    correctionBody:
      "Errors in the text come from the source, and the fix has to happen there so that everyone using that source is corrected too. Report them to the relevant project through the links above.",
  },
  readIndex: {
    metaTitle: "Read — Stele",
    title: "Choose a tradition",
    lede: "All three are drawn from open archives maintained by others. Stele does not edit, interpret, or translate anything itself.",
  },
  me: {
    metaTitle: "Your record — Stele",
    metaDescription: "Your streak, the passages recorded, and your devnet transactions.",
    title: "Your record",
    lede: "Everything on this page is tied to your wallet address, not to your identity.",
  },
  board: {
    metaTitle: "Streaks — Stele",
    metaDescription: "Ranked by consecutive days, not by token count.",
    title: "Streaks",
    lede: "Ranked by consecutive days, not by token count. The daily cap makes any volume-based column top out at the same number for everyone, so ranking one would say nothing. Continuity is all that is left to distinguish, and it cannot be caught up on overnight.",
    archiveHeading: "The whole archive so far",
    statReaders: "readers registered",
    statCounted: "passages recorded",
    statRejected: "sessions not recorded",
    statLongest: "longest streak",
    rejectedNote:
      "The third column is shown on purpose. A session closed without being recorded is not a system failure, it is the ordinary shape of a page opened and then left, and hiding it would make the scoring sound sharper than it is.",
    runningHeading: "Currently running",
    empty: "No streak is running yet. The first row is still empty.",
    colReader: "Reader",
    colStreak: "Streak",
    colBest: "Best",
    colPassages: "Passages",
    days: "days",
    footnote:
      "Addresses are shortened. No names, no photographs, and no way to climb other than coming back tomorrow.",
  },
  picker: {
    language: "Language",
    translation: "Translation",
    loading: "Loading…",
    book: "Book",
    surah: "Surah",
    vagga: "Vagga",
    chapter: "Chapter",
    numberingNote:
      "The archive holds this translation as one block per vagga rather than per verse. The number beside each line is its display order, not the Dhammapada verse number. Translations higher up the list carry the standard numbering.",
  },
  reader: {
    verses: "verses",
    words: "words",
    readSuffix: "read",
    noWallet:
      "The text can be read without a wallet. Connect a devnet wallet only if you want this reading recorded.",
    sourceLink: "Source",
    recordedTodayBefore: "Recorded",
    recordedTodayMiddle: "of",
    recordedTodayAfter: "readings today.",
    doneReading: "Finished reading",
    anchorQuestionBefore: "Which verse contains the word",
    anchorNote:
      "Answering wrongly does not erase your reading. Only the streak fails to advance today.",
    verseOption: "Verse",
    submit: "Submit",
    recordThis: "Record this reading",
    streakLabel: "Streak:",
    days: "days",
    sessionOpenFailed: "The session could not be opened.",
    sessionCloseFailed: "The session could not be closed.",
    generalError: "Something went wrong.",
    txFailed: "The transaction could not be sent.",
    sending: "Sending transaction…",
    record: "Record on-chain",
    seconds: "s",
    recordedOnDevnet: "Recorded on devnet.",
    viewTx: "View the transaction",
  },
  profile: {
    connectPrompt: "Connect a devnet wallet to see your record.",
    loading: "Loading…",
    noRecord:
      "No record for this wallet yet. The first recorded reading will start your streak.",
    statStreak: "Streak",
    statBest: "Best",
    statPassages: "Passages",
    statToday: "Today",
    days: "days",
    historyHeading: "History",
    txLink: "transaction",
    noSessions: "No sessions yet.",
    countedBefore: "of",
    countedAfter: "sessions counted.",
    countedNote:
      "A session that did not count is not an accusation; an abandoned tab or an interrupted reading is the usual cause.",
    notClosed: "Not closed",
    loadFailed: "The profile could not be loaded.",
    counted: "Recorded",
    tooFast: "Too fast",
    tooSlow: "Too slow",
    idle: "Tab left idle",
    anchorFailed: "Anchor missed",
    rateLimited: "Daily cap",
    tooSoon: "Too close together",
  },
  traditionPage: {
    unavailable:
      "The translation list cannot be fetched from its source right now. That is a problem at the text provider, not with your reading. Try again shortly.",
    translationsAvailable: "translations available.",
  },
};

const DICTS: Record<Locale, Copy> = { id, en };

/** Ambil seluruh salinan teks untuk satu bahasa. */
export function copy(locale: Locale): Copy {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}

/**
 * Nama dan keterangan tradisi dalam bahasa pembaca.
 *
 * Ketiganya tinggal di kamus, bukan di `TRADITIONS`, supaya lapisan korpus
 * tetap mengurus asal teks dan lisensinya saja tanpa ikut memikirkan bahasa
 * antarmuka.
 */
export function traditionCopy(
  c: Copy,
  id: "christian" | "islam" | "buddhist"
): { name: string; blurb: string } {
  switch (id) {
    case "christian":
      return { name: c.traditions.christian, blurb: c.traditions.christianBlurb };
    case "islam":
      return { name: c.traditions.islam, blurb: c.traditions.islamBlurb };
    case "buddhist":
      return { name: c.traditions.buddhist, blurb: c.traditions.buddhistBlurb };
  }
}

/** Pemisah ribuan mengikuti bahasa pembaca, bukan mengikuti mesin. */
export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(locale === "en" ? "en-US" : "id-ID");
}
