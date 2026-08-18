"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

import { DEFAULT_LOCALE, copy, type Copy, type Locale } from "@/lib/i18n";

import "@solana/wallet-adapter-react-ui/styles.css";

const RPC = process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";

/**
 * Bahasa ditentukan di server lalu diturunkan lewat konteks.
 *
 * Komponen klien tidak bisa membaca kuki saat render pertama tanpa membuat
 * teksnya berkedip berganti bahasa, jadi nilainya dititipkan sekali dari
 * kerangka halaman dan tidak berubah lagi selama halaman itu hidup.
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Salinan teks untuk bahasa yang sedang berlaku. */
export function useCopy(): Copy {
  return copy(useContext(LocaleContext));
}

export function Providers({
  children,
  locale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  // Adapter dibuat sekali. Membuat ulang tiap render akan memutus koneksi dompet
  // setiap kali komponen induk berubah.
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <LocaleContext.Provider value={locale}>
      <ConnectionProvider endpoint={RPC}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </LocaleContext.Provider>
  );
}
