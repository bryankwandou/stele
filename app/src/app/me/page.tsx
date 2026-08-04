import { Profile } from "@/components/Profile";

export const metadata = {
  title: "Catatan Anda — Stele",
  description: "Beruntun, perikop yang tercatat, dan transaksi devnet Anda.",
};

export default function MePage() {
  return (
    <main className="mx-auto max-w-2xl space-y-10 px-6 py-16">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl">Catatan Anda</h1>
        <p className="leading-relaxed text-ink-soft">
          Semua yang ada di halaman ini terikat pada alamat dompet Anda, bukan
          pada identitas Anda.
        </p>
      </header>
      <Profile />
    </main>
  );
}
