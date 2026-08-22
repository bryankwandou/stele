import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Source_Serif_4, Inter, Cinzel } from "next/font/google";

import { Providers } from "./providers";
import { WalletButton } from "@/components/WalletButton";
import { LangToggle } from "@/components/LangToggle";
import { copy, direction } from "@/lib/i18n";
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

/**
 * Huruf pahat.
 *
 * Cinzel digambar dari kapital yang dipahat pada batu Romawi, jadi ia bentuk
 * yang memang sedang dibicarakan halaman ini. Hanya dua ketebalan yang diambil;
 * ia dipakai untuk lambang, kelas kata, dan angka, tidak untuk kalimat panjang,
 * jadi sisa ketebalannya hanya akan menambah berat unduhan tanpa dipakai.
 */
const cut = Cinzel({
  variable: "--font-cut",
  subsets: ["latin"],
  weight: ["400", "600"],
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
    <html
      lang={locale}
      dir={direction(locale)}
      className={`${serif.variable} ${sans.variable} ${cut.variable} h-full`}
    >
      <head>
        {/*
          Menyalakan gerak sebelum halaman pertama kali dilukis.

          Tanpa penanda ini, CSS tidak menyembunyikan apa pun dan seluruh isi
          halaman tampil apa adanya — itu keadaan yang benar bagi pembaca tanpa
          JavaScript, dan bagi siapa pun yang skripnya gagal termuat. Ditaruh di
          kepala dokumen, bukan di komponen, supaya penandanya sudah ada sejak
          lukisan pertama; dipasang belakangan, pembaca akan sempat melihat
          isinya lalu melihatnya menghilang untuk muncul kembali.

          Permintaan gerak yang dikurangi diperiksa di sini juga, bukan hanya di
          CSS, supaya elemennya tidak pernah sempat berada dalam keadaan
          transparan bagi orang yang memintanya.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)" +
              "document.documentElement.setAttribute('data-motion','on')}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <Providers locale={locale}>
          <header className="sticky top-0 z-20 border-b border-rule bg-paper/85 backdrop-blur">
            {/* Dua baris di telepon, satu baris begitu ada tempat.
                Lambang, lima tautan, pengalih bahasa, dan tombol dompet tidak
                muat berdampingan pada lebar telepon; dipaksa muat, semuanya
                menyusut sampai tidak ada yang bisa disentuh dengan tepat.
                Barisan tautannya sendiri bisa digeser mendatar, jadi tautan
                terakhir tetap terjangkau tanpa perlu menu terlipat yang
                menuntut satu ketukan tambahan hanya untuk berpindah halaman. */}
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3 sm:flex-nowrap sm:py-4">
              <Link
                href="/"
                className="cut mr-auto flex shrink-0 items-center gap-2 text-lg sm:mr-0"
              >
                {/* Lambang dimuat sebagai gambar, bukan disisipkan sebagai SVG
                    sebaris, supaya peramban bisa menyinggahkannya sekali dan
                    memakainya ulang di setiap halaman. */}
                <img src="/mark.svg" alt="" width={26} height={26} aria-hidden />
                Stele
              </Link>
              <nav className="order-last -mx-6 flex w-[calc(100%+3rem)] gap-5 overflow-x-auto px-6 text-sm text-ink-soft sm:order-none sm:mx-0 sm:w-auto sm:flex-1 sm:flex-wrap sm:overflow-visible sm:px-0">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="shrink-0 py-1 transition-colors hover:text-ink"
                  >
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

          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14">{children}</main>

          {/* Kaki halaman menempel pada isi, bukan didorong dua puluh langkah ke
              bawahnya. Jarak tetap sebesar itu dulu membuat setiap halaman
              pendek berakhir dengan sepetak kosong yang terbaca sebagai halaman
              yang belum selesai dimuat. `mt-auto` pada wadah kolom mendorongnya
              ke dasar layar hanya ketika isinya memang kurang tinggi. */}
          <footer className="mt-auto border-t border-rule bg-paper-sunk">
            <div className="mx-auto w-full max-w-6xl px-6 py-10 text-sm text-ink-soft">
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
