import { NextResponse } from "next/server";

import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";

/**
 * Menyimpan pilihan bahasa lalu mengembalikan pembaca ke halaman asalnya.
 *
 * Tujuan kembali hanya diterima bila berupa lintasan relatif. Menerima URL
 * lengkap akan menjadikan endpoint ini pengalih terbuka, yaitu tautan yang
 * kelihatannya milik situs ini tetapi melempar orang ke tempat lain.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const to = url.searchParams.get("to");
  const next = url.searchParams.get("next") ?? "/";

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const response = NextResponse.redirect(new URL(safeNext, url.origin));

  if (isLocale(to)) {
    response.cookies.set(LOCALE_COOKIE, to, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}
