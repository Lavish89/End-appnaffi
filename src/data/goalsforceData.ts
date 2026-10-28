// Goalsforce Business-Hub Daten (rekonstruiert, gleiches Prinzip).
// Demo-/Planungsdaten für die interne App. Thema: Home-Gym, Regeneration, Tagesrhythmus.
import acupressurePillow from '../assets/images/goalsforce_acupressure_pillow_1792640798118.jpg';
import massageGun from '../assets/images/goalsforce_massage_gun_1792640783068.jpg';
import mobilityMat from '../assets/images/goalsforce_mobility_mat_1792640754588.jpg';
import resistanceBands from '../assets/images/goalsforce_resistance_bands_1792640768768.jpg';
import lumbarCushion from '../assets/images/product_lumbar_support_cushion_1792635476185.jpg';
import waterBottle from '../assets/images/product_titanium_water_bottle_1792635476550.jpg';

export interface GpsrInfo {
  euResponsible: string;
  productIdentifier: string;
}

export interface GoalsforceProduct {
  id: string;
  title: string;
  image: string;
  usp: string;
  dayTime: 'Morgen' | 'Tag' | 'Abend';
  warehouse: string;
  channelDecision: string;
  sellingPrice: number;
  netSellingPrice: number;
  totalCost: number;
  minSellingPrice: number;
  contributionMarginNet: number;
  contributionMarginPercent: number;
  gpsr: GpsrInfo;
}

const mkMargin = (net: number, cost: number) => Number((net - cost).toFixed(2));

export const GOALSFORCE_PRODUCTS: GoalsforceProduct[] = [
  {
    id: 'gf-01',
    title: 'Tageslicht-Wecker mit Sonnenaufgang',
    image: waterBottle,
    usp: 'Sanftes Aufwachen ohne Cortisol-Schock',
    dayTime: 'Morgen',
    warehouse: 'EU-Lager (DE)',
    channelDecision: 'Shop-Verkauf (Dropshipping)',
    sellingPrice: 59.9,
    netSellingPrice: 50.34,
    totalCost: 18.5,
    minSellingPrice: 46.25,
    contributionMarginNet: mkMargin(50.34, 18.5),
    contributionMarginPercent: 63,
    gpsr: { euResponsible: 'Goalsforce (DE)', productIdentifier: 'GF-01 / EAN 4260000001001' },
  },
  {
    id: 'gf-02',
    title: 'Widerstandsbänder-Set (5 Stärken)',
    image: resistanceBands,
    usp: 'Ganzkörper-Workout für den Start in den Tag',
    dayTime: 'Morgen',
    warehouse: 'EU-Lager (NL)',
    channelDecision: 'Shop-Verkauf (Dropshipping)',
    sellingPrice: 24.0,
    netSellingPrice: 20.17,
    totalCost: 6.2,
    minSellingPrice: 15.5,
    contributionMarginNet: mkMargin(20.17, 6.2),
    contributionMarginPercent: 69,
    gpsr: { euResponsible: 'Goalsforce (DE)', productIdentifier: 'GF-02 / EAN 4260000001018' },
  },
  {
    id: 'gf-03',
    title: 'Lordosenstütze fürs Homeoffice',
    image: lumbarCushion,
    usp: 'Rückenschonend sitzen über den ganzen Tag',
    dayTime: 'Tag',
    warehouse: 'EU-Lager (DE)',
    channelDecision: 'Shop-Verkauf (Dropshipping)',
    sellingPrice: 34.9,
    netSellingPrice: 29.33,
    totalCost: 8.9,
    minSellingPrice: 22.25,
    contributionMarginNet: mkMargin(29.33, 8.9),
    contributionMarginPercent: 70,
    gpsr: { euResponsible: 'Goalsforce (DE)', productIdentifier: 'GF-03 / EAN 4260000001025' },
  },
  {
    id: 'gf-04',
    title: 'Premium Mobility-Matte (6 mm)',
    image: mobilityMat,
    usp: 'Mittagspause für Mobility & Dehnung',
    dayTime: 'Tag',
    warehouse: 'EU-Lager (PT)',
    channelDecision: 'Affiliate-Empfehlung',
    sellingPrice: 44.0,
    netSellingPrice: 36.97,
    totalCost: 11.5,
    minSellingPrice: 28.75,
    contributionMarginNet: mkMargin(36.97, 11.5),
    contributionMarginPercent: 69,
    gpsr: { euResponsible: 'Lieferant (EU-RP)', productIdentifier: 'GF-04 / EAN 4260000001032' },
  },
  {
    id: 'gf-05',
    title: 'Massagepistole Pro (6 Aufsätze)',
    image: massageGun,
    usp: 'Abendliche Regeneration & Entspannung',
    dayTime: 'Abend',
    warehouse: 'EU-Lager (DE)',
    channelDecision: 'Shop-Verkauf (Dropshipping)',
    sellingPrice: 69.0,
    netSellingPrice: 57.98,
    totalCost: 19.0,
    minSellingPrice: 47.5,
    contributionMarginNet: mkMargin(57.98, 19.0),
    contributionMarginPercent: 67,
    gpsr: { euResponsible: 'Goalsforce (DE)', productIdentifier: 'GF-05 / EAN 4260000001049' },
  },
  {
    id: 'gf-06',
    title: 'Akupressur-Set (Matte & Kissen)',
    image: acupressurePillow,
    usp: 'Herunterfahren vor dem Schlafengehen',
    dayTime: 'Abend',
    warehouse: 'EU-Lager (NL)',
    channelDecision: 'Shop-Verkauf (Dropshipping)',
    sellingPrice: 39.9,
    netSellingPrice: 33.53,
    totalCost: 9.5,
    minSellingPrice: 23.75,
    contributionMarginNet: mkMargin(33.53, 9.5),
    contributionMarginPercent: 72,
    gpsr: { euResponsible: 'Goalsforce (DE)', productIdentifier: 'GF-06 / EAN 4260000001056' },
  },
];

