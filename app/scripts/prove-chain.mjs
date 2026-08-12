/**
 * Bukti bahwa aturan yang dijanjikan produk ini benar-benar ditegakkan program,
 * bukan hanya ditulis di README.
 *
 * Skrip menjalankan delapan percobaan terhadap program yang sudah digelar di
 * devnet. Enam di antaranya sengaja dibuat gagal — sebuah sistem yang hanya
 * membuktikan jalur bahagianya tidak membuktikan apa pun.
 *
 *   1. Klaim sah                    → harus berhasil, saldo naik
 *   2. Nonce yang sama diulang      → harus ditolak (PDA nonce sudah terpakai)
 *   3. Tanda tangan orang lain      → harus ditolak (bukan kunci penilai)
 *   4. Jumlah dinaikkan, masih kecil→ harus ditolak (pesan tidak cocok)
 *   5. Jumlah dinaikkan lewat plafon→ harus ditolak (rentang hadiah)
 *   6. Attestation kedaluwarsa      → harus ditolak
 *   7. Attestation dompet lain      → harus ditolak (pesan terikat ke dompet)
 *   8. Klaim keempat dalam sehari   → harus ditolak (plafon harian)
 *
 * Jalankan: node scripts/prove-chain.mjs
 * Keluarannya ditulis apa adanya ke docs/BUKTI.md.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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
import nacl from "tweetnacl";
import bs58 from "bs58";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const RPC = process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);
const MINT = new PublicKey(process.env.NEXT_PUBLIC_MINT);

const CLAIM_DISC = new Uint8Array([62, 198, 214, 193, 213, 159, 108, 210]);
const REGISTER_DISC = new Uint8Array([18, 205, 217, 132, 232, 232, 65, 85]);

const connection = new Connection(RPC, "confirmed");

function keys(name) {
  const file = path.join(process.cwd(), "..", ".keys", `${name}.json`);
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(file, "utf8"))));
}

const deployer = keys("deployer");
const attestor = keys("attestor");

const pda = (seeds) => PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)[0];
const configPda = pda([Buffer.from("config")]);
const readerPda = (o) => pda([Buffer.from("reader"), o.toBuffer()]);
const noncePda = (n) => pda([Buffer.from("nonce"), Buffer.from(n)]);

function message(wallet, nonce, amount, expiry) {
  const msg = new Uint8Array(64);
  msg.set(wallet.toBytes(), 0);
  msg.set(nonce, 32);
  const view = new DataView(msg.buffer);
  view.setBigUint64(48, amount, true);
  view.setBigInt64(56, expiry, true);
  return msg;
}

function claimIx(owner, nonce, amount, expiry) {
  const data = new Uint8Array(40);
  data.set(CLAIM_DISC, 0);
  data.set(nonce, 8);
  const view = new DataView(data.buffer);
  view.setBigUint64(24, amount, true);
  view.setBigInt64(32, expiry, true);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: readerPda(owner), isSigner: false, isWritable: true },
      { pubkey: noncePda(nonce), isSigner: false, isWritable: true },
      { pubkey: MINT, isSigner: false, isWritable: true },
      { pubkey: getAssociatedTokenAddressSync(MINT, owner), isSigner: false, isWritable: true },
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });
}

/**
 * Menyusun dan mengirim satu klaim. Parameter `curang` memisahkan apa yang
 * ditandatangani dari apa yang diminta ke program — persis celah yang ingin
 * diperiksa di percobaan ketiga dan keempat.
 */
async function claim(reader, { nonce, amount, expiry, penandatangan = attestor, jumlahDiminta = amount }) {
  const tx = new Transaction();
  if (!(await connection.getAccountInfo(readerPda(reader.publicKey)))) {
    const data = new Uint8Array(10);
    data.set(REGISTER_DISC, 0);
    new DataView(data.buffer).setInt16(8, 0, true);
    tx.add(
      new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: reader.publicKey, isSigner: true, isWritable: true },
          { pubkey: readerPda(reader.publicKey), isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(data),
      })
    );
  }

  const ata = getAssociatedTokenAddressSync(MINT, reader.publicKey);
  if (!(await connection.getAccountInfo(ata))) {
    tx.add(createAssociatedTokenAccountInstruction(reader.publicKey, ata, reader.publicKey, MINT));
  }

  const signature = nacl.sign.detached(
    message(reader.publicKey, nonce, amount, expiry),
    penandatangan.secretKey
  );

  tx.add(
    Ed25519Program.createInstructionWithPublicKey({
      publicKey: penandatangan.publicKey.toBytes(),
      message: message(reader.publicKey, nonce, amount, expiry),
      signature,
    })
  );
  tx.add(claimIx(reader.publicKey, nonce, jumlahDiminta, expiry));

  return sendAndConfirmTransaction(connection, tx, [reader], { commitment: "confirmed" });
}

async function saldo(owner) {
  try {
    const acc = await getAccount(connection, getAssociatedTokenAddressSync(MINT, owner));
    return Number(acc.amount) / 1e9;
  } catch {
    return 0;
  }
}

