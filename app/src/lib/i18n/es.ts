import type { Copy } from "./types";

/** Español. */
export const es: Copy = {
  nav: {
    read: "Leer",
    streak: "Rachas",
    mine: "Tu registro",
    how: "Cómo funciona",
    sources: "Fuentes",
  },
  meta: {
    title: "Stele — un registro de lo que lees",
    description:
      "Lee textos sagrados de varias tradiciones, con un registro guardado en la devnet de Solana.",
  },
  footer: {
    devnet:
      "Funciona en devnet. Los tokens acuñados aquí no tienen valor financiero, y no pretenden tenerlo.",
    textsBy: "Textos provistos por",
    and: "y",
    licenseDetail: "Los detalles de licencia están en",
    sourcesPage: "la página de fuentes",
  },
  lang: {
    label: "Idioma",
    other: "Español",
    switchTo: "Cambiar de idioma",
  },
  home: {
    eyebrow: "Solana devnet",
    title: "Lo que lees deja un registro que nadie puede borrar en silencio.",
    lede: "Stele no te paga por leer. Lo que queda registrado es que leíste — día tras día, en una cadena pública, de una forma que no se puede falsificar ni comprar.",
    ctaRead: "Empezar a leer",
    ctaHow: "Cómo funciona",
    factTranslations: "Traducciones",
    factLanguages: "Idiomas de traducción",
    factInterface: "Idiomas de la interfaz",
    factTraditions: "Tradiciones",
    factCap: "Límite diario",
    rewardHeading: "Por qué no hay recompensa",
    rewardP3:
      "Hay un límite de tres lecturas registradas por día. El lector más constante y el atacante más constante obtienen exactamente la misma cantidad.",
    chainHeading: "Por qué tiene que estar en cadena",
    chainP3:
      "La cadena no está aquí para que no tengas que confiar en un Estado. Está para que no tengas que confiar en nosotros.",
    claimHeading: "Lo que no afirmamos",
    claimP2:
      "Eso no es una prueba. Lo decimos tal cual, y diseñamos todo el sistema asumiendo que esa verificación se puede burlar.",
    claimLink: "Los detalles completos",
    slabAlt: "Una losa de piedra tallada; seis líneas terminadas, la séptima a medias.",
  },
  traditions: {
    christian: "La Biblia",
    christianBlurb:
      "Antiguo y Nuevo Testamento, desde traducciones de dominio público.",
    islam: "El Corán",
    islamBlurb:
      "El texto árabe junto a cientos de traducciones en decenas de idiomas.",
    buddhist: "Dhammapada",
    buddhistBlurb:
      "423 versos en 26 vaggas, junto al texto raíz en pali, desde el archivo de SuttaCentral.",
    jewish: "Misná",
    jewishBlurb:
      "63 tratados en seis órdenes, junto al hebreo, desde el archivo de Sefaria.",
    hindu: "Bhagavad-gītā",
    hinduBlurb:
      "701 versos en 18 capítulos, junto al sánscrito, desde el archivo de Vedic Scriptures.",
    sikh: "Guru Granth Sahib",
    sikhBlurb:
      "1430 angs en escritura gurmuji, junto a sus traducciones, desde el archivo de GurbaniNow.",
  },
  licenses: {
    christian:
      "Dominio público y licencias abiertas, según la traducción.",
    islam:
      "Creative Commons Attribution 3.0. Hay que nombrar y enlazar la fuente.",
    buddhist:
      "CC0 y CC BY, según la traducción.",
    jewish:
      "Dominio público, CC0 y CC BY, según la versión. Hay que nombrar y enlazar la fuente.",
    hindu:
      "Licencia MIT. Hay que nombrar y enlazar la fuente.",
    sikh:
      "Licencia MIT, base de datos Shabad OS. Hay que nombrar y enlazar la fuente.",
  },
  how: {
    title: "Cómo funciona",
    metaTitle: "Cómo funciona — Stele",
    metaDescription:
      "Qué comprueba Stele, qué registra y qué decide deliberadamente no afirmar.",
    lede: "Leer no se puede demostrar criptográficamente. Esta página explica qué se comprueba de verdad, para que juzgues por tu cuenta cuánto vale el registro que recibes.",
    checkedHeading: "Lo que se comprueba",
    paceLabel: "Ritmo.",
    paceText:
      "El tiempo de lectura se compara con la cantidad de palabras. Por debajo de 40 palabras por minuto se considera una pestaña abandonada; por encima de 400 no es velocidad de lectura humana.",
    visibleLabel: "Tiempo con la pestaña visible.",
    visibleText:
      "Solo cuentan los segundos en que la página está realmente visible. Cambiar de pestaña detiene el conteo.",
    scrollLabel: "Forma del desplazamiento.",
    scrollText:
      "Un pasaje largo leído sin un solo desplazamiento no es una lectura.",
    anchorLabel: "Ancla.",
    anchorText:
      "Una pregunta sobre dónde aparece una palabra. Es prueba de presencia, no de comprensión, y responder mal no borra tu lectura.",
    capLabel: "Límite.",
    capText:
      "Tres lecturas registradas por billetera y por día, aplicadas en el servidor y en el programa en cadena.",
    capHeading: "Por qué el límite es lo que más importa",
    capBody:
      "Todas las comprobaciones anteriores puede imitarlas un script con suficiente paciencia. El límite no. Aunque fallara toda la heurística a la vez, el daño máximo sigue siendo tres registros por día y por billetera, la misma cantidad que obtiene el lector más aplicado. Ahí no hay escala que perseguir.",
    recordedHeading: "Lo que se registra",
    recordedBody:
      "En cadena: la dirección de la billetera, el día calendario local, el largo de la racha y la cantidad de tokens. En la base de datos: metadatos de sesión como duración, cantidad de desplazamientos y el pasaje abierto. Ningún contenido de lectura, ningún movimiento del cursor, ninguna grabación de sesión, ninguna identidad más allá de la dirección de la billetera.",
    notClaimedHeading: "Lo que no se afirma",
    notClaimedBody:
      "Stele no afirma que hayas entendido lo leído, no evalúa sinceridad y no toma partido por ninguna tradición. El token $STL vive en devnet, no tiene valor de cambio y no pretende tenerlo. Es un recibo de un hábito, no un pago por devoción.",
  },
  sources: {
    title: "Fuentes de los textos",
    metaTitle: "Fuentes de los textos — Stele",
    metaDescription: "De dónde sale cada texto y bajo qué licencia.",
    lede: "Stele no almacena ni un solo versículo. Cada pasaje se obtiene al abrirlo desde las fuentes de abajo y solo queda en caché. El crédito aparece al pie de cada página de lectura, no solo aquí.",
    correctionHeading: "Correcciones",
    correctionBody:
      "Los errores de texto vienen de la fuente, y la corrección debe ocurrir allí para que todos los que usan esa fuente queden corregidos también. Repórtalo al proyecto correspondiente mediante los enlaces de arriba.",
  },
  readIndex: {
    metaTitle: "Leer — Stele",
    title: "Elige una tradición",
    lede: "Todas provienen de archivos abiertos mantenidos por terceros. Stele no edita, interpreta ni traduce nada por su cuenta.",
  },
  me: {
    metaTitle: "Tu registro — Stele",
    metaDescription:
      "Tu racha, los pasajes registrados y tus transacciones en devnet.",
    title: "Tu registro",
    lede: "Todo lo que hay en esta página está atado a la dirección de tu billetera, no a tu identidad.",
  },
  board: {
    metaTitle: "Rachas — Stele",
    metaDescription: "Ordenado por días consecutivos, no por cantidad de tokens.",
    title: "Rachas",
    lede: "Ordenado por días consecutivos, no por cantidad de tokens. El límite diario hace que cualquier columna basada en volumen tope en la misma cifra para todo el mundo, así que no tiene sentido ordenarla. Lo único que queda para distinguir es la continuidad, y eso no se consigue en una sola noche.",
    archiveHeading: "Todo el archivo hasta ahora",
    statReaders: "lectores registrados",
    statCounted: "pasajes registrados",
    statRejected: "sesiones no registradas",
    statLongest: "racha más larga",
    rejectedNote:
      "La tercera columna se muestra a propósito. Una sesión que se cierra sin registrarse no es una falla del sistema, sino la forma normal de una página que se abre y se deja, y esconderla haría que la evaluación pareciera más severa de lo que es.",
    runningHeading: "Rachas en curso",
    empty: "Todavía no hay ninguna racha en curso. La primera fila sigue vacía.",
    colReader: "Lector",
    colStreak: "Racha",
    colBest: "Mejor",
    colPassages: "Pasajes",
    days: "días",
    footnote:
      "Las direcciones aparecen abreviadas. Sin nombres, sin fotos, y sin más forma de subir que volver mañana.",
  },
  picker: {
    language: "Idioma",
    translation: "Traducción",
    loading: "Cargando…",
    book: "Libro",
    surah: "Sura",
    vagga: "Vagga",
    tractate: "Tratado",
    adhyaya: "Capítulo (adhyaya)",
    ang: "Ang",
    chapter: "Capítulo",
    open: "Abrir la lectura",
    preview: "Primeras líneas",
    previewFailed:
      "Ahora mismo no se puede traer la vista previa del archivo. La lectura se abre igual.",
    numberingNote:
      "El archivo guarda esta traducción como un bloque entero por vagga, no verso por verso. El número junto a cada línea es el orden en que aparece, no el número de verso del Dhammapada. Las traducciones que encabezan la lista sí traen la numeración estándar.",
  },
  reader: {
    verses: "versículos",
    words: "palabras",
    readSuffix: "de lectura",
    noWallet:
      "El texto se puede leer sin billetera. Conecta una billetera de devnet solo si quieres que esta lectura quede registrada.",
    sourceLink: "Fuente",
    recordedTodayBefore: "Registradas",
    recordedTodayMiddle: "de",
    recordedTodayAfter: "lecturas de hoy.",
    doneReading: "Terminé de leer",
    anchorQuestionBefore: "¿Qué versículo contiene la palabra",
    anchorNote:
      "Responder mal no borra tu lectura. Solo hace que la racha no avance hoy.",
    verseOption: "Versículo",
    submit: "Enviar",
    recordThis: "Registrar esta lectura",
    streakLabel: "Racha:",
    days: "días",
    sessionOpenFailed: "No se pudo abrir la sesión.",
    sessionCloseFailed: "No se pudo cerrar la sesión.",
    generalError: "Algo salió mal.",
    txFailed: "No se pudo enviar la transacción.",
    sending: "Enviando la transacción…",
    record: "Registrar en cadena",
    seconds: "s",
    recordedOnDevnet: "Registrado en devnet.",
    viewTx: "Ver la transacción",
  },
  profile: {
    connectPrompt: "Conecta una billetera de devnet para ver tu registro.",
    loading: "Cargando…",
    noRecord:
      "Todavía no hay registro para esta billetera. La primera lectura registrada empezará tu racha.",
    statStreak: "Racha",
    statBest: "Mejor",
    statPassages: "Pasajes",
    statToday: "Hoy",
    days: "días",
    historyHeading: "Historial",
    txLink: "transacción",
    noSessions: "Todavía no hay sesiones.",
    countedBefore: "de",
    countedAfter: "sesiones contadas.",
    countedNote:
      "Una sesión no contada no es una acusación; lo habitual es una pestaña abandonada o una lectura interrumpida.",
    notClosed: "Sin cerrar",
    loadFailed: "No se pudo cargar el perfil.",
    counted: "Registrada",
    tooFast: "Demasiado rápido",
    tooSlow: "Demasiado lento",
    idle: "Pestaña abandonada",
    anchorFailed: "Ancla fallida",
    rateLimited: "Límite diario",
    tooSoon: "Demasiado seguidas",
  },
  traditionPage: {
    unavailable:
      "Ahora mismo no se puede obtener la lista de traducciones desde su fuente. El problema está en el proveedor del texto, no en tu lectura. Vuelve a intentarlo en un momento.",
    translationsAvailable: "traducciones disponibles.",
  },
};