export interface ConnectedTool {
  badge: string;
  name: string;
  domain: string;
  details: string;
}

export const CONNECTED_TOOLS_STATUS: ConnectedTool[] = [
  { badge: 'SHOP', name: 'Shopify Store', domain: 'goalsforce.store', details: 'Produkte, Bestellungen und Themes (Staging-Workflow aktiv).' },
  { badge: 'SOCIAL', name: 'Metricool', domain: 'metricool.com', details: 'Planung & Posting für Instagram, TikTok, Pinterest, Bluesky, YouTube.' },
  { badge: 'MAIL', name: 'Brevo', domain: 'brevo.com', details: 'Newsletter & automatische E-Mail-Flows (Double-Opt-in).' },
  { badge: 'KI', name: 'Gemini API', domain: 'ai.google.dev', details: 'Text- & Planungs-Assistenz (serverseitig, Rate-Limit aktiv).' },
  { badge: 'AFFILIATE', name: 'UpPromote', domain: 'uppromote.com', details: 'Creator-Partnerprogramm mit Rabattcode-Tracking.' },
];

export interface DecisionChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  agentRecommendation: string;
  status: string;
  actionRequired: string;
}

export const INITIAL_AUDIT_DECISION_CHECKLIST: DecisionChecklistItem[] = [
  {
    id: 'dec-01',
    category: 'Recht',
    title: 'USt-IdNr. & Impressum vervollständigen',
    description: 'Shop-Impressum enthält noch Platzhalter; USt-IdNr. muss eingetragen werden.',
    agentRecommendation: 'Nach Erhalt der USt-IdNr. ins Impressum eintragen, Rechtstexte auf Deutsch finalisieren.',
    status: 'Offen',
    actionRequired: 'Deine Freigabe',
  },
  {
    id: 'dec-02',
    category: 'Finanzen',
    title: 'Kleinunternehmer ja/nein',
    description: 'Entscheidung beeinflusst Preise, Vorsteuerabzug und Rechnungen.',
    agentRecommendation: 'Für Dropshipping mit EU-Einkauf eher Regelbesteuerung – final mit Steuerberater klären.',
    status: 'Offen',
    actionRequired: 'Deine Entscheidung',
  },
  {
    id: 'dec-03',
    category: 'Zahlung',
    title: 'Shopify Payments aktivieren',
    description: 'Voraussetzung für echte Zahlungen im Shop (Karte, Klarna, PayPal …).',
    agentRecommendation: 'Nach USt-IdNr. aktivieren und Zahlungsarten freischalten.',
    status: 'Wartet',
    actionRequired: 'Deine Freigabe',
  },
];

