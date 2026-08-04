/**
 * Membuat skema Stele di Neon.
 *
 * Jalankan: node scripts/migrate.mjs
 * Aman diulang — semuanya IF NOT EXISTS.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "node:fs";

// Memuat .env.local tanpa dependensi tambahan.
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL belum diset. Isi di .env.local lebih dulu.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const statements = [
  `CREATE TABLE IF NOT EXISTS readers (
     wallet             text PRIMARY KEY,
     tz_offset_minutes  smallint NOT NULL DEFAULT 0,
     created_at         timestamptz NOT NULL DEFAULT now(),
     streak_current     integer NOT NULL DEFAULT 0,
     streak_best        integer NOT NULL DEFAULT 0,
     last_counted_day   bigint,
     total_passages     integer NOT NULL DEFAULT 0,
     trust_score        smallint NOT NULL DEFAULT 100
   )`,

  `CREATE TABLE IF NOT EXISTS sessions (
     id             uuid PRIMARY KEY,
     wallet         text NOT NULL REFERENCES readers(wallet) ON DELETE CASCADE,
     passage_id     text NOT NULL,
     word_count     integer NOT NULL,
     local_day      bigint,
     started_at     timestamptz NOT NULL DEFAULT now(),
     finished_at    timestamptz,
     active_ms      integer,
     wall_ms        integer,
     scroll_events  integer,
     backtracks     integer,
     anchor_word    text,
     anchor_answer  integer,
     anchor_ok      boolean,
     confidence     smallint,
     verdict        text,
     nonce          text UNIQUE NOT NULL
   )`,

  `CREATE TABLE IF NOT EXISTS claims (
     nonce       text PRIMARY KEY REFERENCES sessions(nonce) ON DELETE CASCADE,
     wallet      text NOT NULL,
     signature   text NOT NULL,
     amount      bigint NOT NULL,
     claimed_at  timestamptz NOT NULL DEFAULT now()
   )`,

  `CREATE INDEX IF NOT EXISTS sessions_wallet_started
     ON sessions (wallet, started_at DESC)`,

  `CREATE INDEX IF NOT EXISTS sessions_counted_day
     ON sessions (wallet, local_day) WHERE verdict = 'counted'`,

  `CREATE INDEX IF NOT EXISTS readers_streak
     ON readers (streak_current DESC) WHERE streak_current > 0`,
];

for (const [i, statement] of statements.entries()) {
  await sql.query(statement);
  console.log(`  [${i + 1}/${statements.length}] ok`);
}

const [{ count }] = await sql`
  SELECT COUNT(*)::int AS count FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name IN ('readers','sessions','claims')
`;

console.log(`\nSkema siap. ${count}/3 tabel ada.`);
