import path from "node:path";

import type { NextConfig } from "next";

/**
 * Akar ruang kerja ditunjuk secara eksplisit.
 *
 * Ada dua berkas kunci di pohon ini: satu milik aplikasi, satu lagi di akar
 * repositori sebagai penopang bagi Vercel. Ketika keduanya ada, Turbopack
 * menebak sendiri mana yang jadi akar, dan tebakannya jatuh ke berkas di atas —
 * direktori yang tidak memuat satu pun dependensi yang sebenarnya dipakai.
 * Menyebut akarnya di sini menghentikan tebakan itu tanpa perlu membuang
 * penopang yang masih dibutuhkan proses pasang di Vercel.
 */
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