export interface VideoScriptLine {
  scene: string;
  text: string;
}
export interface ShotlistItem {
  shot: string;
  detail: string;
}
export interface CapcutPlan {
  clipOrder: string;
  textOverlays: string;
  musicStyle: string;
  cuts: string;
}
export interface VideoPackage {
  id: string;
  title: string;
  targetProduct: string;
  concept: { platform: string; length: string };
  hooks: string[];
  script: VideoScriptLine[];
  shotlist15Min: ShotlistItem[];
  capcutPlan: CapcutPlan;
  subtitles: string;
  captionAndHashtags: string;
  thumbnailIdea: string;
}

export const THREE_VIDEO_PACKAGES: VideoPackage[] = [
  {
    id: 'vid-01',
    title: 'Massagepistole – 3 Fehler nach dem Training',
    targetProduct: 'Massagepistole Pro',
    concept: { platform: 'TikTok / Reels', length: '20–30 Sek.' },
    hooks: [
      '„Du massierst falsch – mach das stattdessen."',
      '„3 Fehler, die deine Regeneration ruinieren."',
      '„Verspannter Nacken? 20 Sekunden und weg."',
    ],
    script: [
      { scene: '0–2 Sek', text: 'Hook direkt in die Kamera, Massagepistole ins Bild.' },
      { scene: '2–10 Sek', text: 'Fehler zeigen, dann richtige Anwendung am Nacken demonstrieren.' },
      { scene: '10–20 Sek', text: 'Vorher/Nachher-Gefühl erklären, Aufsätze kurz zeigen.' },
      { scene: '20–25 Sek', text: 'CTA: „Link in Bio für mehr Regeneration." (als Werbung kennzeichnen)' },
    ],
    shotlist15Min: [
      { shot: 'Shot 1', detail: 'Talking-Head, Hook' },
      { shot: 'Shot 2', detail: 'Close-up Gerät' },
      { shot: 'Shot 3', detail: 'Anwendung Nacken' },
      { shot: 'Shot 4', detail: 'Aufsätze wechseln' },
      { shot: 'Shot 5', detail: 'CTA-Einstellung' },
    ],
    capcutPlan: {
      clipOrder: 'Hook → Problem → Lösung → CTA',
      textOverlays: 'Große Untertitel, Keywords gelb hervorheben',
      musicStyle: 'Ruhiger, moderner Beat (lizenzfrei)',
      cuts: 'Harte Schnitte alle 1–2 Sek., Zoom-In beim Hook',
    },
    subtitles: 'Automatische Untertitel in CapCut, Schriftgröße groß, zentriert.',
    captionAndHashtags: 'Schnellere Regeneration in 20 Sek. 💪 #regeneration #faszien #homegym #anzeige',
    thumbnailIdea: 'Close-up Gerät am Nacken + Text „3 Fehler".',
  },
  {
    id: 'vid-02',
    title: 'Akupressur – Abendroutine zum Runterkommen',
    targetProduct: 'Akupressur-Set',
    concept: { platform: 'Instagram Reels', length: '30–40 Sek.' },
    hooks: [
      '„Gedankenkarussell? Probier das heute Abend."',
      '„Meine 3-Minuten-Routine vor dem Schlafen."',
      '„So schläfst du schneller ein (ohne App)."',
    ],
    script: [
      { scene: '0–3 Sek', text: 'Ruhige Szene, Hook als Text-Overlay.' },
      { scene: '3–20 Sek', text: 'Routine zeigen: hinlegen, 4-7-8-Atmung, Akupressur-Matte.' },
      { scene: '20–35 Sek', text: 'Gefühl beschreiben, sanfter CTA.' },
    ],
    shotlist15Min: [
      { shot: 'Shot 1', detail: 'Stimmungsbild Schlafzimmer' },
      { shot: 'Shot 2', detail: 'Matte auflegen' },
      { shot: 'Shot 3', detail: 'Atmung demonstrieren' },
      { shot: 'Shot 4', detail: 'Entspannter Gesichtsausdruck' },
      { shot: 'Shot 5', detail: 'CTA-Text' },
    ],
    capcutPlan: {
      clipOrder: 'Stimmung → Routine → Gefühl → CTA',
      textOverlays: 'Weiche, kleine Schrift, warme Töne',
      musicStyle: 'Lo-Fi / ambient (lizenzfrei)',
      cuts: 'Weiche Übergänge, langsames Tempo',
    },
    subtitles: 'Dezente Untertitel, unten zentriert.',
    captionAndHashtags: 'Meine Abendroutine zum Runterkommen 🌙 #entspannung #schlaf #abendroutine #werbung',
    thumbnailIdea: 'Gedämpftes Licht, Matte im Fokus, Text „3 Min. Routine".',
  },
];

