import type { Copy } from "./types";

/** Français. */
export const fr: Copy = {
  nav: {
    read: "Lire",
    streak: "Séries",
    mine: "Votre relevé",
    how: "Fonctionnement",
    sources: "Sources",
  },
  meta: {
    title: "Stele — un relevé de vos lectures",
    description:
      "Lisez des textes sacrés de plusieurs traditions, avec un relevé conservé sur le devnet de Solana.",
  },
  footer: {
    devnet:
      "Fonctionne sur devnet. Les jetons frappés ici n'ont aucune valeur financière, et ne sont pas censés en avoir.",
    textsBy: "Textes fournis par",
    and: "et",
    licenseDetail: "Les détails de licence figurent sur",
    sourcesPage: "la page des sources",
  },
  lang: {
    label: "Langue",
    other: "Français",
    switchTo: "Changer de langue",
  },
  home: {
    eyebrow: "Solana devnet",
    title: "Ce que vous lisez laisse un relevé que personne ne peut effacer en silence.",
    lede: "Stele ne vous paie pas pour lire. Ce qui est consigné, c'est que vous avez lu — jour après jour, sur une chaîne publique, sous une forme qui ne se falsifie ni ne s'achète.",
    ctaRead: "Commencer à lire",
    ctaHow: "Fonctionnement",
    factTranslations: "Traductions",
    factLanguages: "Langues de traduction",
    factInterface: "Langues de l'interface",
    factTraditions: "Traditions",
    factCap: "Plafond quotidien",
    rewardHeading: "Pourquoi il n'y a pas de récompense",
    rewardP3:
      "Le plafond est de trois lectures consignées par jour. Le lecteur le plus assidu et l'attaquant le plus assidu obtiennent exactement le même nombre.",
    chainHeading: "Pourquoi cela doit être sur la chaîne",
    chainP3:
      "La chaîne n'est pas là pour vous dispenser de faire confiance à un État. Elle est là pour vous dispenser de nous faire confiance.",
    claimHeading: "Ce que nous n'affirmons pas",
    claimP2:
      "Ce n'est pas une preuve. Nous le disons tel quel, et nous avons conçu tout le système en supposant que cette vérification peut être contournée.",
    claimLink: "Le détail complet",
    slabAlt: "Une dalle de pierre gravée ; six lignes achevées, la septième à moitié.",
  },
  traditions: {
    christian: "La Bible",
    christianBlurb:
      "Ancien et Nouveau Testament, d'après des traductions du domaine public.",
    islam: "Le Coran",
    islamBlurb:
      "Le texte arabe accompagné de centaines de traductions en dizaines de langues.",
    buddhist: "Dhammapada",
    buddhistBlurb:
      "423 stances en 26 vaggas, avec le texte pali d'origine, depuis les archives de SuttaCentral.",
    jewish: "Michna",
    jewishBlurb:
      "63 traités répartis en six ordres, avec l'hébreu, depuis les archives de Sefaria.",
    hindu: "Bhagavad-Gîtâ",
    hinduBlurb:
      "701 stances réparties en 18 chapitres, avec le sanskrit, depuis les archives de Vedic Scriptures.",
    sikh: "Guru Granth Sahib",
    sikhBlurb:
      "1 430 angs en écriture gourmoukhî, avec leurs traductions, depuis les archives de GurbaniNow.",
  },
  how: {
    title: "Fonctionnement",
    metaTitle: "Fonctionnement — Stele",
    metaDescription:
      "Ce que Stele vérifie, ce qu'il consigne, et ce qu'il se garde délibérément d'affirmer.",
    lede: "La lecture ne se prouve pas par la cryptographie. Cette page explique ce qui est réellement vérifié, pour que vous jugiez vous-même de la valeur du relevé que vous obtenez.",
    checkedHeading: "Ce qui est vérifié",
    paceLabel: "Rythme.",
    paceText:
      "Le temps de lecture est rapporté au nombre de mots. En dessous de 40 mots par minute, on considère un onglet abandonné ; au-dessus de 400, ce n'est plus une vitesse de lecture humaine.",
    visibleLabel: "Temps d'onglet visible.",
    visibleText:
      "Seules comptent les secondes où la page est réellement visible. Changer d'onglet arrête le décompte.",
    scrollLabel: "Forme du défilement.",
    scrollText: "Un long passage lu sans un seul défilement n'est pas une lecture.",
    anchorLabel: "Ancre.",
    anchorText:
      "Une question sur l'endroit où figure un mot. C'est une preuve de présence, pas de compréhension, et une mauvaise réponse n'efface pas votre lecture.",
    capLabel: "Plafond.",
    capText:
      "Trois lectures consignées par portefeuille et par jour, appliquées sur le serveur et dans le programme sur la chaîne.",
    capHeading: "Pourquoi le plafond compte le plus",
    capBody:
      "Toutes les vérifications ci-dessus, un script assez patient peut les imiter. Le plafond, non. Même si l'ensemble des heuristiques échouait d'un coup, le dommage maximal resterait de trois relevés par jour et par portefeuille, soit exactement ce qu'obtient le lecteur le plus assidu. Il n'y a là aucune échelle à poursuivre.",
    recordedHeading: "Ce qui est consigné",
    recordedBody:
      "Sur la chaîne : l'adresse du portefeuille, le jour calendaire local, la longueur de la série et le nombre de jetons. Dans la base de données : des métadonnées de séance, à savoir la durée, le nombre de défilements et le passage ouvert. Aucun contenu de lecture, aucun mouvement de curseur, aucun enregistrement de séance, aucune identité au-delà de l'adresse du portefeuille.",
    notClaimedHeading: "Ce qui n'est pas affirmé",
    notClaimedBody:
      "Stele n'affirme pas que vous avez compris ce que vous avez lu, n'évalue pas la sincérité et ne prend parti pour aucune tradition. Le jeton $STL vit sur devnet, n'a aucune valeur d'échange et n'est pas censé en avoir. C'est un reçu d'habitude, pas un salaire de dévotion.",
  },
  sources: {
    title: "Sources des textes",
    metaTitle: "Sources des textes — Stele",
    metaDescription: "D'où vient chaque texte, et sous quelle licence.",
    lede: "Stele ne stocke pas un seul verset. Chaque passage est récupéré à l'ouverture depuis les sources ci-dessous et ne subsiste qu'en cache. Le crédit figure au pied de chaque page de lecture, et pas seulement ici.",
    correctionHeading: "Corrections",
    correctionBody:
      "Les erreurs de texte viennent de la source, et la correction doit y être faite pour que tous ceux qui utilisent cette source en profitent aussi. Signalez-les au projet concerné via les liens ci-dessus.",
  },
  readIndex: {
    metaTitle: "Lire — Stele",
    title: "Choisissez une tradition",
    lede: "Toutes proviennent d'archives ouvertes entretenues par d'autres. Stele n'édite, n'interprète et ne traduit rien par lui-même.",
  },
  me: {
    metaTitle: "Votre relevé — Stele",
    metaDescription:
      "Votre série, les passages consignés et vos transactions sur devnet.",
    title: "Votre relevé",
    lede: "Tout ce qui figure sur cette page est lié à l'adresse de votre portefeuille, pas à votre identité.",
  },
  board: {
    metaTitle: "Séries — Stele",
    metaDescription: "Classé par jours consécutifs, non par nombre de jetons.",
    title: "Séries",
    lede: "Classé par jours consécutifs, non par nombre de jetons. Le plafond quotidien fait plafonner toute colonne fondée sur le volume au même chiffre pour tout le monde, si bien qu'il n'y a rien à y classer. Ne reste pour distinguer que la continuité, et cela ne se rattrape pas en une nuit.",
    archiveHeading: "L'ensemble des archives à ce jour",
    statReaders: "lecteurs enregistrés",
    statCounted: "passages consignés",
    statRejected: "séances non consignées",
    statLongest: "plus longue série",
    rejectedNote:
      "La troisième colonne est affichée à dessein. Une séance close sans être consignée n'est pas une défaillance du système, mais la forme normale d'une page ouverte puis délaissée, et la cacher ferait paraître l'évaluation plus sévère qu'elle ne l'est.",
    runningHeading: "Séries en cours",
    empty: "Aucune série en cours pour l'instant. La première ligne est encore vide.",
    colReader: "Lecteur",
    colStreak: "Série",
    colBest: "Meilleure",
    colPassages: "Passages",
    days: "jours",
    footnote:
      "Les adresses sont abrégées. Pas de noms, pas de photos, et aucun moyen de monter sinon revenir demain.",
  },
  picker: {
    language: "Langue",
    translation: "Traduction",
    loading: "Chargement…",
    book: "Livre",
    surah: "Sourate",
    vagga: "Vagga",
    tractate: "Traité",
    adhyaya: "Chapitre (adhyaya)",
    ang: "Ang",
    chapter: "Chapitre",
    numberingNote:
      "Les archives conservent cette traduction en un seul bloc par vagga, et non stance par stance. Le numéro à côté de chaque ligne est l'ordre d'affichage, non le numéro de stance du Dhammapada. Les traductions en tête de liste portent, elles, la numérotation standard.",
  },
  reader: {
    verses: "versets",
    words: "mots",
    readSuffix: "de lecture",
    noWallet:
      "Le texte se lit sans portefeuille. Connectez un portefeuille devnet seulement si vous voulez que cette lecture soit consignée.",
    sourceLink: "Source",
    recordedTodayBefore: "Consignées",
    recordedTodayMiddle: "sur",
    recordedTodayAfter: "lectures aujourd'hui.",
    doneReading: "J'ai fini de lire",
    anchorQuestionBefore: "Quel verset contient le mot",
    anchorNote:
      "Une mauvaise réponse n'efface pas votre lecture. Elle empêche seulement la série d'avancer aujourd'hui.",
    verseOption: "Verset",
    submit: "Envoyer",
    recordThis: "Consigner cette lecture",
    streakLabel: "Série :",
    days: "jours",
    sessionOpenFailed: "L'ouverture de la séance a échoué.",
    sessionCloseFailed: "La clôture de la séance a échoué.",
    generalError: "Une erreur est survenue.",
    txFailed: "L'envoi de la transaction a échoué.",
    sending: "Envoi de la transaction…",
    record: "Consigner sur la chaîne",
    seconds: "s",
    recordedOnDevnet: "Consigné sur devnet.",
    viewTx: "Voir la transaction",
  },
  profile: {
    connectPrompt: "Connectez un portefeuille devnet pour voir votre relevé.",
    loading: "Chargement…",
    noRecord:
      "Aucun relevé pour ce portefeuille pour l'instant. La première lecture consignée ouvrira votre série.",
    statStreak: "Série",
    statBest: "Meilleure",
    statPassages: "Passages",
    statToday: "Aujourd'hui",
    days: "jours",
    historyHeading: "Historique",
    txLink: "transaction",
    noSessions: "Aucune séance pour l'instant.",
    countedBefore: "sur",
    countedAfter: "séances comptées.",
    countedNote:
      "Une séance non comptée n'est pas une accusation ; un onglet délaissé ou une lecture interrompue en sont le plus souvent la cause.",
    notClosed: "Non close",
    loadFailed: "Le chargement du profil a échoué.",
    counted: "Consignée",
    tooFast: "Trop rapide",
    tooSlow: "Trop lente",
    idle: "Onglet délaissé",
    anchorFailed: "Ancre manquée",
    rateLimited: "Plafond quotidien",
    tooSoon: "Trop rapprochées",
  },
  traditionPage: {
    unavailable:
      "La liste des traductions ne peut pas être récupérée depuis sa source pour le moment. Le problème vient du fournisseur du texte, pas de votre lecture. Réessayez dans un instant.",
    translationsAvailable: "traductions disponibles.",
  },
};
