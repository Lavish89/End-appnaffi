// Schluessel-Wert-Speicher mit zwei Backends:
//  - OHNE DATABASE_URL: JSON-Dateien (wie bisher, braucht persistenten Datentraeger).
//  - MIT  DATABASE_URL: Postgres (z. B. kostenloses Neon/Supabase) -> Daten bleiben auch auf Free-Hosting erhalten.
// Die Schnittstelle (sync get/set) bleibt gleich. Postgres wird ueber einen In-Memory-Cache
// + Vorab-Laden abgebildet; Schreibvorgaenge laufen im Hintergrund in die DB.
import fs from 'fs';
import path from 'path';
import type { KV } from './server-community';

// Offene Vorab-Ladevorgaenge – server.ts wartet via kvReady() darauf, bevor es Anfragen bedient.
const pending: Promise<unknown>[] = [];
export async function kvReady(): Promise<void> {
  await Promise.allSettled(pending);
}

export function usingPostgres(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let poolPromise: Promise<any> | null = null;
async function getPool(): Promise<any> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const pg: any = await import('pg');
      const Pool = pg.default?.Pool || pg.Pool;
      const url = String(process.env.DATABASE_URL || '');
      const pool = new Pool({
        connectionString: url,
        ssl: /sslmode=require|neon|supabase|render\.com|amazonaws/i.test(url) ? { rejectUnauthorized: false } : undefined,
        max: 3,
      });
      await pool.query(
        `CREATE TABLE IF NOT EXISTS kv_store (
           namespace text NOT NULL,
           key       text NOT NULL,
           value     jsonb NOT NULL,
           updated_at timestamptz DEFAULT now(),
           PRIMARY KEY (namespace, key)
         )`,
      );
      return pool;
    })();
  }
  return poolPromise;
}

function createFileKV(dir: string): KV {
  fs.mkdirSync(dir, { recursive: true });
  const file = (key: string) => path.join(dir, `${key.replace(/[^a-z0-9-]/gi, '_')}.json`);
  const cache = new Map<string, unknown>();
  return {
    get<T>(key: string, fallback: T): T {
      if (cache.has(key)) return structuredClone(cache.get(key)) as T;
      try {
        const v = JSON.parse(fs.readFileSync(file(key), 'utf8'));
        cache.set(key, v);
        return structuredClone(v) as T;
      } catch {
        return fallback;
      }
    },
    set(key: string, value: unknown) {
      cache.set(key, structuredClone(value));
      fs.writeFileSync(file(key), JSON.stringify(value), { mode: 0o600 });
    },
  };
}

function createPgKV(nsDir: string): KV {
  const namespace = path.basename(nsDir) || 'default';
  const cache = new Map<string, unknown>();

  // Vorab-Laden aller Schluessel dieses Namespaces in den Cache.
  const preload = (async () => {
    const pool = await getPool();
    const res = await pool.query('SELECT key, value FROM kv_store WHERE namespace = $1', [namespace]);
    for (const row of res.rows) cache.set(row.key, row.value);
  })().catch((e: any) => {
    console.error(`[kv] Vorab-Laden fuer "${namespace}" fehlgeschlagen:`, e?.message || e);
  });
  pending.push(preload);

  return {
    get<T>(key: string, fallback: T): T {
      if (cache.has(key)) return structuredClone(cache.get(key)) as T;
      return fallback;
    },
    set(key: string, value: unknown) {
      cache.set(key, structuredClone(value));
      // Hintergrund-Persistenz in Postgres (Fehler werden protokolliert, blockieren die Anfrage nicht).
      getPool()
        .then((pool) =>
          pool.query(
            `INSERT INTO kv_store (namespace, key, value)
             VALUES ($1, $2, $3::jsonb)
             ON CONFLICT (namespace, key)
             DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
            [namespace, key, JSON.stringify(value)],
          ),
        )
        .catch((e: any) => console.error(`[kv] Speichern "${namespace}/${key}" fehlgeschlagen:`, e?.message || e));
    },
  };
}

export function createKV(dir: string): KV {
  return usingPostgres() ? createPgKV(dir) : createFileKV(dir);
}
