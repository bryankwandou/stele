import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Ed25519Program,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import bs58 from "bs58";

/**
 * Menyusun transaksi klaim.
 *
 * Instruksi dibangun tangan alih-alih lewat IDL Anchor. Alasannya praktis:
 * bundel klien jadi jauh lebih kecil, dan halaman ini tidak ikut rusak setiap
 * kali tata letak IDL Anchor berubah antar versi mayor.
 *
 * Discriminator adalah delapan byte pertama sha256("global:<nama_instruksi>"),
 * yaitu aturan yang dipakai Anchor. Nilainya tetap selama nama instruksi tidak
 * berubah.
 */

const CLAIM_DISCRIMINATOR = new Uint8Array([62, 198, 214, 193, 213, 159, 108, 210]);
const REGISTER_READER_DISCRIMINATOR = new Uint8Array([18, 205, 217, 132, 232, 232, 65, 85]);

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? "B7iJ9rGP5jPFx3XmWPPAxgvxrv2SvVLRuKNq16iUJWKK"
);

function mintAddress(): PublicKey {
  const value = process.env.NEXT_PUBLIC_MINT;
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_MINT belum diset. Jalankan scripts/init-chain.mjs lebih dulu."
    );
  }
  return new PublicKey(value);
}

export interface Attestation {
  nonce: string;
  amount: string;
  expiry: string;
  signature: string;
  attestor: string;
}

function configPda(): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], PROGRAM_ID)[0];
}

function readerPda(owner: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("reader"), owner.toBuffer()],
    PROGRAM_ID
  )[0];
}

function noncePda(nonce: Uint8Array): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("nonce"), Buffer.from(nonce)],
    PROGRAM_ID
  )[0];
}

function registerReaderIx(owner: PublicKey, tzOffsetMinutes: number) {
  const data = new Uint8Array(10);
  data.set(REGISTER_READER_DISCRIMINATOR, 0);
  new DataView(data.buffer).setInt16(8, tzOffsetMinutes, true);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: readerPda(owner), isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });
}

function claimIx(owner: PublicKey, attestation: Attestation, mint: PublicKey) {
  const nonce = bs58.decode(attestation.nonce);
  const amount = BigInt(attestation.amount);
  const expiry = BigInt(attestation.expiry);

  // discriminator(8) ‖ nonce(16) ‖ amount(8) ‖ expiry(8)
  const data = new Uint8Array(40);
  data.set(CLAIM_DISCRIMINATOR, 0);
  data.set(nonce, 8);
  const view = new DataView(data.buffer);
  view.setBigUint64(24, amount, true);
  view.setBigInt64(32, expiry, true);

  const tokenAccount = getAssociatedTokenAddressSync(mint, owner);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: configPda(), isSigner: false, isWritable: true },
      { pubkey: readerPda(owner), isSigner: false, isWritable: true },
      { pubkey: noncePda(nonce), isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });
}

export async function submitClaim({
  connection,
  wallet,
  signTransaction,
  attestation,
}: {
  connection: Connection;
  wallet: PublicKey;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  attestation: Attestation;
}): Promise<string> {
  const mint = mintAddress();
  const tx = new Transaction();

  // Akun pembaca dan akun token dibuat sekali; sesudahnya instruksi ini
  // dilewati. Memeriksa lebih dulu lebih murah daripada membiarkan transaksi
  // gagal lalu mencoba ulang.
  const readerAccount = await connection.getAccountInfo(readerPda(wallet));
  if (!readerAccount) {
    tx.add(registerReaderIx(wallet, -new Date().getTimezoneOffset()));
  }

  const ata = getAssociatedTokenAddressSync(mint, wallet);
  if (!(await connection.getAccountInfo(ata))) {
    tx.add(createAssociatedTokenAccountInstruction(wallet, ata, wallet, mint));
  }

  // Instruksi Ed25519 harus berada tepat sebelum instruksi klaim. Program
  // membaca instruksi di indeks sebelumnya, jadi urutan ini mengikat.
  tx.add(
    Ed25519Program.createInstructionWithPublicKey({
      publicKey: new PublicKey(attestation.attestor).toBytes(),
      message: buildMessage(wallet, attestation),
      signature: bs58.decode(attestation.signature),
    })
  );
  tx.add(claimIx(wallet, attestation, mint));

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = wallet;

  const signed = await signTransaction(tx);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  return signature;
}

/** Harus sama byte per byte dengan `build_message` di program dan di server. */
function buildMessage(wallet: PublicKey, attestation: Attestation): Uint8Array {
  const msg = new Uint8Array(64);
  msg.set(wallet.toBytes(), 0);
  msg.set(bs58.decode(attestation.nonce), 32);

  const view = new DataView(msg.buffer);
  view.setBigUint64(48, BigInt(attestation.amount), true);
  view.setBigInt64(56, BigInt(attestation.expiry), true);

  return msg;
}

export { ASSOCIATED_TOKEN_PROGRAM_ID };
