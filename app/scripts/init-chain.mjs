/**
 * Menyiapkan sisi rantai: mencetak mint $STL, memindahkan otoritas cetak ke PDA
 * config, lalu memanggil `initialize`.
 *
 * Jalankan sekali setelah `anchor deploy`:
 *   node scripts/init-chain.mjs
 *
 * Aman diulang — bila config sudah ada, skrip berhenti tanpa mengubah apa pun.
 * Urutannya penting: otoritas cetak harus sudah berpindah sebelum `initialize`
 * dipanggil, karena program memeriksanya lewat `mint::authority = config`.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createMint, setAuthority, AuthorityType } from "@solana/spl-token";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const RPC = process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

const DECIMALS = 9;
const DAILY_CAP = 3;
/** Plafon on-chain, sengaja di atas hadiah terbesar server (0,8 token). */
const MAX_REWARD = 1_000_000_000n;

const INITIALIZE_DISCRIMINATOR = Uint8Array.from([175, 175, 109, 31, 13, 152, 155, 237]);

function loadKeypair(name) {
  const file = path.join(process.cwd(), "..", ".keys", `${name}.json`);
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(file, "utf8")))
  );
}

const connection = new Connection(RPC, "confirmed");
const deployer = loadKeypair("deployer");
const attestor = loadKeypair("attestor");

const [configPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  PROGRAM_ID
);

console.log("Deployer :", deployer.publicKey.toBase58());
console.log("Attestor :", attestor.publicKey.toBase58());
console.log("Config   :", configPda.toBase58());

if (await connection.getAccountInfo(configPda)) {
  console.log("\nConfig sudah ada. Tidak ada yang perlu dikerjakan.");
  process.exit(0);
}

const balance = await connection.getBalance(deployer.publicKey);
console.log("Saldo    :", balance / 1e9, "SOL");
if (balance < 0.05e9) {
  console.error("\nSaldo deployer terlalu kecil. Isi dulu lewat faucet devnet.");
  process.exit(1);
}

// --- 1. Mint ---
console.log("\nMembuat mint…");
const mint = await createMint(
  connection,
  deployer,
  deployer.publicKey, // otoritas cetak sementara; dipindahkan di langkah berikutnya
  null, // tanpa otoritas beku: token ini tanda terima, bukan alat kendali
  DECIMALS
);
console.log("Mint     :", mint.toBase58());

// --- 2. Memindahkan otoritas cetak ke PDA config ---
console.log("Memindahkan otoritas cetak ke config…");
await setAuthority(
  connection,
  deployer,
  mint,
  deployer.publicKey,
  AuthorityType.MintTokens,
  configPda
);

// --- 3. initialize ---
console.log("Memanggil initialize…");
const data = new Uint8Array(8 + 32 + 1 + 8);
data.set(INITIALIZE_DISCRIMINATOR, 0);
data.set(attestor.publicKey.toBytes(), 8);
data[40] = DAILY_CAP;
new DataView(data.buffer).setBigUint64(41, MAX_REWARD, true);

const ix = new TransactionInstruction({
  programId: PROGRAM_ID,
  keys: [
    { pubkey: deployer.publicKey, isSigner: true, isWritable: true },
    { pubkey: configPda, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ],
  data: Buffer.from(data),
});

const signature = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(ix),
  [deployer]
);

console.log("\nSelesai.");
console.log("Transaksi:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
console.log(`\nIsikan ke .env.local dan ke Vercel:\n  NEXT_PUBLIC_MINT=${mint.toBase58()}`);

// Menuliskan langsung supaya tidak ada langkah salin-tempel yang bisa keliru.
const envFile = ".env.local";
if (existsSync(envFile)) {
  const current = readFileSync(envFile, "utf8");
  const next = /^NEXT_PUBLIC_MINT=.*$/m.test(current)
    ? current.replace(/^NEXT_PUBLIC_MINT=.*$/m, `NEXT_PUBLIC_MINT=${mint.toBase58()}`)
    : `${current.trimEnd()}\nNEXT_PUBLIC_MINT=${mint.toBase58()}\n`;
  writeFileSync(envFile, next);
  console.log("\n.env.local sudah diperbarui.");
}
