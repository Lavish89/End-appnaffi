// Einfacher Schluessel-Wert-Speicher als JSON-Dateien (fuer Community, Jobs, Feedback, Belohnungen).
// Fuer viele Nutzer spaeter durch eine Datenbank ersetzen – die Schnittstelle bleibt gleich.
import fs from 'fs';
import path from 'path';
import type { KV } from './server-community';

export function createKV(dir: string): KV {
  fs.mkdirSync(dir, { recursive: true });
  const file = (key: string) => path.join(dir, `${key.replace(/[^a-z0-9-]/gi, '_')}.json`);
  const cache = new Map<string, unknown>();
  return {
    get<T>(key: string, fallback: T): T {
      if (cache.has(key)) return structuredClone(cache.get(key)) as T;
      try { const v = JSON.parse(fs.readFileSync(file(key), 'utf8')); cache.set(key, v); return structuredClone(v); } catch { return fallback; }
    },
    set(key: string, value: unknown) {
      cache.set(key, structuredClone(value));
      fs.writeFileSync(file(key), JSON.stringify(value), { mode: 0o600 });
    },
  };
}
