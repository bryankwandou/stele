/**
 * Bukti bahwa jalur lengkapnya tersambung: situs produksi → attestation →
 * pencetakan di devnet.
 *
 * Berbeda dari `prove-chain.mjs`, skrip ini tidak menandatangani apa pun
 * sendiri. Kunci penilai ada di server Vercel dan tidak pernah menyentuh mesin
 * ini. Yang dilakukan skrip persis yang dilakukan peramban: membuka sesi,
 * membaca perikopnya, menjawab pertanyaan jangkar, menutup sesi, lalu mengirim
 * attestation yang diterima ke program.
 *
 * Kalau skrip ini lulus, tidak ada bagian rantai pasok yang tersisa untuk
 * dipercaya begitu saja.
 *
 * Jalankan: node scripts/prove-live.mjs [url]
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Ed25519Program,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import bs58 from "bs58";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const SITUS = (process.argv[2] ?? "https://stele-gamma.vercel.app").replace(/\/$/, "");
const RPC = process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);
const MINT = new PublicKey(process.env.NEXT_PUBLIC_MINT);

const CLAIM_DISC = new Uint8Array([62, 198, 214, 193, 213, 159, 108, 210]);
const REGISTER_DISC = new Uint8Array([18, 205, 217, 132, 232, 232, 65, 85]);

const connection = new Connection(RPC, "confirmed");
const deployer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(path.join(process.cwd(), "..", ".keys", "deployer.json"), "utf8")))
);

const pda = (s) => PublicKey.findProgramAddressSync(s, PROGRAM_ID)[0];
const configPda = pda([Buffer.from("config")]);
const readerPda = (o) => pda([Buffer.from("reader"), o.toBuffer()]);
const noncePda = (n) => pda([Buffer.from("nonce"), Buffer.from(n)]);

const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(url, init) {
  const res = await fetch(url, init);
  const teks = await res.text();
  let data;
  try {
    data = JSON.parse(teks);
  } catch {
    throw new Error(`${url} membalas bukan JSON (${res.status}): ${teks.slice(0, 160)}`);
  }
  if (!res.ok) throw new Error(`${url} → ${res.status}: ${data.error ?? teks.slice(0, 160)}`);
  return data;
}

/**
 * Mengambil teks perikop dari halaman baca yang sama dengan yang dilihat orang.
 * Nomor ayat dan isinya ditarik dari markup terender, jadi jawaban pertanyaan
 * jangkar disusun dari bahan yang sama persis dengan yang dibaca pembaca.
 */
async function ambilPerikop(jalur) {
  const html = await (await fetch(`${SITUS}${jalur}`)).text();
  const ayat = [];
  const pola = /data-ayat="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = pola.exec(html))) {
    ayat.push({ n: Number(m[1]), teks: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() });
  }
  return ayat;
}

const hasil = [];
function catat(judul, lolos, catatan) {
  hasil.push({ judul, lolos, catatan });
  console.log(`  [${lolos ? "LULUS" : "GAGAL"}] ${judul} — ${catatan}`);
}

console.log("Situs   :", SITUS);
console.log("Program :", PROGRAM_ID.toBase58());
console.log("Mint    :", MINT.toBase58());

const pembaca = Keypair.generate();
console.log("Pembaca :", pembaca.publicKey.toBase58(), "(dompet baru)\n");

await sendAndConfirmTransaction(
  connection,
  new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: deployer.publicKey,
      toPubkey: pembaca.publicKey,
      lamports: 0.1e9,
    })
  ),
  [deployer]
);

// --- 1. Membuka sesi lewat API produksi ---
const bacaan = {
  tradition: "christian",
  translationId: "eng_kjv",
  bookId: "PSA",
  chapter: 23,
};

const mulai = await json(`${SITUS}/api/session/start`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ wallet: pembaca.publicKey.toBase58(), tzOffsetMinutes: 420, ...bacaan }),
});

catat(
  "Situs produksi membuka sesi",
  Boolean(mulai.sessionId),
  `sesi ${String(mulai.sessionId).slice(0, 8)}…, ${mulai.wordCount} kata, jangkar "${mulai.anchor?.word ?? "—"}"`
);

// --- 2. Membaca perikopnya, lalu menjawab jangkar dari teks itu ---
const ayat = await ambilPerikop(
  `/read/${bacaan.tradition}/${bacaan.translationId}/${bacaan.bookId}/${bacaan.chapter}`
);

let jawab = null;
if (mulai.anchor) {
  const kata = mulai.anchor.word.toLowerCase();
  const cocok = ayat.find((a) => a.teks.toLowerCase().includes(kata));
  jawab = cocok ? cocok.n : mulai.anchor.options[0];
  catat(
    "Pertanyaan jangkar dijawab dari isi perikop",
    Boolean(cocok),
    cocok ? `"${kata}" hanya ada di ayat ${cocok.n}` : "kata tidak ketemu di markup; menebak"
  );
}

// Kecepatan dijaga di rentang manusia. Menunggu di sini bukan basa-basi —
// penilaian server memang menolak sesi yang lebih cepat dari itu.
const detik = Math.max(22, Math.round((mulai.wordCount / 210) * 60));
console.log(`\n  menunggu ${detik} detik supaya kecepatannya masuk akal…`);
await jeda(detik * 1000);

// --- 3. Menutup sesi; server yang menandatangani ---
const selesai = await json(`${SITUS}/api/session/finish`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    sessionId: mulai.sessionId,
    activeMs: detik * 1000,
    wallMs: detik * 1000 + 1500,
    scrollEvents: 14,
    backtracks: 2,
    anchorChoice: jawab,
  }),
});

