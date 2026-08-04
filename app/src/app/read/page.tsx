import Link from "next/link";
import { TRADITIONS } from "@/lib/corpus";

export const metadata = { title: "Baca — Stele" };

export default function ReadIndexPage() {
  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <h1 className="font-serif text-3xl">Pilih tradisi</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Ketiganya diambil dari arsip terbuka yang dirawat pihak lain. Stele tidak
          menyunting, menafsirkan, atau menerjemahkan apa pun sendiri.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {TRADITIONS.map((tradition) => (
          <Link
            key={tradition.id}
            href={`/read/${tradition.id}`}
            className="group rounded-lg border border-rule bg-paper-raised p-6 transition-colors hover:border-ink"
          >
            <h2 className="font-serif text-xl">{tradition.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {tradition.blurb}
            </p>
            <p className="mt-4 text-xs text-ink-soft">{tradition.attribution.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
