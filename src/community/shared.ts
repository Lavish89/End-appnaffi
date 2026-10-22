// Gemeinsame Definitionen fuer Community, Jobboerse, Feedback, Benachrichtigungen und Gluecksrad.

export const CHANNELS = [
  { id: 'allgemein', name: 'Allgemein', description: 'Hallo sagen und über alles rund um Affiliate-Marketing reden' },
  { id: 'anfaenger', name: 'Anfänger-Fragen', description: 'Keine Frage ist zu klein' },
  { id: 'erfolge', name: 'Erfolge', description: 'Erste Provision? Teil es!' },
  { id: 'programme', name: 'Partnerprogramme', description: 'Erfahrungen mit Netzwerken und Programmen' },
  { id: 'content', name: 'Content & Feedback', description: 'Posts, Reels und Texte gegenseitig verbessern' },
] as const;
export type ChannelId = typeof CHANNELS[number]['id'];

export const COMMUNITY_RULES = [
  'Freundlich und respektvoll bleiben.',
  'Keine Werbung für eigene Links ohne Bezug zur Frage – Affiliate-Links nur mit Kennzeichnung.',
  'Keine persönlichen Daten anderer teilen.',
  'Keine Versprechen wie „schnell reich werden“.',
  'Beiträge, die gegen die Regeln verstoßen, werden entfernt.',
];

export interface ChatMessage { id: string; channel: string; userId: string; name: string; role: 'owner' | 'member'; text: string; at: string; reports: string[]; deleted?: boolean; hidden?: boolean }

export const JOB_TYPES = ['Kooperation (bezahlt)', 'Produkt gegen Beitrag', 'Affiliate-Partnerschaft', 'UGC-Auftrag', 'Ich suche eine Kooperation'];
export const JOB_PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Pinterest', 'Blog', 'Newsletter', 'Facebook', 'Twitch'];
export interface Job {
  id: string; ownerId: string; ownerName: string; title: string; company: string; type: string; platforms: string[]; niche: string;
  budget: string; minFollowers: number; location: string; description: string; deadline?: string; createdAt: string;
  status: 'open' | 'closed'; reports: string[]; hidden?: boolean; applications?: number;
}
export type ApplicationStatus = 'neu' | 'gesehen' | 'angenommen' | 'abgelehnt';
export interface JobApplication { id: string; jobId: string; jobTitle: string; ownerId: string; userId: string; name: string; email: string; message: string; links: string; followers?: number; at: string; status: ApplicationStatus }

export const FEEDBACK_TYPES = ['Idee', 'Fehler', 'Lob', 'Sonstiges'] as const;
export type FeedbackStatus = 'neu' | 'geplant' | 'erledigt' | 'abgelehnt';
export interface Feedback { id: string; userId: string; name: string; email: string; type: string; rating?: number; text: string; page?: string; at: string; status: FeedbackStatus; reply?: string; replyAt?: string }

export interface Notification { id: string; at: string; type: 'job' | 'application' | 'feedback' | 'community' | 'reward' | 'announcement' | 'system'; text: string; tab?: string; read?: boolean }
export interface Announcement { id: string; at: string; text: string }

// ---------- Gluecksrad ----------
// Einmal am Tag kostenlos drehen, kein Einsatz – nur Punkte, Abzeichen, Tipps und kurze Pro-Zeiten.
export interface WheelSegment { id: string; label: string; weight: number; type: 'points' | 'pro_days' | 'badge' | 'tip'; value: number | string; color: string }
export const WHEEL: WheelSegment[] = [
  { id: 'p10', label: '10 Punkte', weight: 28, type: 'points', value: 10, color: '#334155' },
  { id: 'tip', label: 'Profi-Tipp', weight: 20, type: 'tip', value: 'tip', color: '#0f766e' },
  { id: 'p25', label: '25 Punkte', weight: 20, type: 'points', value: 25, color: '#475569' },
  { id: 'badge', label: 'Abzeichen', weight: 10, type: 'badge', value: 'Glückspilz', color: '#7c3aed' },
  { id: 'p50', label: '50 Punkte', weight: 10, type: 'points', value: 50, color: '#1e40af' },
  { id: 'pro1', label: '1 Tag Pro', weight: 7, type: 'pro_days', value: 1, color: '#b45309' },
  { id: 'p100', label: '100 Punkte', weight: 3, type: 'points', value: 100, color: '#be123c' },
  { id: 'pro3', label: '3 Tage Pro', weight: 2, type: 'pro_days', value: 3, color: '#a16207' },
];
export const WHEEL_TIPS = [
  'Ein Link pro Kanal: So siehst du an den SubIDs, wo deine Verkäufe herkommen.',
  'Ehrliche Nachteile im Beitrag erhöhen oft die Kaufbereitschaft.',
  'Poste dein bestes Video ein zweites Mal nach 4–6 Wochen – neue Follower kennen es noch nicht.',
  'Kommentare in der ersten Stunde beantworten: Das zeigt der Plattform, dass dein Beitrag lebt.',
  'Vergleichsbeiträge („A oder B?“) konvertieren oft besser als Einzeltests.',
  'Trag Provisionen einmal pro Woche ein – sonst verlierst du den Überblick.',
  'Der Verdienst pro Klick zeigt, wo sich mehr Reichweite lohnt.',
  'Verlinke im Blog deine besten Artikel untereinander – das hilft Lesern und Google.',
];
export const BADGES: Record<string, string> = {
  'Glückspilz': '🍀',
  'Erster Beitrag': '💬',
  'Job-Anbieter': '📢',
  'Feedback-Held': '💡',
  'Treue Woche': '🔥',
};
export const level = (points: number) => ({ level: Math.floor(points / 100) + 1, progress: points % 100 });
export interface Rewards { points: number; badges: string[]; lastSpin?: string; streak?: number; history: { at: string; label: string }[] }
