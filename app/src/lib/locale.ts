import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./i18n";

/**
 * Bahasa yang berlaku untuk permintaan ini.
 *
 * Hanya dipanggil dari komponen server. Membaca kuki membuat halaman dirender
 * per permintaan, tetapi data korpusnya sendiri tetap disinggahkan satu jam di
 * lapisan fetch, jadi yang dikerjakan ulang hanyalah menyusun HTML.
 */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
