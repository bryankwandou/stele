"use client";

import { licenseCopy } from "@/lib/i18n";
import { useCopy } from "@/app/providers";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { Passage } from "@/lib/corpus";
import { submitClaim, type Attestation } from "@/lib/claim";
import { ReadingProgress } from "./ReadingProgress";

/**
 * Pembaca.
 *
 * Yang direkam hanya bentuk perhatian: berapa lama tab benar-benar terlihat,
 * berapa kali digulir, berapa kali pembaca kembali ke atas. Tidak ada perekaman
 * kursor, tidak ada rekaman sesi, tidak ada isi bacaan yang dikirim ke mana pun.
 * Pada aplikasi bertema keagamaan, pelacakan berlebih akan menghabiskan
 * kepercayaan lebih cepat daripada manfaat yang didapat.
 */

type Phase = "reading" | "anchor" | "verdict" | "claiming" | "done";

interface StartResponse {
  sessionId: string;
  wordCount: number;
  anchor: { word: string; options: number[] } | null;
  countedToday: number;
  dailyCap: number;
}

interface FinishResponse {
  verdict: string;
  message: string;
  streak?: number;
  claimDelayMs?: number;
  attestation: Attestation | null;
}

export function Reader({ passage }: { passage: Passage }) {
  const { publicKey, signTransaction } = useWallet();
  const c = useCopy();
  const { connection } = useConnection();

  const [session, setSession] = useState<StartResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("reading");
  const [result, setResult] = useState<FinishResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [signature, setSignature] = useState<string | null>(null);

  // Sinyal perhatian disimpan di ref, bukan state: memperbaruinya puluhan kali
  // per detik lewat state akan memicu render ulang terus-menerus.
  const activeMs = useRef(0);
  const startedAt = useRef(Date.now());
  const scrollEvents = useRef(0);
  const backtracks = useRef(0);
  const lastScrollY = useRef(0);

  const [elapsed, setElapsed] = useState(0);

  // --- Membuka sesi setelah dompet tersambung ---
  useEffect(() => {
    if (!publicKey || session) return;

    let cancelled = false;
    fetch("/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: publicKey.toBase58(),
        tradition: passage.traditionId,
        translationId: passage.translationId,
        bookId: passage.bookId,
        chapter: passage.chapter,
        tzOffsetMinutes: -new Date().getTimezoneOffset(),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? c.reader.sessionOpenFailed);
        return data as StartResponse;
      })
      .then((data) => {
        if (cancelled) return;
        setSession(data);
        startedAt.current = Date.now();
      })
      .catch((e) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [publicKey, session, passage]);

  // --- Menghitung waktu yang benar-benar terlihat ---
  useEffect(() => {
    if (phase !== "reading" || !session) return;

    const tick = setInterval(() => {
      if (document.visibilityState === "visible") {
        activeMs.current += 1000;
        setElapsed(activeMs.current);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [phase, session]);

  // --- Merekam bentuk gulir ---
  useEffect(() => {
    if (phase !== "reading") return;

    function onScroll() {
      scrollEvents.current += 1;
      // Kembali ke atas adalah tanda membaca ulang. Ketiadaannya sama sekali
      // pada sesi panjang justru yang mencurigakan, bukan sebaliknya.
      if (window.scrollY < lastScrollY.current - 40) backtracks.current += 1;
      lastScrollY.current = window.scrollY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  // --- Hitung mundur sebelum klaim boleh dikirim ---
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => Math.max(0, c - 1000)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const finish = useCallback(async () => {
    if (!session) return;
    setError(null);

    try {
      const res = await fetch("/api/session/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          activeMs: activeMs.current,
          wallMs: Date.now() - startedAt.current,
          scrollEvents: scrollEvents.current,
          backtracks: backtracks.current,
          anchorChoice: choice,
        }),
      });

      const data = (await res.json()) as FinishResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? c.reader.sessionCloseFailed);

      setResult(data);
      setPhase("verdict");
      if (data.attestation) setCountdown(data.claimDelayMs ?? 60_000);
    } catch (e) {
      setError(e instanceof Error ? e.message : c.reader.generalError);
    }
  }, [session, choice]);

  async function claim() {
    if (!result?.attestation || !publicKey || !signTransaction) return;
    setPhase("claiming");
    setError(null);

    try {
      const sig = await submitClaim({
        connection,
        wallet: publicKey,
        signTransaction,
        attestation: result.attestation,
      });
      setSignature(sig);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : c.reader.txFailed);
      setPhase("verdict");
    }
  }

  const minutes = Math.floor(elapsed / 60_000);
  const seconds = Math.floor((elapsed % 60_000) / 1000);

  return (
    <div className="space-y-10">
      <header className="max-w-2xl border-b border-rule pb-6">
        <p className="eyebrow">{passage.translationName}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          {passage.bookName}
          {passage.traditionId === "christian" && ` ${passage.chapter}`}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {passage.verses.length} {c.reader.verses} · {passage.wordCount} {c.reader.words}
          {session && (
            <>
              {" · "}
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} {c.reader.readSuffix}
            </>
          )}
        </p>
      </header>

      {!publicKey && (
        <p className="max-w-lg rounded-lg border border-rule bg-paper-raised p-5 text-sm leading-relaxed text-ink-soft">{c.reader.noWallet}</p>
      )}

      <ReadingProgress />

      <article className="passage space-y-4" dir={passage.direction}>
        {passage.verses.map((verse) => (
          // `data-ayat` membuat tiap ayat bisa dirujuk dari luar — dipakai
          // tautan ke ayat tertentu dan oleh skrip bukti di scripts/.
          <p key={verse.n} id={`ayat-${verse.n}`} data-ayat={verse.n}>
            <span className="verse-number">{verse.n}</span>
            {verse.text}
          </p>
        ))}
      </article>

      <footer className="max-w-2xl space-y-4 border-t border-rule pt-6 text-sm text-ink-soft">
        <p>
          {passage.attribution.label} · {licenseCopy(c, passage.traditionId)}{" "}
          <a className="underline" href={passage.attribution.href}>
            {c.reader.sourceLink}
          </a>
        </p>
      </footer>

      {error && (
        <p className="max-w-lg rounded-md border border-rule bg-accent-soft p-4 text-sm">
          {error}
        </p>
      )}

      {session && phase === "reading" && (
        <div className="max-w-lg space-y-4 rounded-lg border border-rule bg-paper-raised p-6">
          <p className="text-sm text-ink-soft">
            {c.reader.recordedTodayBefore} {session.countedToday} {c.reader.recordedTodayMiddle}{" "}
            {session.dailyCap} {c.reader.recordedTodayAfter}
          </p>
          <button
            onClick={() => setPhase(session.anchor ? "anchor" : "verdict")}
            className="rounded-md bg-ink px-5 py-2.5 text-sm text-paper hover:opacity-90"
          >
            {c.reader.doneReading}
          </button>
        </div>
      )}

      {session?.anchor && phase === "anchor" && (
        <div className="max-w-lg space-y-4 rounded-lg border border-rule bg-paper-raised p-6">
          <p className="leading-relaxed">
            {c.reader.anchorQuestionBefore}{" "}
            <span className="font-serif italic">{session.anchor.word}</span>?
          </p>
          <p className="text-sm text-ink-soft">{c.reader.anchorNote}</p>
          <div className="flex flex-wrap gap-2">
            {session.anchor.options.map((option) => (
              <button
                key={option}
                onClick={() => setChoice(option)}
                className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                  choice === option ? "border-ink bg-accent-soft" : "border-rule"
                }`}
              >
                {c.reader.verseOption} {option}
              </button>
            ))}
          </div>
          <button
            onClick={finish}
            disabled={choice === null}
            className="rounded-md bg-ink px-5 py-2.5 text-sm text-paper hover:opacity-90 disabled:opacity-40"
          >
            {c.reader.submit}
          </button>
        </div>
      )}

      {phase === "verdict" && !result && (
        <div className="max-w-lg rounded-lg border border-rule bg-paper-raised p-6">
          <button
            onClick={finish}
            className="rounded-md bg-ink px-5 py-2.5 text-sm text-paper hover:opacity-90"
          >
            {c.reader.recordThis}
          </button>
        </div>
      )}

      {result && phase !== "done" && (
        <div className="max-w-lg space-y-4 rounded-lg border border-rule bg-paper-raised p-6">
          <p className="leading-relaxed">{result.message}</p>
          {result.streak != null && (
            <p className="text-sm text-ink-soft">
              {c.reader.streakLabel} {result.streak} {c.reader.days}.
            </p>
          )}
          {result.attestation && (
            <button
              onClick={claim}
              disabled={countdown > 0 || phase === "claiming"}
              className="rounded-md bg-ink px-5 py-2.5 text-sm text-paper hover:opacity-90 disabled:opacity-40"
            >
              {phase === "claiming"
                ? c.reader.sending
                : countdown > 0
                  ? `${c.reader.record} (${Math.ceil(countdown / 1000)} ${c.reader.seconds})`
                  : c.reader.record}
            </button>
          )}
        </div>
      )}

      {phase === "done" && signature && (
        <div className="max-w-lg space-y-3 rounded-lg border border-rule bg-paper-raised p-6">
          <p className="leading-relaxed">{c.reader.recordedOnDevnet}</p>
          <a
            className="text-sm underline"
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
          >
            {c.reader.viewTx}
          </a>
        </div>
      )}
    </div>
  );
}
