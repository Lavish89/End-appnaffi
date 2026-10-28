// Marketing-Toolkit – Framework + Kern-Werkzeuge (rekonstruiert, gleiches Prinzip).
// Jedes Tool rechnet NUR mit den Eingaben des Nutzers. run() gibt einen fertigen Text zurück.

export type ToolValues = Record<string, string>;

export interface ToolField {
  key: string;
  label: string;
  type: 'number' | 'text' | 'textarea' | 'select';
  default?: string | number;
  placeholder?: string;
  options?: string[];
}

export interface MarketingTool {
  id: string;
  name: string;
  description: string;
  category: string;
  usesAi?: boolean;
  fields: ToolField[];
  run: (values: ToolValues) => string | Promise<string>;
}

// Hilfsfunktionen
const num = (v: string | undefined): number => {
  const x = parseFloat((v ?? '').toString().replace(',', '.'));
  return Number.isFinite(x) ? x : 0;
};
const eur = (x: number) => x.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const pct = (x: number) => x.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %';

export const MARKETING_TOOLS: MarketingTool[] = [
  {
    id: 'unit-economics',
    name: 'Deckungsbeitrag pro Bestellung',
    description: 'Was bleibt nach Wareneinsatz, Versand und Gebühren übrig?',
    category: 'Kalkulation',
    fields: [
      { key: 'vk', label: 'Verkaufspreis (VK €)', type: 'number', default: 39.9 },
      { key: 'ek', label: 'Einkaufspreis (EK €)', type: 'number', default: 9.5 },
      { key: 'shipping', label: 'Versandkosten (€)', type: 'number', default: 4.9 },
      { key: 'feePct', label: 'Zahlungsgebühr (%)', type: 'number', default: 2.9 },
      { key: 'feeFix', label: 'Zahlungs-Fixgebühr (€)', type: 'number', default: 0.3 },
      { key: 'returnPct', label: 'Retourenquote (%)', type: 'number', default: 5 },
    ],
    run: (v) => {
      const vk = num(v.vk), ek = num(v.ek), ship = num(v.shipping);
      const fee = vk * (num(v.feePct) / 100) + num(v.feeFix);
      const ret = vk * (num(v.returnPct) / 100);
      const db1 = vk - ek - ship;
      const db2 = db1 - fee - ret;
      if (vk <= 0) return 'Bitte einen Verkaufspreis > 0 eingeben.';
      return [
        `Verkaufspreis:        ${eur(vk)}`,
        `- Wareneinsatz:       ${eur(ek)}`,
        `- Versand:            ${eur(ship)}`,
        `= Deckungsbeitrag I:  ${eur(db1)} (${pct((db1 / vk) * 100)})`,
        `- Zahlungsgebühren:   ${eur(fee)}`,
        `- Retouren-Rücklage:  ${eur(ret)}`,
        `= Deckungsbeitrag II: ${eur(db2)} (${pct((db2 / vk) * 100)})`,
      ].join('\n');
    },
  },
  {
    id: 'roas',
    name: 'ROAS-Rechner',
    description: 'Return on Ad Spend aus Umsatz und Werbekosten.',
    category: 'Anzeigen',
    fields: [
      { key: 'revenue', label: 'Umsatz aus Werbung (€)', type: 'number', default: 1200 },
      { key: 'spend', label: 'Werbekosten (€)', type: 'number', default: 400 },
    ],
    run: (v) => {
      const r = num(v.revenue), s = num(v.spend);
      if (s <= 0) return 'Bitte Werbekosten > 0 eingeben.';
      return `ROAS: ${(r / s).toLocaleString('de-DE', { maximumFractionDigits: 2 })}x\nJeder investierte Euro bringt ${eur(r / s)} Umsatz.`;
    },
  },
  {
    id: 'break-even-roas',
    name: 'Break-even-ROAS',
    description: 'Ab welchem ROAS lohnt sich Werbung (ohne Verlust)?',
    category: 'Anzeigen',
    fields: [{ key: 'margin', label: 'Deckungsbeitrags-Marge (%)', type: 'number', default: 45 }],
    run: (v) => {
      const m = num(v.margin);
      if (m <= 0) return 'Bitte eine Marge > 0 % eingeben.';
      return `Break-even-ROAS: ${(100 / m).toLocaleString('de-DE', { maximumFractionDigits: 2 })}x\nErst oberhalb dieses Werts verdienst du mit Werbung Geld.`;
    },
  },
  {
    id: 'cpa',
    name: 'CPA-Rechner (Kosten pro Kauf)',
    description: 'Werbekosten geteilt durch Anzahl Käufe.',
    category: 'Anzeigen',
    fields: [
      { key: 'spend', label: 'Werbekosten (€)', type: 'number', default: 400 },
      { key: 'orders', label: 'Käufe (Anzahl)', type: 'number', default: 20 },
    ],
    run: (v) => {
      const s = num(v.spend), o = num(v.orders);
      if (o <= 0) return 'Bitte Anzahl Käufe > 0 eingeben.';
      return `CPA: ${eur(s / o)} pro Kauf.`;
    },
  },
  {
    id: 'meta-title',
    name: 'Meta-Title-Prüfer',
    description: 'Prüft Länge des SEO-Titels (Ziel: max. 60 Zeichen).',
    category: 'SEO',
    fields: [{ key: 'title', label: 'Meta-Titel', type: 'text', default: 'Massagepistole Pro – schnelle Regeneration | Goalsforce' }],
    run: (v) => {
      const t = (v.title ?? '').trim();
      const len = t.length;
      const status = len === 0 ? 'leer' : len <= 60 ? 'optimal ✅' : 'zu lang ⚠️';
      return `Länge: ${len} Zeichen (${status})\nEmpfehlung: 50–60 Zeichen. Pixelgrenze bei Google ~ 600 px.`;
    },
  },
  {
    id: 'utm',
    name: 'UTM-Link-Builder',
    description: 'Baut einen sauberen Tracking-Link mit UTM-Parametern.',
    category: 'Tracking & Planung',
    fields: [
      { key: 'url', label: 'Ziel-URL', type: 'text', default: 'https://goalsforce.store' },
      { key: 'source', label: 'utm_source', type: 'text', default: 'pinterest' },
      { key: 'medium', label: 'utm_medium', type: 'text', default: 'organic' },
      { key: 'campaign', label: 'utm_campaign', type: 'text', default: 'home-gym-guide' },
    ],
    run: (v) => {
      const base = (v.url ?? '').trim();
      if (!/^https?:\/\//i.test(base)) return 'Bitte eine gültige URL mit http(s):// eingeben.';
      const p = new URLSearchParams();
      if (v.source) p.set('utm_source', v.source.trim());
      if (v.medium) p.set('utm_medium', v.medium.trim());
      if (v.campaign) p.set('utm_campaign', v.campaign.trim());
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${p.toString() ? sep + p.toString() : ''}`;
    },
  },
  {
    id: 'hooks',
    name: 'Video-Hook-Generator',
    description: 'Liefert 5 Hook-Ideen für kurze Videos (ohne KI, nur Vorlagen).',
    category: 'Content & Social',
    fields: [
      { key: 'product', label: 'Produkt / Thema', type: 'text', default: 'Massagepistole' },
      { key: 'audience', label: 'Zielgruppe', type: 'text', default: 'Sportler mit Verspannungen' },
    ],
    run: (v) => {
      const p = (v.product ?? 'Produkt').trim();
      const a = (v.audience ?? 'deine Zielgruppe').trim();
      return [
        `1. „${a}? Diesen Fehler machst du jeden Tag – und ${p} löst ihn."`,
        `2. „Ich hab 30 Tage ${p} getestet. Das ist passiert:"`,
        `3. „Stopp – kauf KEINE ${p}, bevor du das gesehen hast."`,
        `4. „3 Gründe, warum ${a} ${p} brauchen."`,
        `5. „${p} unter 70 € – lohnt sich das wirklich?"`,
        '',
        'Tipp: Hook in den ersten 2 Sekunden zeigen, Text-Overlay nutzen, als Werbung kennzeichnen.',
      ].join('\n');
    },
  },
  {
    id: 'hashtags',
    name: 'Hashtag-Set',
    description: 'Erzeugt ein aufgeräumtes Hashtag-Set aus Stichwörtern.',
    category: 'Content & Social',
    fields: [{ key: 'keywords', label: 'Stichwörter (Komma-getrennt)', type: 'text', default: 'home gym, regeneration, faszien' }],
    run: (v) => {
      const tags = (v.keywords ?? '')
        .split(',')
        .map((k) => k.trim().toLowerCase().replace(/[^a-z0-9äöüß ]/g, '').replace(/\s+/g, ''))
        .filter(Boolean)
        .map((k) => '#' + k);
      if (tags.length === 0) return 'Bitte mindestens ein Stichwort eingeben.';
      return [...new Set([...tags, '#anzeige'])].join(' ');
    },
  },
];
