import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Source_Serif_4, Inter } from "next/font/google";

import { Providers } from "./providers";
import { WalletButton } from "@/components/WalletButton";
import { LangToggle } from "@/components/LangToggle";
import { copy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
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

/** Judul dan keterangan ikut bahasa yang dipilih pembaca. */
export async function generateMetadata(): Promise<Metadata> {
  const c = copy(await getLocale());
  return {
    title: c.meta.title,
    description: c.meta.description,
    icons: { icon: "/mark.svg" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const c = copy(locale);

  const nav = [
    { href: "/read", label: c.nav.read },
    { href: "/leaderboard", label: c.nav.streak },
    { href: "/me", label: c.nav.mine },
    { href: "/how-it-works", label: c.nav.how },
    { href: "/sources", label: c.nav.sources },
  ];

  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Providers locale={locale}>
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
                {nav.map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-ink">
                    {item.label}
                  </Link>
                ))}
              </nav>
              {/* useSearchParams menuntut batas Suspense; tanpa ini seluruh
                  halaman akan jatuh ke render sisi klien. */}
              <Suspense fallback={null}>
                <LangToggle locale={locale} label={c.lang.switchTo} />
              </Suspense>
              <WalletButton />
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>

          <footer className="mt-20 border-t border-rule">
            <div className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-ink-soft">
              <p>{c.footer.devnet}</p>
              <p className="mt-2">
                {c.footer.textsBy}{" "}
                <a className="underline" href="https://bible.helloao.org">
                  AO Lab
                </a>
                ,{" "}
                <a className="underline" href="https://tanzil.net">
                  Tanzil.net
                </a>
                , {c.footer.and}{" "}
                <a className="underline" href="https://suttacentral.net">
                  SuttaCentral
                </a>
                . {c.footer.licenseDetail}{" "}
                <Link className="underline" href="/sources">
                  {c.footer.sourcesPage}
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
