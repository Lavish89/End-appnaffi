// Mitgliedschaften: Free und Pro (monatlich oder jaehrlich).
// Diese Datei nutzen Server und Oberflaeche gemeinsam – keine Abhaengigkeiten.

export type PlanId = 'free' | 'pro';
export type Interval = 'month' | 'year';
export type PlanStatus = 'active' | 'canceling' | 'past_due' | 'canceled';

export interface BillingSettings {
  priceMonthCents: number;
  priceYearCents: number;
  priceNote: string; // z. B. Hinweis zur Umsatzsteuer
  trialDays: number;
}

export const DEFAULT_BILLING: BillingSettings = {
  priceMonthCents: 990,
  priceYearCents: 9900,
  priceNote: 'Preise in Euro. Jederzeit zum Ende der Laufzeit kündbar.',
  trialDays: 0,
};

export const FREE_LINK_LIMIT = 10;

export type Feature = 'unlimited_links' | 'ai_drafts' | 'custom_rules' | 'pro_recipes' | 'link_check';

export const PLAN_FEATURES: { label: string; free: string | boolean; pro: string | boolean }[] = [
  { label: 'Affiliate-Links mit Kurzlink & Klickzählung', free: `bis ${FREE_LINK_LIMIT}`, pro: 'unbegrenzt' },
  { label: 'Partnerprogramme, Einnahmen, Aufgaben', free: true, pro: true },
  { label: 'Fertige Automationen', free: '5', pro: 'alle 10' },
  { label: 'Eigene Automations-Regeln', free: false, pro: true },
  { label: 'KI-Entwürfe für Posts', free: false, pro: true },
  { label: 'Link-Prüfung (erreichbar?)', free: false, pro: true },
  { label: '150 Marketing-Werkzeuge', free: true, pro: true },
  { label: 'Lernbereich mit 10 Lektionen', free: true, pro: true },
  { label: 'CSV-Export für die Steuer', free: true, pro: true },
];

export const FREE_RECIPES = ['subid', 'social', 'weekly', 'payout', 'top'];

export interface PlanFields {
  role?: 'owner' | 'member';
  plan?: PlanId;
  planStatus?: PlanStatus;
  planInterval?: Interval;
  planRenewsAt?: string; // ISO
  bonusProUntil?: string; // z. B. vom Gluecksrad
}

/** Effektiver Plan: Admins haben immer Pro; gekuendigte Abos laufen bis zum Ende der Laufzeit. */
export function effectivePlan(u: PlanFields | null | undefined, now = Date.now()): PlanId {
  if (!u) return 'free';
  if (u.role === 'owner') return 'pro';
  if (u.bonusProUntil && new Date(u.bonusProUntil).getTime() > now) return 'pro';
  if (u.plan !== 'pro') return 'free';
  if (u.planStatus === 'active' || u.planStatus === 'past_due' || !u.planStatus) return 'pro';
  if (u.planStatus === 'canceling') return !u.planRenewsAt || new Date(u.planRenewsAt).getTime() > now ? 'pro' : 'free';
  return 'free';
}

export const can = (u: PlanFields | null | undefined, _f: Feature) => effectivePlan(u) === 'pro';

export const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

export const yearlySavingPercent = (s: BillingSettings) =>
  s.priceMonthCents > 0 ? Math.max(0, Math.round((1 - s.priceYearCents / (s.priceMonthCents * 12)) * 100)) : 0;
