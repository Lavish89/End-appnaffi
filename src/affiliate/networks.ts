// Verzeichnis bekannter Affiliate-Netzwerke im DACH-Raum.
// Bewusst ohne Provisionssaetze: die aendern sich je Programm und muessen im Netzwerk selbst geprueft werden.
export interface Network {
  name: string;
  url: string;
  focus: string;
  tip: string;
}

export const NETWORKS: Network[] = [
  { name: 'Amazon PartnerNet', url: 'https://partnernet.amazon.de', focus: 'Fast alle Produktkategorien', tip: 'Einfacher Einstieg. Pflichthinweis „Als Amazon-Partner verdiene ich …“ und kurze Cookie-Laufzeit beachten.' },
  { name: 'AWIN', url: 'https://www.awin.com/de', focus: 'Große Marken und Händler (Mode, Technik, Reisen)', tip: 'Jedes Programm wird einzeln beantragt – eine fertige Website oder ein Social-Profil hilft bei der Freigabe.' },
  { name: 'Digistore24', url: 'https://www.digistore24.com', focus: 'Digitale Produkte, Kurse, Software', tip: 'Oft hohe Provisionen, aber Produktqualität vor dem Bewerben genau prüfen.' },
  { name: 'ADCELL', url: 'https://www.adcell.de', focus: 'Deutsche Händler und Dienstleister', tip: 'Viele kleinere deutsche Shops, die es woanders nicht gibt.' },
  { name: 'financeAds', url: 'https://www.financeads.net', focus: 'Finanzen, Konten, Versicherungen', tip: 'Strenge Regeln für Werbeaussagen bei Finanzprodukten.' },
  { name: 'belboon', url: 'https://www.belboon.com', focus: 'Shopping, Mode, Lifestyle', tip: 'Gut für Gutschein- und Deal-Seiten.' },
  { name: 'Tradedoubler', url: 'https://www.tradedoubler.com', focus: 'Internationale Marken, Reisen, Telekommunikation', tip: 'Für Seiten mit Reichweite in mehreren Ländern.' },
  { name: 'CJ (Commission Junction)', url: 'https://www.cj.com', focus: 'Internationale Großmarken', tip: 'Eher für fortgeschrittene Publisher mit Traffic.' },
  { name: 'impact.com', url: 'https://impact.com', focus: 'Software, Apps, D2C-Marken', tip: 'Viele SaaS-Programme mit wiederkehrender Provision.' },
  { name: 'Webgains', url: 'https://www.webgains.com', focus: 'Mode, Sport, Gesundheit', tip: 'Passt gut zu Fitness- und Lifestyle-Nischen.' },
  { name: 'eBay Partner Network', url: 'https://partnernetwork.ebay.de', focus: 'Neu- und Gebrauchtware', tip: 'Interessant für Vergleichs- und Sammler-Nischen.' },
  { name: 'Rakuten Advertising', url: 'https://rakutenadvertising.com', focus: 'Internationale Marken', tip: 'Programme sind teils nur für bestimmte Länder offen.' },
];

export const LEGAL_CHECKLIST: { title: string; text: string }[] = [
  { title: 'Werbung kennzeichnen', text: 'Jeder Beitrag mit Affiliate-Link wird als „Anzeige“ oder „Werbung“ gekennzeichnet – deutlich und am Anfang, nicht versteckt in Hashtags (§ 5a UWG).' },
  { title: 'Links markieren', text: 'Affiliate-Links zusätzlich mit * oder einem Hinweis wie „Affiliate-Link“ markieren.' },
  { title: 'Amazon-Hinweis', text: 'Beim Amazon-Partnerprogramm ist der Satz „Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.“ Pflicht.' },
  { title: 'Impressum', text: 'Wer regelmäßig mit Affiliate-Links Geld verdient, braucht auf Website und Profilen ein Impressum (§ 5 DDG).' },
  { title: 'Datenschutz', text: 'Tracking-Links und Cookies in der Datenschutzerklärung nennen; Cookie-Einwilligung beachten.' },
  { title: 'Gewerbe & Steuern', text: 'Regelmäßige Provisionen sind in der Regel gewerbliche Einnahmen: Gewerbe anmelden und Einnahmen in der Steuererklärung angeben. Im Zweifel Steuerberatung fragen.' },
  { title: 'Ehrliche Aussagen', text: 'Nur Erfahrungen versprechen, die du wirklich gemacht hast. Keine erfundenen Tests, Preise oder Knappheit.' },
  { title: 'Programmregeln', text: 'Jedes Partnerprogramm hat eigene Regeln (z. B. keine Markenbegriffe in Google Ads). Vor Kampagnen lesen.' },
];
