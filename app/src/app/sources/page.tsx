import { TRADITIONS } from "@/lib/corpus";

export const metadata = {
  title: "Sumber teks — Stele",
  description: "Dari mana setiap teks diambil, dan di bawah lisensi apa.",
};

export default function SourcesPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-12 px-6 py-16">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl">Sumber teks</h1>
        <p className="leading-relaxed text-ink-soft">
          Stele tidak menyimpan satu pun ayat. Setiap perikop diambil saat
          dibuka dari sumber di bawah ini dan hanya disinggahkan di cache. Kredit
          ikut ditampilkan di kaki setiap halaman bacaan — bukan hanya di sini.
        </p>
      </header>

      <div className="space-y-8">
        {TRADITIONS.map((tradition) => (
          <section key={tradition.id} className="space-y-2 border-t border-rule pt-6">
            <h2 className="font-serif text-2xl">{tradition.name}</h2>
            <p className="leading-relaxed text-ink-soft">{tradition.blurb}</p>
            <p className="text-sm text-ink-soft">
              {tradition.attribution.label} · {tradition.attribution.license}
            </p>
            <a
              className="inline-block text-sm underline"
              href={tradition.attribution.href}
              target="_blank"
              rel="noreferrer"
            >
              {tradition.attribution.href}
            </a>
          </section>
        ))}
      </div>

      <section className="space-y-3 border-t border-rule pt-6">
        <h2 className="font-serif text-2xl">Koreksi</h2>
        <p className="leading-relaxed text-ink-soft">
          Kekeliruan teks berasal dari sumbernya, dan perbaikannya harus terjadi
          di sana agar semua yang memakai sumber itu ikut terkoreksi. Laporkan ke
          proyek yang bersangkutan lewat tautan di atas.
        </p>
      </section>
    </main>
  );
}