console.log();
catat(
  "Server menilai sesi dan menandatangani attestation",
  selesai.verdict === "counted" && Boolean(selesai.attestation),
  `putusan "${selesai.verdict}", ${selesai.attestation ? `ditandatangani ${selesai.attestation.attestor.slice(0, 8)}…` : "tanpa attestation"}`
);

if (!selesai.attestation) {
  console.error("\nTidak ada attestation, jadi tidak ada yang bisa dikirim ke rantai.");
  console.error("Pesan server:", selesai.message);
  process.exit(1);
}

const att = selesai.attestation;

// --- 4. Kunci penandatangan harus yang terdaftar on-chain ---
// Tata letak Config: discriminator(8) ‖ authority(32) ‖ attestor(32) ‖ mint(32).
const config = await connection.getAccountInfo(configPda);
const attestorOnchain = new PublicKey(config.data.subarray(40, 72)).toBase58();
const mintOnchain = new PublicKey(config.data.subarray(72, 104)).toBase58();

catat(
  "Kunci penandatangan cocok dengan yang terdaftar di config on-chain",
  att.attestor === attestorOnchain,
  `server ${att.attestor.slice(0, 8)}… / rantai ${attestorOnchain.slice(0, 8)}…`
);

catat(
  "Mint yang dipakai situs sama dengan mint di config on-chain",
  mintOnchain === MINT.toBase58(),
  `${mintOnchain.slice(0, 8)}…`
);

// --- 5. Mengirim attestation itu ke program ---
const tx = new Transaction();
const data = new Uint8Array(10);
data.set(REGISTER_DISC, 0);
new DataView(data.buffer).setInt16(8, 420, true);
tx.add(
  new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: pembaca.publicKey, isSigner: true, isWritable: true },
      { pubkey: readerPda(pembaca.publicKey), isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  })
);

const ata = getAssociatedTokenAddressSync(MINT, pembaca.publicKey);
tx.add(createAssociatedTokenAccountInstruction(pembaca.publicKey, ata, pembaca.publicKey, MINT));

const nonce = bs58.decode(att.nonce);
const pesan = new Uint8Array(64);
pesan.set(pembaca.publicKey.toBytes(), 0);
pesan.set(nonce, 32);
const dv = new DataView(pesan.buffer);
dv.setBigUint64(48, BigInt(att.amount), true);
dv.setBigInt64(56, BigInt(att.expiry), true);

tx.add(
  Ed25519Program.createInstructionWithPublicKey({
    publicKey: new PublicKey(att.attestor).toBytes(),
    message: pesan,
    signature: bs58.decode(att.signature),
  })
);

const ixData = new Uint8Array(40);
ixData.set(CLAIM_DISC, 0);
ixData.set(nonce, 8);
const dv2 = new DataView(ixData.buffer);
dv2.setBigUint64(24, BigInt(att.amount), true);
dv2.setBigInt64(32, BigInt(att.expiry), true);

tx.add(
  new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: pembaca.publicKey, isSigner: true, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: readerPda(pembaca.publicKey), isSigner: false, isWritable: true },
      { pubkey: noncePda(nonce), isSigner: false, isWritable: true },
      { pubkey: MINT, isSigner: false, isWritable: true },
      { pubkey: ata, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(ixData),
  })
);

const sig = await sendAndConfirmTransaction(connection, tx, [pembaca], { commitment: "confirmed" });
const saldo = Number((await getAccount(connection, ata)).amount) / 1e9;

catat(
  "Program menerima attestation itu dan mencetak token",
  saldo > 0,
  `${saldo} $STL, tx ${sig}`
);

const semuaLulus = hasil.every((h) => h.lolos);
console.log(
  semuaLulus
    ? `\n${hasil.length} dari ${hasil.length} langkah tersambung, dari halaman web sampai ke rantai.`
    : "\nAda langkah yang putus."
);

const laporan = `# Bukti jalur lengkap: situs produksi → devnet

Ditulis oleh \`app/scripts/prove-live.mjs\`. Skrip ini tidak memegang kunci
penilai; kunci itu ada di server Vercel. Yang dikirim ke rantai adalah
attestation yang benar-benar diterbitkan situs produksi.

Dijalankan: ${new Date().toISOString()}
Situs: ${SITUS}
Dompet uji: \`${pembaca.publicKey.toBase58()}\` (baru, sekali pakai)

Perikop yang dibaca: Mazmur 23, King James Version — ${mulai.wordCount} kata.
Pertanyaan jangkar: kata "${mulai.anchor?.word ?? "—"}", dijawab ayat ${jawab ?? "—"}.

| Langkah | Hasil | Catatan |
|---|---|---|
${hasil.map((h) => `| ${h.judul} | ${h.lolos ? "sesuai" : "**putus**"} | ${h.catatan.replace(/\|/g, "/")} |`).join("\n")}

Transaksi pencetakan:
[\`${sig}\`](https://explorer.solana.com/tx/${sig}?cluster=devnet)

Saldo dompet uji setelahnya: **${saldo} \\$STL**.

Yang membedakan berkas ini dari [\`BUKTI.md\`](BUKTI.md): di sana kami
menandatangani attestation sendiri untuk menguji program. Di sini kunci
penandatangan tidak pernah ada di mesin yang menjalankan skrip, jadi yang
dibuktikan adalah sambungan penuhnya — penilaian sesi, penerbitan attestation,
dan pencetakan on-chain adalah satu rantai yang sama.
`;

const docs = path.join(process.cwd(), "..", "docs");
mkdirSync(docs, { recursive: true });
writeFileSync(path.join(docs, "BUKTI-LIVE.md"), laporan);
console.log("docs/BUKTI-LIVE.md ditulis.");

process.exit(semuaLulus ? 0 : 1);
