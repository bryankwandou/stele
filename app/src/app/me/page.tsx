import type { Metadata } from "next";

import { Profile } from "@/components/Profile";
import { copy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const c = copy(await getLocale());
  return { title: c.me.metaTitle, description: c.me.metaDescription };
}

export default async function MePage() {
  const c = copy(await getLocale());

  return (
    <div className="max-w-3xl space-y-10">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl">{c.me.title}</h1>
        <p className="leading-relaxed text-ink-soft">{c.me.lede}</p>
      </header>
      <Profile />
    </div>
  );
}
