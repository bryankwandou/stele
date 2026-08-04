"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface Recent {
  passage_id: string;
  verdict: string | null;
  started_at: string;
  signature: string | null;
  amount: string | null;
}

interface Me {
  registered: boolean;
  streak?: number;
  best?: number;
  totalPassages?: number;
  countedToday?: number;
  dailyCap: number;
  counted?: number;
  attempted?: number;
  recent?: Recent[];
}

const VERDICT_LABEL: Record<string, string> = {
  counted: "Tercatat",
  too_fast: "Terlalu cepat",
  too_slow: "Terlalu lambat",
  idle: "Tab ditinggalkan",
  anchor_failed: "Jangkar keliru",
  rate_limited: "Plafon harian",
  too_soon: "Terlalu berdekatan",
};

export function Profile() {
  const { publicKey } = useWallet();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setMe(null);
      return;
    }

    let cancelled = false;
    fetch(`/api/me?wallet=${publicKey.toBase58()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Profil gagal dimuat.");
        return data as Me;
      })
      .then((data) => !cancelled && setMe(data))
      .catch((e) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  if (!publicKey) {
    return (
      <p className="rounded-lg border border-rule bg-paper-raised p-6 leading-relaxed text-ink-soft">
        Sambungkan dompet devnet untuk melihat catatan Anda.
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-md border border-rule bg-accent-soft p-4 text-sm">{error}</p>
    );
  }

  if (!me) return <p className="text-sm text-ink-soft">Memuat…</p>;

  if (!me.registered) {
    return (
      <p className="rounded-lg border border-rule bg-paper-raised p-6 leading-relaxed text-ink-soft">
        Belum ada catatan untuk dompet ini. Bacaan pertama yang tercatat akan
        memulai beruntun Anda.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <dl className="grid grid-cols-2 gap-6 border-y border-rule py-6 sm:grid-cols-4">
        <Stat label="Beruntun" value={`${me.streak} hari`} />
        <Stat label="Terbaik" value={`${me.best} hari`} />
        <Stat label="Perikop" value={String(me.totalPassages)} />
        <Stat label="Hari ini" value={`${me.countedToday}/${me.dailyCap}`} />
      </dl>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Riwayat</h2>
        {me.recent && me.recent.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {me.recent.map((row, i) => (
              <li
                key={`${row.started_at}-${i}`}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule/60 py-2"
              >
                <span className="font-mono text-xs text-ink-soft">
                  {row.passage_id}
                </span>
                <span className="text-ink-soft">
                  {row.verdict
                    ? (VERDICT_LABEL[row.verdict] ?? row.verdict)
                    : "Belum ditutup"}
                  {row.signature && (
                    <>
                      {" · "}
                      <a
                        className="underline"
                        href={`https://explorer.solana.com/tx/${row.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        transaksi
                      </a>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">Belum ada sesi.</p>
        )}
      </section>

      <p className="text-sm leading-relaxed text-ink-soft">
        {me.counted} dari {me.attempted} sesi terhitung. Sesi yang tidak
        terhitung bukan tuduhan — tab yang ditinggalkan dan bacaan yang
        terpotong lebih sering jadi sebabnya.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="mt-1 font-serif text-2xl">{value}</dd>
    </div>
  );
}