export interface AffiliateProgramAudit {
  id: string;
  name: string;
  status: string;
  commission: string;
  nicheFocus: string;
  cookieDuration: string;
  conditions: string;
  fitReason: string;
}

export const AFFILIATE_PROGRAMS_AUDIT: AffiliateProgramAudit[] = [
  {
    id: 'aff-01',
    name: 'Amazon PartnerNet',
    status: 'Empfohlen',
    commission: '3–10 %',
    nicheFocus: 'Fitness-Hardware & Zubehör',
    cookieDuration: '24 Stunden',
    conditions: 'Pflichthinweis & Kennzeichnung nötig',
    fitReason: 'Riesige Auswahl, hohes Vertrauen – ideal für Einstiegsprodukte.',
  },
  {
    id: 'aff-02',
    name: 'Digistore24',
    status: 'Empfohlen',
    commission: '30–70 %',
    nicheFocus: 'Digitale Kurse (Fitness, Schlaf, Ernährung)',
    cookieDuration: '30–180 Tage',
    conditions: 'Sofortige Freischaltung, deutsche Plattform',
    fitReason: 'Hohe Margen – perfekt als Upsell über E-Mail-Funnel.',
  },
  {
    id: 'aff-03',
    name: 'AWIN',
    status: 'Zu prüfen',
    commission: 'variiert je Advertiser',
    nicheFocus: 'Marken-Partnerprogramme (Sport, Gesundheit)',
    cookieDuration: '30 Tage (typisch)',
    conditions: 'Bewerbung je Advertiser, ggf. Einrichtungsgebühr',
    fitReason: 'Zugang zu Markenprogrammen, wenn Reichweite da ist.',
  },
];

export interface ContentWeekVideo {
  title: string;
  goal: string;
  platform: string;
}
export interface ContentWeek {
  week: string;
  theme: string;
  videos: ContentWeekVideo[];
  pins: string;
  seoArticle: string;
  emailFlow: string;
}

export const CONTENT_CALENDAR_4WEEKS: ContentWeek[] = [
  {
    week: 'Woche 1',
    theme: 'Fundament & Schlafumgebung',
    videos: [
      { title: '3 Abend-Fehler', goal: 'Reichweite', platform: 'TikTok' },
      { title: 'Massagepistole-Demo', goal: 'Produkt zeigen', platform: 'Reels' },
    ],
    pins: 'Home-Gym Setup-Guide, Abendroutine-Checkliste',
    seoArticle: 'Massagepistole Test & Kaufberatung',
    emailFlow: 'Willkommen + Lead-Magnet (Checkliste)',
  },
  {
    week: 'Woche 2',
    theme: 'Licht & Energie am Morgen',
    videos: [
      { title: 'Tageslichtwecker-Test', goal: 'Vertrauen', platform: 'TikTok' },
      { title: 'Morgenroutine', goal: 'Reichweite', platform: 'Reels' },
    ],
    pins: 'Morgenroutine-Infografik',
    seoArticle: 'Tageslichtwecker: sanft aufwachen',
    emailFlow: 'Mehrwert-Mail: Licht & Melatonin',
  },
  {
    week: 'Woche 3',
    theme: 'Mobility & Mittagspause',
    videos: [
      { title: '3 Mobility-Übungen', goal: 'Reichweite', platform: 'TikTok' },
      { title: 'Matte im Einsatz', goal: 'Produkt zeigen', platform: 'Reels' },
    ],
    pins: 'Mobility-Flow für den Schreibtisch',
    seoArticle: 'Beste Mobility-Matte finden',
    emailFlow: 'Produktempfehlung (Affiliate + Shop)',
  },
  {
    week: 'Woche 4',
    theme: 'Regeneration & Abend',
    videos: [
      { title: '4-7-8 Atmung', goal: 'Reichweite', platform: 'TikTok' },
      { title: 'Akupressur-Routine', goal: 'Produkt zeigen', platform: 'Reels' },
    ],
    pins: 'Abendroutine Schritt für Schritt',
    seoArticle: "Akupressur & binaurale Beats – was bringt es?",
    emailFlow: 'Zusammenfassung + Bestseller',
  },
];
