"use client";

import dynamic from "next/dynamic";

/**
 * Tombol dompet dimuat tanpa render sisi server.
 *
 * Adapter membaca `window` saat modul dimuat, jadi merendernya di server akan
 * membuat markup awal berbeda dari markup klien dan hidrasi gagal.
 */
export const WalletButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  {
    ssr: false,
    loading: () => (
      <span className="inline-block h-9 w-32 rounded-md bg-rule" aria-hidden />
    ),
  }
);