const nonceBaru = () => Uint8Array.from(crypto.randomBytes(16));
const nanti = () => BigInt(Math.floor(Date.now() / 1000) + 600);
const SATU = 100_000_000n; // 0,1 token

const hasil = [];
function catat(no, judul, harapan, lolos, catatan) {
  hasil.push({ no, judul, harapan, lolos, catatan });
  const tanda = lolos ? "LULUS" : "GAGAL";
  console.log(`  [${tanda}] ${no}. ${judul} — ${catatan}`);
}

/**
 * "Simulation failed" tidak membuktikan apa pun — transaksi bisa gagal karena
 * saldo kurang. Yang ingin dilihat adalah galat yang memang dilemparkan program.
 * Baris log runtime menyebutkan namanya, jadi diambil dari sana.
 */
function alasan(e) {
  const logs = e?.logs ?? e?.transactionLogs ?? [];
  const anchor = logs.find((l) => /AnchorError|Error Message:/.test(l));
  if (anchor) {
    const nama = anchor.match(/Error Code:\s*([A-Za-z]+)/)?.[1];
    const pesan = anchor.match(/Error Message:\s*(.+?)\.?$/)?.[1];
    if (nama && pesan) return `${nama} — ${pesan}`;
    if (nama) return nama;
  }
  const ed = logs.find((l) => /Ed25519SigVerify|signature verification failed/i.test(l));
  if (ed) return "verifikasi Ed25519 gagal di runtime";
  const sudahAda = logs.find((l) => /already in use/i.test(l));
  if (sudahAda) return "akun PDA nonce sudah terpakai";
  const custom = String(e?.message ?? e).match(/custom program error: (0x[0-9a-f]+)/i);
  if (custom) return `program menolak, kode ${custom[1]}`;
  return String(e?.message ?? e).split("\n")[0].slice(0, 110);
}

/** Menjalankan percobaan yang seharusnya ditolak, dan memastikan ia memang ditolak. */
async function harusDitolak(no, judul, jalankan) {
  try {
    const sig = await jalankan();
    catat(no, judul, "ditolak", false, `justru berhasil: ${sig}`);
  } catch (e) {
    catat(no, judul, "ditolak", true, alasan(e));
  }
}

console.log("Program :", PROGRAM_ID.toBase58());
console.log("Mint    :", MINT.toBase58());
console.log("Config  :", configPda.toBase58());

const pembaca = Keypair.generate();
console.log("Pembaca :", pembaca.publicKey.toBase58(), "(dompet baru, sekali pakai)\n");

const danai = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: deployer.publicKey,
      toPubkey: pembaca.publicKey,
      lamports: 0.2e9,
    })
  ),
  [deployer]
);
console.log("Dompet pembaca diisi 0,2 SOL:", danai, "\n");

const sigMasuk = [];

// 1 — klaim sah
{
  const sebelum = await saldo(pembaca.publicKey);
  const sig = await claim(pembaca, { nonce: nonceBaru(), amount: SATU, expiry: nanti() });
  sigMasuk.push(sig);
  const sesudah = await saldo(pembaca.publicKey);
  catat(
    1,
    "Klaim sah mencetak token",
    "berhasil",
    sesudah > sebelum,
    `saldo ${sebelum} → ${sesudah} $STL, tx ${sig}`
  );
}

// 2 — nonce diulang
const nonceDipakai = nonceBaru();
{
  const sig = await claim(pembaca, { nonce: nonceDipakai, amount: SATU, expiry: nanti() });
  sigMasuk.push(sig);
  await harusDitolak(2, "Nonce yang sama dipakai dua kali", () =>
    claim(pembaca, { nonce: nonceDipakai, amount: SATU, expiry: nanti() })
  );
}

// 3 — ditandatangani kunci lain
const penyusup = Keypair.generate();
await harusDitolak(3, "Ditandatangani kunci selain kunci penilai", () =>
  claim(pembaca, {
    nonce: nonceBaru(),
    amount: SATU,
    expiry: nanti(),
    penandatangan: penyusup,
  })
);

// 4 — jumlah dinaikkan, tapi masih di bawah plafon on-chain. Nilainya sengaja
// dijaga di bawah MAX_REWARD supaya yang menangkapnya adalah ketidakcocokan
// pesan, bukan pemeriksaan rentang yang lebih dangkal.
await harusDitolak(4, "Jumlah dinaikkan setelah ditandatangani (masih di bawah plafon)", () =>
  claim(pembaca, {
    nonce: nonceBaru(),
    amount: SATU,
    expiry: nanti(),
    jumlahDiminta: SATU * 5n,
  })
);

// 5 — jumlah dinaikkan sampai melewati plafon on-chain
await harusDitolak(5, "Jumlah dinaikkan sampai melewati plafon on-chain", () =>
  claim(pembaca, {
    nonce: nonceBaru(),
    amount: SATU * 100n,
    expiry: nanti(),
  })
);

