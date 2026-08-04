import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { Keypair, PublicKey } from "@solana/web3.js";

/**
 * Attestation server.
 *
 * Server tidak mencetak token. Ia hanya menandatangani pernyataan bahwa sebuah
 * sesi lolos penilaian. Pencetakan tetap dilakukan program on-chain, dan program
 * itu menolak apa pun yang tidak ditandatangani kunci di berkas ini.
 *
 * Pemisahan ini yang membuat sistem masih bertahan bila klien dibongkar total:
 * membongkar kode di browser tidak memberi siapa pun kunci ini.
 */

const ATTESTATION_LEN = 64;

/** Attestation kedaluwarsa cepat. Cukup untuk mengirim transaksi, tidak lebih. */
const TTL_SECONDS = 10 * 60;

let cached: Keypair | null = null;

function loadAttestor(): Keypair {
  if (cached) return cached;

  const fromEnv = process.env.ATTESTOR_SECRET_KEY?.trim();

  if (fromEnv) {
    const bytes = fromEnv.startsWith("[")
      ? Uint8Array.from(JSON.parse(fromEnv))
      : bs58.decode(fromEnv);
    cached = Keypair.fromSecretKey(bytes);
    return cached;
  }

  // Jalur pengembangan lokal: baca keypair dari luar folder app supaya tidak
  // pernah ikut terbundel. Di Vercel jalur ini tidak ada, jadi env wajib diisi.
  const localPath = path.join(process.cwd(), "..", ".keys", "attestor.json");
  try {
    const raw = JSON.parse(readFileSync(localPath, "utf8")) as number[];
    cached = Keypair.fromSecretKey(Uint8Array.from(raw));
    return cached;
  } catch {
    throw new Error(
      "Kunci attestor tidak ditemukan. Isi ATTESTOR_SECRET_KEY, atau sediakan .keys/attestor.json untuk pengembangan lokal."
    );
  }
}

export function attestorPublicKey(): PublicKey {
  return loadAttestor().publicKey;
}

/**
 * Tata letak pesan harus sama persis dengan `build_message` di program Rust.
 * Selisih satu byte saja membuat verifikasi on-chain gagal.
 *
 *   wallet(32) ‖ nonce(16) ‖ amount_le(8) ‖ expiry_le(8)
 */
export function buildMessage(
  wallet: PublicKey,
  nonce: Uint8Array,
  amount: bigint,
  expiry: bigint
): Uint8Array {
  if (nonce.length !== 16) throw new Error("Nonce harus 16 byte.");

  const msg = new Uint8Array(ATTESTATION_LEN);
  msg.set(wallet.toBytes(), 0);
  msg.set(nonce, 32);

  const view = new DataView(msg.buffer);
  view.setBigUint64(48, amount, true);
  view.setBigInt64(56, expiry, true);

  return msg;
}

export interface Attestation {
  nonce: string;
  amount: string;
  expiry: string;
  signature: string;
  attestor: string;
}

export function signAttestation(
  wallet: PublicKey,
  nonce: Uint8Array,
  amount: bigint
): Attestation {
  const keypair = loadAttestor();
  const expiry = BigInt(Math.floor(Date.now() / 1000) + TTL_SECONDS);
  const message = buildMessage(wallet, nonce, amount, expiry);
  const signature = nacl.sign.detached(message, keypair.secretKey);

  return {
    nonce: bs58.encode(nonce),
    amount: amount.toString(),
    expiry: expiry.toString(),
    signature: bs58.encode(signature),
    attestor: keypair.publicKey.toBase58(),
  };
}

/** Besar hadiah. Datar dan kecil — ini tanda terima, bukan upah. */
export function rewardFor(streak: number): bigint {
  // 1 token dasar, ditambah bonus kecil yang berhenti tumbuh di hari ketujuh.
  // Kurva yang mendatar itu disengaja: mengejar angka bukan tujuan produk ini.
  const bonus = Math.min(streak, 7);
  return BigInt((1 + bonus) * 1_000_000_000) / 10n;
}
