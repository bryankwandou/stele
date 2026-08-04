import type { Metadata } from "next";
import Link from "next/link";
import { Source_Serif_4, Inter } from "next/font/google";

import { Providers } from "./providers";
import { WalletButton } from "@/components/WalletButton";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stele — catatan atas bacaan Anda",
  description:
    "Membaca teks suci dari beberapa tradisi, dengan catatan yang tersimpan di Solana devnet.",
  icons: { icon: "/mark.svg" },
};

const NAV = [
  { href: "/read", label: "Baca" },
  { href: "/leaderboard", label: "Beruntun" },
  { href: "/me", label: "Catatan Anda" },
  { href: "/how-it-works", label: "Cara kerja" },
  { href: "/sources", label: "Sumber" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${serif.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Providers>
          <header className="border-b border-rule">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-4">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2 font-serif text-xl tracking-tight"
              >
                {/* Lambang dimuat sebagai gambar, bukan disisipkan sebagai SVG
                    sebaris, supaya peramban bisa menyinggahkannya sekali dan
                    memakainya ulang di setiap halaman. */}
                <img src="/mark.svg" alt="" width={26} height={26} aria-hidden />
                Stele
              </Link>
              <nav className="flex flex-1 flex-wrap gap-5 text-sm text-ink-soft">
                {NAV.map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-ink">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <WalletButton />
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>

          <footer className="mt-20 border-t border-rule">
            <div className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-ink-soft">
              <p>
                Berjalan di Solana devnet. Token yang dicetak di sini tidak punya nilai
                finansial, dan memang tidak dimaksudkan punya.
              </p>
              <p className="mt-2">
                Teks disediakan oleh{" "}
                <a className="underline" href="https://bible.helloao.org">
                  AO Lab
                </a>
                ,{" "}
                <a className="underline" href="https://tanzil.net">
                  Tanzil.net
                </a>
                , dan{" "}
                <a className="underline" href="https://suttacentral.net">
                  SuttaCentral
                </a>
                . Rincian lisensi ada di{" "}
                <Link className="underline" href="/sources">
                  halaman sumber
                </Link>
                .
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