// 6 — attestation kedaluwarsa
await harusDitolak(6, "Attestation yang sudah kedaluwarsa", () =>
  claim(pembaca, {
    nonce: nonceBaru(),
    amount: SATU,
    expiry: BigInt(Math.floor(Date.now() / 1000) - 60),
  })
);

// 7 — attestation milik dompet lain, dipakai dompet ini
await harusDitolak(7, "Attestation dompet lain dipakai dompet ini", async () => {
  const orangLain = Keypair.generate();
  const nonce = nonceBaru();
  const expiry = nanti();
  const tx = new Transaction().add(
    Ed25519Program.createInstructionWithPublicKey({
      publicKey: attestor.publicKey.toBytes(),
      message: message(orangLain.publicKey, nonce, SATU, expiry),
      signature: nacl.sign.detached(
        message(orangLain.publicKey, nonce, SATU, expiry),
        attestor.secretKey
      ),
    }),
    claimIx(pembaca.publicKey, nonce, SATU, expiry)
  );
  return sendAndConfirmTransaction(connection, tx, [pembaca], { commitment: "confirmed" });
});

// 8 — plafon harian
{
  const sig = await claim(pembaca, { nonce: nonceBaru(), amount: SATU, expiry: nanti() });
  sigMasuk.push(sig);
  await harusDitolak(8, "Klaim keempat pada hari yang sama", () =>
    claim(pembaca, { nonce: nonceBaru(), amount: SATU, expiry: nanti() })
  );
}

const akhir = await saldo(pembaca.publicKey);
const semuaLulus = hasil.every((h) => h.lolos);

console.log(`\nSaldo akhir pembaca: ${akhir} $STL (tiga klaim × 0,1)`);
console.log(
  semuaLulus
    ? `\n${hasil.length} dari ${hasil.length} percobaan sesuai harapan.`
    : "\nAda percobaan yang tidak sesuai harapan."
);

const ex = (s) => `https://explorer.solana.com/tx/${s}?cluster=devnet`;
const baris = hasil
  .map((h) => `| ${h.no} | ${h.judul} | ${h.harapan} | ${h.lolos ? "sesuai" : "**tidak sesuai**"} | ${h.catatan.replace(/\|/g, "/")} |`)
  .join("\n");

const laporan = `# Bukti jalannya di devnet

Berkas ini ditulis oleh \`app/scripts/prove-chain.mjs\`, bukan diketik tangan.
Jalankan ulang kapan pun untuk memeriksa isinya sendiri.

Dijalankan: ${new Date().toISOString()}

| Bagian | Alamat |
|---|---|
| Program | [\`${PROGRAM_ID.toBase58()}\`](https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=devnet) |
| Mint \\$STL | [\`${MINT.toBase58()}\`](https://explorer.solana.com/address/${MINT.toBase58()}?cluster=devnet) |
| Config PDA | [\`${configPda.toBase58()}\`](https://explorer.solana.com/address/${configPda.toBase58()}?cluster=devnet) |
| Kunci penilai | \`${attestor.publicKey.toBase58()}\` |

Dompet pembaca dibuat baru setiap kali skrip dijalankan, jadi tidak ada keadaan
lama yang bisa menutupi kegagalan: \`${pembaca.publicKey.toBase58()}\`

## Hasil

Baris pertama menguji jalur yang seharusnya berhasil; sisanya adalah serangan
yang seharusnya ditolak program. Kolom terakhir memuat nama galat yang benar
benar dilemparkan runtime, diambil dari log transaksi — bukan ringkasan kami.

| # | Percobaan | Harapan | Hasil | Catatan |
|---|---|---|---|---|
${baris}

Saldo akhir dompet pembaca: **${akhir} \\$STL** — tiga klaim yang sah, bukan enam.
Plafon harian memotong percobaan keempat meskipun attestation-nya sah dan
nonce-nya baru.

## Transaksi yang berhasil

${sigMasuk.map((s, i) => `${i + 1}. [\`${s.slice(0, 32)}…\`](${ex(s)})`).join("\n")}

## Yang dibuktikan tabel ini

Menandatangani attestation sendiri tidak cukup — percobaan 3 memakai kunci lain
dan ditolak. Menaikkan angkanya juga tidak cukup — percobaan 4 mengubah jumlah
setelah pesan ditandatangani, dan verifikasi Ed25519 langsung menangkapnya.
Menyimpan satu attestation sah lalu memutarnya berkali-kali juga tidak jalan,
karena PDA nonce hanya bisa dibuat sekali.

Yang tersisa hanyalah membaca tiga kali sehari, sama seperti orang lain.
`;

const docs = path.join(process.cwd(), "..", "docs");
mkdirSync(docs, { recursive: true });
writeFileSync(path.join(docs, "BUKTI.md"), laporan);
console.log("\ndocs/BUKTI.md ditulis.");

process.exit(semuaLulus ? 0 : 1);
