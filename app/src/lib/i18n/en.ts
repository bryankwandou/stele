import type { Copy } from "./types";

/** English. */
export const en: Copy = {
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
    switchTo: "Change language",
  },
  home: {
    eyebrow: "Solana devnet",
    title: "What you read leaves a record no one can quietly erase.",
    lede: "Stele does not pay you to read. What it records is that you read — day after day, on a public chain, in a form that cannot be forged and cannot be bought.",
    ctaRead: "Start reading",
    ctaHow: "How it works",
    factTranslations: "Translations",
    factLanguages: "Translation languages",
    factInterface: "Interface languages",
    factTraditions: "Traditions",
    factCap: "Daily cap",
    rewardHeading: "Why there is no reward",
    rewardP3:
      "Three recorded readings per day, and no more. The most devoted reader and the most determined attacker end up with exactly the same amount.",
    chainHeading: "Why it has to be on-chain",
    chainP3:
      "The chain is not here so you need not trust a government. It is here so you need not trust us.",
    claimHeading: "What we do not claim",
    claimP2:
      "That is not proof. We say so plainly, and the whole system is designed assuming those checks can be beaten.",
    claimLink: "The full detail",
    slabAlt: "A carved stone slab; six lines finished, the seventh still half cut.",
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
    jewish: "Mishnah",
    jewishBlurb:
      "63 tractates across six orders, alongside the Hebrew, from the Sefaria archive.",
    hindu: "Bhagavad Gita",
    hinduBlurb:
      "701 verses across 18 chapters, alongside the Sanskrit, from the Vedic Scriptures archive.",
    sikh: "Guru Granth Sahib",
    sikhBlurb:
      "1,430 angs in Gurmukhi script, alongside their translations, from the GurbaniNow archive.",
  },
  licenses: {
    christian:
      "Public domain and open licences, varying by translation.",
    islam:
      "Creative Commons Attribution 3.0. The source must be named and linked.",
    buddhist:
      "CC0 and CC BY, varying by translation.",
    jewish:
      "Public domain, CC0, and CC BY, varying by version. The source must be named and linked.",
    hindu:
      "MIT licence. The source must be named and linked.",
    sikh:
      "MIT licence, Shabad OS database. The source must be named and linked.",
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
    lede: "Each is drawn from open archives maintained by others. Stele does not edit, interpret, or translate anything itself.",
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
    tractate: "Tractate",
    adhyaya: "Chapter (adhyaya)",
    ang: "Ang",
    chapter: "Chapter",
    open: "Open the reading",
    preview: "Opening lines",
    previewFailed:
      "The preview cannot be fetched from the archive right now. The reading still opens.",
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
