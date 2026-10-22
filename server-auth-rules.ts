// Gemeinsame Pruefregeln fuer die Registrierung (Server und Browser-Testversion).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateRegistration(body: any): { name: string; email: string; password: string } | string {
  const name = String(body?.name ?? '').trim().slice(0, 80);
  const email = String(body?.email ?? '').trim().toLowerCase().slice(0, 160);
  const password = String(body?.password ?? '');
  if (name.length < 2) return 'Bitte gib deinen Namen ein.';
  if (!EMAIL_RE.test(email)) return 'Bitte gib eine gültige E-Mail-Adresse ein.';
  if (password.length < 8) return 'Das Passwort muss mindestens 8 Zeichen haben.';
  if (password.length > 200) return 'Das Passwort ist zu lang.';
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Das Passwort braucht mindestens einen Buchstaben und eine Zahl.';
  if (body?.acceptPrivacy !== true) return 'Bitte bestätige die Datenschutzerklärung.';
  return { name, email, password };
}

// Haupt-Admin: Diese E-Mail bekommt immer volle Rechte (per OWNER_EMAIL aenderbar).
export const DEFAULT_OWNER_EMAIL = 'dragosserbu6@gmail.com';
export const OWNER_EMAILS = ['dragosserbu6@gmail.com', 'serbu763@gmail.com'];

export function isOwner(email: string, ownerEmail?: string): boolean {
  const norm = email.toLowerCase().trim();
  if (OWNER_EMAILS.includes(norm)) return true;
  if (ownerEmail && norm === ownerEmail.toLowerCase().trim()) return true;
  return false;
}

export function roleFor(email: string, ownerEmail: string, isFirstUser: boolean): 'owner' | 'member' {
  if (isOwner(email, ownerEmail)) return 'owner';
  if (ownerEmail) return email.toLowerCase().trim() === ownerEmail.toLowerCase().trim() ? 'owner' : 'member';
  return isFirstUser ? 'owner' : 'member';
}

// Zusaetzliche (freiwillige) Profilangaben bei der Registrierung
export interface Profile {
  firstName?: string;
  lastName?: string;
  country?: string;
  niche?: string;
  mainChannel?: string;
  experience?: string;
  website?: string;
  source?: string;
  newsletter?: boolean;
}
export const COUNTRIES = ['Deutschland', 'Österreich', 'Schweiz', 'Andere EU', 'Andere'];
export const CHANNELS = ['Instagram', 'TikTok', 'YouTube', 'Blog / Website', 'Pinterest', 'Newsletter', 'Facebook', 'Noch keiner'];
export const EXPERIENCE = ['Kompletter Anfänger', 'Erste Erfahrungen', 'Verdiene schon Provisionen', 'Profi'];
export const SOURCES = ['Instagram', 'TikTok', 'YouTube', 'Google', 'Freunde / Empfehlung', 'Sonstiges'];

export function cleanProfile(raw: any): Profile {
  const str = (v: unknown, max = 80) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined) || undefined;
  const pick = (v: unknown, list: string[]) => (typeof v === 'string' && list.includes(v) ? v : undefined);
  let website = str(raw?.website, 200);
  if (website && !/^https?:\/\//i.test(website)) website = website.startsWith('@') ? website : `https://${website}`;
  return {
    firstName: str(raw?.firstName, 60),
    lastName: str(raw?.lastName, 60),
    country: pick(raw?.country, COUNTRIES),
    niche: str(raw?.niche, 80),
    mainChannel: pick(raw?.mainChannel, CHANNELS),
    experience: pick(raw?.experience, EXPERIENCE),
    website,
    source: pick(raw?.source, SOURCES),
    newsletter: raw?.newsletter === true,
  };
}

export const passwordProblem = (pw: string) =>
  pw.length < 8 ? 'Das Passwort muss mindestens 8 Zeichen haben.'
    : pw.length > 200 ? 'Das Passwort ist zu lang.'
    : !/[a-zA-Z]/.test(pw) || !/\d/.test(pw) ? 'Das Passwort braucht mindestens einen Buchstaben und eine Zahl.'
    : '';
