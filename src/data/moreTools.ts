// Weitere Werkzeuge (gleiches Prinzip wie marketingTools.ts). Erweiterbar.
import type { MarketingTool, ToolValues } from './marketingTools';

const num = (v: string | undefined): number => {
  const x = parseFloat((v ?? '').toString().replace(',', '.'));
  return Number.isFinite(x) ? x : 0;
};
const eur = (x: number) => x.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export const MORE_TOOLS: MarketingTool[] = [
  {
    id: 'ltv',
    name: 'Customer Lifetime Value (CLV)',
    description: 'Geschätzter Wert eines Kunden über die gesamte Dauer.',
    category: 'Finanzen',
    fields: [
      { key: 'aov', label: 'Ø Bestellwert (€)', type: 'number', default: 40 },
      { key: 'freq', label: 'Bestellungen pro Jahr', type: 'number', default: 2.5 },
      { key: 'years', label: 'Kundenjahre', type: 'number', default: 2 },
      { key: 'margin', label: 'DB-Marge (%)', type: 'number', default: 45 },
    ],
    run: (v: ToolValues) => {
      const umsatz = num(v.aov) * num(v.freq) * num(v.years);
      const clv = umsatz * (num(v.margin) / 100);
      return `Umsatz/Kunde:  ${eur(umsatz)}\nCLV (Deckungsbeitrag): ${eur(clv)}`;
    },
  },
  {
    id: 'ltv-cac',
    name: 'LTV : CAC Verhältnis',
    description: 'Verhältnis von Kundenwert zu Akquisekosten (Ziel ≥ 3).',
    category: 'Finanzen',
    fields: [
      { key: 'ltv', label: 'CLV (€)', type: 'number', default: 90 },
      { key: 'cac', label: 'Akquisekosten je Kunde (€)', type: 'number', default: 25 },
    ],
    run: (v: ToolValues) => {
      const cac = num(v.cac);
      if (cac <= 0) return 'Bitte CAC > 0 eingeben.';
      const ratio = num(v.ltv) / cac;
      const urteil = ratio >= 3 ? 'gesund ✅' : ratio >= 1 ? 'grenzwertig ⚠️' : 'Verlust ❌';
      return `LTV : CAC = ${ratio.toLocaleString('de-DE', { maximumFractionDigits: 2 })} : 1 (${urteil})\nRichtwert: ab 3:1 skalierbar.`;
    },
  },
  {
    id: 'free-shipping-threshold',
    name: 'Versandkostenfrei-Schwelle',
    description: 'Sinnvolle Grenze für Gratis-Versand aus AOV + Versandkosten.',
    category: 'Conversion & Preise',
    fields: [
      { key: 'aov', label: 'Ø Bestellwert (€)', type: 'number', default: 40 },
      { key: 'ship', label: 'Deine Versandkosten (€)', type: 'number', default: 4.9 },
    ],
    run: (v: ToolValues) => {
      const schwelle = Math.ceil((num(v.aov) * 1.2 + num(v.ship)) / 5) * 5 - 0.1;
      return `Empfohlene Schwelle: ${eur(schwelle)}\nLiegt ~20 % über dem Ø Bestellwert und hebt den Warenkorb.`;
    },
  },
  {
    id: 'subject-check',
    name: 'Betreffzeilen-Check',
    description: 'Prüft E-Mail-Betreff auf Länge und Spam-Risiko.',
    category: 'E-Mail',
    fields: [{ key: 'subject', label: 'Betreffzeile', type: 'text', default: 'Deine Home-Gym-Checkliste ist da' }],
    run: (v: ToolValues) => {
      const s = (v.subject ?? '').trim();
      const len = s.length;
      const spam = (s.match(/gratis|kostenlos|!!!|gewinn|jetzt kaufen/gi) || []).length;
      const lenOk = len >= 20 && len <= 50 ? 'optimal ✅' : 'anpassen ⚠️';
      return `Länge: ${len} Zeichen (${lenOk}, ideal 20–50)\nSpam-Trigger: ${spam} gefunden${spam > 0 ? ' ⚠️' : ' ✅'}`;
    },
  },
  {
    id: 'keyword-density',
    name: 'Keyword-Dichte',
    description: 'Wie oft kommt dein Keyword im Text vor (Ziel ~1–2 %)?',
    category: 'SEO',
    fields: [
      { key: 'keyword', label: 'Keyword', type: 'text', default: 'massagepistole' },
      { key: 'text', label: 'Text', type: 'textarea', placeholder: 'Artikeltext einfügen …' },
    ],
    run: (v: ToolValues) => {
      const kw = (v.keyword ?? '').trim().toLowerCase();
      const words = (v.text ?? '').toLowerCase().match(/[a-zäöüß0-9]+/g) || [];
      if (!kw || words.length === 0) return 'Bitte Keyword und Text eingeben.';
      const hits = words.filter((w) => w === kw).length;
      const dichte = (hits / words.length) * 100;
      const urteil = dichte >= 0.5 && dichte <= 2.5 ? 'gut ✅' : dichte > 2.5 ? 'zu hoch (Stuffing) ⚠️' : 'zu niedrig ⚠️';
      return `Wörter gesamt: ${words.length}\nKeyword-Treffer: ${hits}\nDichte: ${dichte.toLocaleString('de-DE', { maximumFractionDigits: 2 })} % (${urteil})`;
    },
  },
  {
    id: 'influencer-calc',
    name: 'Influencer-Kalkulator',
    description: 'Lohnt sich eine Kooperation? Umsatz vs. Honorar.',
    category: 'Influencer & Creator',
    fields: [
      { key: 'reach', label: 'Reichweite (Views)', type: 'number', default: 20000 },
      { key: 'ctr', label: 'erwartete CTR (%)', type: 'number', default: 1.5 },
      { key: 'cvr', label: 'Conversion-Rate (%)', type: 'number', default: 2 },
      { key: 'aov', label: 'Ø Bestellwert (€)', type: 'number', default: 40 },
      { key: 'fee', label: 'Honorar (€)', type: 'number', default: 250 },
    ],
    run: (v: ToolValues) => {
      const klicks = num(v.reach) * (num(v.ctr) / 100);
      const kaeufe = klicks * (num(v.cvr) / 100);
      const umsatz = kaeufe * num(v.aov);
      const roi = num(v.fee) > 0 ? umsatz / num(v.fee) : 0;
      return [
        `Erwartete Klicks:  ${Math.round(klicks)}`,
        `Erwartete Käufe:   ${kaeufe.toLocaleString('de-DE', { maximumFractionDigits: 1 })}`,
        `Erwarteter Umsatz: ${eur(umsatz)}`,
        `ROI auf Honorar:   ${roi.toLocaleString('de-DE', { maximumFractionDigits: 2 })}x ${roi >= 2 ? '✅' : '⚠️'}`,
      ].join('\n');
    },
  },
];
