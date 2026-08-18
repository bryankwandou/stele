"use client";

import { useCopy } from "@/app/providers";

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

/** Nama putusan mengikuti bahasa pembaca; kunci mentahnya tetap dari server. */
function verdictLabel(c: ReturnType<typeof useCopy>, verdict: string): string {
  const map: Record<string, string> = {
    counted: c.profile.counted,
    too_fast: c.profile.tooFast,
    too_slow: c.profile.tooSlow,
    idle: c.profile.idle,
    anchor_failed: c.profile.anchorFailed,
    rate_limited: c.profile.rateLimited,
    too_soon: c.profile.tooSoon,
  };
  return map[verdict] ?? verdict;
}

export function Profile() {
  const { publicKey } = useWallet();
  const c = useCopy();
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
        if (!res.ok) throw new Error(data.error ?? c.profile.loadFailed);
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
      <p className="rounded-lg border border-rule bg-paper-raised p-6 leading-relaxed text-ink-soft">{c.profile.connectPrompt}</p>
    );
  }

  if (error) {
    return (
      <p className="rounded-md border border-rule bg-accent-soft p-4 text-sm">{error}</p>
    );
  }

  if (!me) return <p className="text-sm text-ink-soft">{c.profile.loading}</p>;

  if (!me.registered) {
    return (
      <p className="rounded-lg border border-rule bg-paper-raised p-6 leading-relaxed text-ink-soft">{c.profile.noRecord}</p>
    );
  }

  return (
    <div className="space-y-10">
      <dl className="grid grid-cols-2 gap-6 border-y border-rule py-6 sm:grid-cols-4">
        <Stat label={c.profile.statStreak} value={`${me.streak} ${c.profile.days}`} />
        <Stat label={c.profile.statBest} value={`${me.best} ${c.profile.days}`} />
        <Stat label={c.profile.statPassages} value={String(me.totalPassages)} />
        <Stat label={c.profile.statToday} value={`${me.countedToday}/${me.dailyCap}`} />
      </dl>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">{c.profile.historyHeading}</h2>
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
                    ? verdictLabel(c, row.verdict)
                    : c.profile.notClosed}
                  {row.signature && (
                    <>
                      {" · "}
                      <a
                        className="underline"
                        href={`https://explorer.solana.com/tx/${row.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.profile.txLink}
                      </a>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">{c.profile.noSessions}</p>
        )}
      </section>

      <p className="text-sm leading-relaxed text-ink-soft">
        {me.counted} {c.profile.countedBefore} {me.attempted}{" "}
        {c.profile.countedAfter} {c.profile.countedNote}
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
