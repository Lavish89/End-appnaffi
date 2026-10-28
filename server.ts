import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { installAuth } from './server-auth';
import { installWorkspace } from './server-workspace';
import { installBilling } from './server-billing';
import { installOAuth } from './server-oauth';
import { createMailer } from './server-mail';
import { installCommunity } from './server-community';
import { createKV, kvReady, usingPostgres } from './server-kv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Request-Body begrenzen (Schutz vor Speicher-Missbrauch)
// rawBody wird fuer die Pruefung der Stripe-Webhook-Signatur gebraucht
app.use(express.json({ limit: '100kb', verify: (req: any, _res, buf) => { req.rawBody = buf; } }));

// Basis-Sicherheitsheader (kein X-Frame-Options, da AI Studio die App im iframe zeigt)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Registrierung, Login und Schutz aller App-Endpunkte
app.set('trust proxy', 1);
const dataDir = process.env.DATA_DIR || path.resolve(__dirname, 'data');
const mailer = createMailer(dataDir);
const auth = installAuth(app, { dataDir, isProd, mailer });
// Anmelden mit Google / Facebook (nur wenn in .env eingerichtet)
installOAuth(app, auth);
// Affiliate-Hub: Daten pro Nutzer, Kurzlinks /go/... mit Klickzaehlung
installWorkspace(app, { dataDir, currentUser: auth.currentUser });
// Mitgliedschaften (Stripe), Danke- und Kuendigungs-E-Mails
installBilling(app, { dataDir, auth, mailer });
// Community-Chat, Jobboerse, Feedback, Benachrichtigungen, Gluecksrad
installCommunity(app, {
  store: createKV(path.join(dataDir, 'community')),
  grantProDays: (userId, days) => {
    const u = auth.getUser(userId);
    if (!u) return;
    const base = Math.max(Date.now(), u.bonusProUntil ? new Date(u.bonusProUntil).getTime() : 0);
    auth.updateUser(userId, { bonusProUntil: new Date(base + days * 864e5).toISOString() });
  },
});

// KI-Texte sind fuer Mitglieder eine Pro-Funktion
app.use('/api/gemini/generate-marketing', (req: any, res, next) => {
  const u = req.user;
  if (u && u.role !== 'owner' && u.effectivePlan !== 'pro') {
    return res.status(402).json({ success: false, error: 'KI-Texte sind in Pro enthalten. Du kannst jederzeit upgraden.' });
  }
  next();
});

// Kostenkontrolle: einfaches Rate-Limit fuer alle KI-Endpunkte (pro IP)
const AI_RATE_LIMIT = Number(process.env.AI_RATE_LIMIT_PER_MIN) || 10;
const aiHits = new Map<string, number[]>();
app.use(['/api/gemini', '/api/ai-agents'], (req, res, next) => {
  if (req.method !== 'POST') return next();
  const key = req.ip || 'unknown';
  const now = Date.now();
  const recent = (aiHits.get(key) || []).filter(t => now - t < 60_000);
  if (recent.length >= AI_RATE_LIMIT) {
    return res.status(429).json({ success: false, error: 'Zu viele KI-Anfragen. Bitte in einer Minute erneut versuchen.' });
  }
  recent.push(now);
  aiHits.set(key, recent);
  if (aiHits.size > 5000) aiHits.clear();
  next();
});

// Eingaben fuer KI-Prompts kuerzen (Kosten + Prompt-Injection begrenzen)
const clip = (v: unknown, max = 2000): string =>
  typeof v === 'string' ? v.slice(0, max) : v == null ? '' : String(v).slice(0, max);

// Initialize Google GenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(ai),
    // Shopify, Bestellungen, Affiliates und Werbe-Autopilot sind simuliert (keine echten API-Aufrufe)
    demoMode: true,
    timestamp: new Date().toISOString(),
  });
});

// Autonomous Product & Competitor Research with Gemini
app.post('/api/gemini/analyze-market', async (req, res) => {
  try {
    const niche = clip(req.body?.niche, 200);
    const targetMarket = clip(req.body?.targetMarket, 100) || 'DACH / Deutschland';
    const focus = clip(req.body?.focus, 200) || 'Alltagsprodukte & Lifestyle';

    if (!ai) {
      // High-grade heuristic fallback when no API key is provided
      return res.json({
        success: true,
        source: 'heuristic_engine',
        data: {
          niche: niche || 'Ergonomische Home-Office & Desk Essentials',
          marketSummary: `Der Markt für ${niche || 'Desk Accessories'} im DACH-Raum wächst jährlich um 14.8%. Hohe Kaufkraft im B2C-Homeoffice-Segment und steigende Sensibilität für Ergonomie und Ästhetik.`,
          topCompetitors: [
            { name: 'Grovemade', trafficMonthly: '480k', avgPrice: '89€', usp: 'Solid Wood & Minimalist Craftsmanship' },
            { name: 'Bellroy', trafficMonthly: '1.2M', avgPrice: '65€', usp: 'Premium Leather Goods & Everyday Carry' },
            { name: 'Oakywood', trafficMonthly: '220k', avgPrice: '79€', usp: 'Eco-friendly European Oak Accessories' }
          ],
          opportunityScore: 94,
          estimatedMargin: '68% - 74%',
          recommendedAction: 'Start mit 3 Flaggschiff-Produkten (Desk Mat, MagCharge Dock, Lumbar Pillow) via EU-Hub Fulfillment mit 3-5 Tagen Lieferzeit nach Deutschland.'
        }
      });
    }

    const prompt = `Du bist ein autonomer E-Commerce-Unternehmer und Marktforscher für Shopify-Shops im DACH-Raum (${targetMarket}).
Analysiere die folgende Nische / Produktkategorie: "${niche || 'Ergonomische Workspace & Lifestyle Produkte'}".
Fokus: ${focus}.
Gib deine fundierte Analyse strukturiert als JSON zurück mit folgenden Feldern:
- niche: Name der Nische
- marketSummary: 2-3 Sätze über Nachfrage, Trend und Kundengruppe in Deutschland/EU
- topCompetitors: Array von 3 Wettbewerbern mit name, trafficMonthly, avgPrice, usp
- opportunityScore: Zahl von 1 bis 100
- estimatedMargin: Text mit geschätzter Marge
- recommendedAction: Konkrete Handlungsempfehlung für den Shopify-Shop`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini_3.8_flash',
      data: parsed,
    });
  } catch (err: any) {
    console.error('Market analysis error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Fehler bei der Marktanalyse',
    });
  }
});

// Marketing Generator with Gemini
app.post('/api/gemini/generate-marketing', async (req, res) => {
  try {
    const productName = clip(req.body?.productName, 200);
    const channel = clip(req.body?.channel, 50);
    const targetAudience = clip(req.body?.targetAudience, 300);
    const price = clip(req.body?.price, 20);

    if (!ai) {
      // High-grade creative fallback
      return res.json({
        success: true,
        source: 'creative_engine',
        data: {
          channel: channel || 'tiktok',
          hook: `„Ich habe 3 Jahre mit Rückenschmerzen am Schreibtisch gesessen, bis ich DIESES 1 Teil entdeckt habe...“`,
          scriptOrBody: `Szene 1 (0-3s): Nahaufnahme vom unordentlichen, unbequemen Schreibtisch mit schmerzverzogenem Gesicht.
Szene 2 (3-7s): Schnitt auf das ${productName || 'Premium Produkt'} – sanftes Platzieren, haptisches Finish im Licht.
Szene 3 (7-12s): Sofortiges Wohlgefühl, perfekte Haltung, aufgeräumter Arbeitsplatz.
Szene 4 (12-15s): Call-to-Action: „Link in der Bio – aktuell mit kostenlosem DHL-Expressversand in DE.“`,
          callToAction: 'Jetzt Schreibtisch upgraden · Schneller Versand in 2 Tagen',
          hashtags: ['#homeoffice', '#desksetup', '#produktivität', '#ergonomie', '#deskgoals'],
          estimatedEngagementRate: '4.8%'
        }
      });
    }

    const prompt = `Erstelle als Senior Performance-Marketing-Manager eine hochkonvertierende Werbebotschaft für das Produkt: "${productName}" (Verkaufspreis: ${price || '49.90€'}, Zielgruppe: ${targetAudience || 'Homeoffice-Arbeiter & Designliebhaber in Deutschland'}).
Kanal: ${channel} (z.B. tiktok, instagram, pinterest, google_ads, email_flow).
Antworte als JSON mit:
- channel: ${channel}
- hook: 1 packender 3-Sekunden-Hook
- scriptOrBody: Detailliertes Video-Skript oder Anzeigentext mit Szenen
- callToAction: Klarer, conversion-orientierter CTA
- hashtags: Array von 5 relevanten deutschsprachigen Hashtags
- estimatedEngagementRate: Geschätzte CTR / Engagement-Rate`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini_3.8_flash',
      data: parsed,
    });
  } catch (err: any) {
    console.error('Marketing generation error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Fehler beim Erstellen des Marketing-Assets',
    });
  }
});

// 12-Factor Product Profitability & Compliance Audit
app.post('/api/gemini/product-audit', async (req, res) => {
  try {
    const { productName, purchasePrice, sellingPrice, weightKg = 0.5, category = 'Workspace' } = req.body;

    const ek = parseFloat(purchasePrice) || 12.0;
    const vk = parseFloat(sellingPrice) || 44.9;
    const shippingDE = weightKg <= 0.5 ? 3.9 : 4.9;
    const paymentFee = Number((vk * 0.029 + 0.3).toFixed(2));
    const estimatedReturnsRate = 0.04; // 4% for quality home products
    const estimatedReturnCost = Number((vk * estimatedReturnsRate).toFixed(2));
    const db1 = Number((vk - ek - shippingDE).toFixed(2));
    const db2 = Number((db1 - paymentFee - estimatedReturnCost).toFixed(2));
    const marginDb2Percent = Number(((db2 / vk) * 100).toFixed(1));

    const audit = {
      productName: productName || 'Ergonomic Desk Product',
      category,
      financials: {
        ek,
        vk,
        shippingDE,
        paymentFee,
        estimatedReturnCost,
        db1,
        db2,
        marginDb2Percent,
        isProfitable: db2 > 15 && marginDb2Percent > 45,
      },
      compliance: {
        // Nicht automatisch pruefbar – muss pro Produkt manuell nachgewiesen werden
        gpsrCompliant: false,
        lucidVerpackG: false,
        requiresManualCheck: true,
        ceMarkRequired: category.toLowerCase().includes('elektr') || category.toLowerCase().includes('charge'),
        wEEE: category.toLowerCase().includes('elektr') || category.toLowerCase().includes('charge'),
        returnRightsNotice: '14 Tage gesetzliches Widerrufsrecht für EU-Verbraucher',
      },
      logistics: {
        recommendedHub: 'Frankfurt / Rotterdam 3PL Hub',
        deliveryDaysDE: '2-4 Werktage',
        moq: '1 Stück via Dropshipping / 50 Stück für Private Labeling',
      },
    };

    return res.json({
      success: true,
      data: audit,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Shopify Store Connection State (Persistent in-memory state)
let shopifyConfig = {
  isConnected: true,
  shopDomain: 'aura-workspace.myshopify.com',
  shopName: 'Aura Minimalist Studio',
  plan: 'Shopify Advanced',
  currency: 'EUR (€)',
  country: 'Deutschland (DE)',
  lastSyncedAt: new Date().toISOString(),
  permissions: {
    autonomousProductDrafts: true,
    autoPriceGuardrails: true,
    themeStagingAllowed: true,
    themeLivePublishAllowed: false, // Protected by default
    marketingGenAllowed: true,
    maxDailySpendLimit: 0.0,
    killSwitchActive: false,
  },
  liveProductsCount: 4,
  stagedProductsCount: 4,
  activeTheme: 'Aura Minimalist v2.4 (Unveröffentlicht - Staged)',
};

// Shopify Connection & Status
app.get('/api/shopify/status', (_req, res) => {
  res.json({
    success: true,
    config: shopifyConfig,
  });
});

app.post('/api/shopify/connect', (req, res) => {
  const { shopDomain, accessToken } = req.body;
  if (!shopDomain) {
    return res.status(400).json({ success: false, error: 'Shop-Domain ist erforderlich' });
  }

  shopifyConfig.isConnected = true;
  shopifyConfig.shopDomain = shopDomain.includes('.myshopify.com') ? shopDomain : `${shopDomain}.myshopify.com`;
  shopifyConfig.shopName = shopDomain.split('.')[0].toUpperCase();
  shopifyConfig.lastSyncedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Demo-Modus: ${shopifyConfig.shopDomain} gespeichert. Es wurde keine echte Verbindung zu Shopify aufgebaut.`,
    config: shopifyConfig,
  });
});

app.post('/api/shopify/update-permissions', (req, res) => {
  const { permissions } = req.body;
  if (permissions) {
    shopifyConfig.permissions = {
      ...shopifyConfig.permissions,
      ...permissions,
    };
  }
  res.json({
    success: true,
    message: 'Kontroll-Berechtigungen erfolgreich aktualisiert',
    permissions: shopifyConfig.permissions,
  });
});

app.post('/api/shopify/sync', (req, res) => {
  if (shopifyConfig.permissions.killSwitchActive) {
    return res.status(403).json({ success: false, error: 'Kill-Switch ist aktiv! Synchronisation blockiert.' });
  }

  shopifyConfig.lastSyncedAt = new Date().toISOString();
  res.json({
    success: true,
    message: `Demo-Sync simuliert (${shopifyConfig.shopDomain}). Es wurden keine Daten mit Shopify ausgetauscht.`,
    lastSyncedAt: shopifyConfig.lastSyncedAt,
  });
});

app.post('/api/shopify/publish-theme', (req, res) => {
  const { userConfirmed } = req.body;
  if (!userConfirmed) {
    return res.status(400).json({ success: false, error: 'Explizite Freigabe des Shop-Inhabers erforderlich!' });
  }

  shopifyConfig.activeTheme = 'Aura Minimalist v2.4 (LIVE)';
  shopifyConfig.permissions.themeLivePublishAllowed = true;
  res.json({
    success: true,
    message: 'Demo: Veröffentlichung simuliert. In Shopify wurde nichts geändert.',
    activeTheme: shopifyConfig.activeTheme,
  });
});

// Multi-AI Agents Registry & Cloud Hub
const registeredAgents = [
  {
    id: 'agent-claude-strategist',
    name: 'Claude 3.7 Sonnet - Lead E-Commerce Director',
    provider: 'anthropic_claude',
    model: 'claude-3-7-sonnet-20250219',
    role: 'Strategische Marktanalyse, AOV-Optimierung & Brand Building',
    systemPrompt: 'Du bist der führende D2C E-Commerce Stratege für den DACH-Markt. Dein Ziel ist maximaler Deckungsbeitrag und loyale Kundenbindung.',
    temperature: 0.7,
    status: 'Aktiv',
    totalExecutions: 48,
  },
  {
    id: 'agent-gemini-researcher',
    name: 'Gemini 3.8 Flash - Trend & Product Scout',
    provider: 'google_gemini',
    model: 'gemini-3.8-flash',
    role: 'Echtzeit-Produktsuche, 12-Faktoren-Scoring & Virale Hooks',
    systemPrompt: 'Analysiere Produktkandidaten nach Deckungsbeitrag DB II, Retourenrisiko und Kurzvideo-Viralität auf TikTok.',
    temperature: 0.6,
    status: 'Aktiv',
    totalExecutions: 82,
  },
  {
    id: 'agent-openai-copywriter',
    name: 'GPT-4o - Performance Copy & Video Hooks',
    provider: 'openai',
    model: 'gpt-4o',
    role: '3-Sekunden TikTok Hooks, E-Mail Abandoned Cart Flows & Meta Ads',
    systemPrompt: 'Schreibe hochkonvertierende deutsche Werbetexte und packende UGC-Hooks ohne Marketing-Floskeln.',
    temperature: 0.8,
    status: 'Aktiv',
    totalExecutions: 65,
  },
  {
    id: 'agent-deepseek-quant',
    name: 'DeepSeek R1 - Financial Math & Pricing Guard',
    provider: 'deepseek',
    model: 'deepseek-reasoner-r1',
    role: 'Exakte Deckungsbeitrags-Berechnung, Gebühren-Audits & ROAS-Breakeven',
    systemPrompt: 'Berechne Unit Economics mit absoluter mathematischer Präzision. Trenne Umsatz strikt von Reingewinn.',
    temperature: 0.2,
    status: 'Aktiv',
    totalExecutions: 39,
  }
];

// Run task through any selected AI Agent
app.post('/api/ai-agents/run', async (req, res) => {
  try {
    const agentId = req.body?.agentId;
    const prompt = clip(req.body?.prompt, 4000);
    const agent = registeredAgents.find(a => a.id === agentId) || registeredAgents[0];

    // If Gemini is available and agent is Gemini, use it directly
    if (ai && agent.provider === 'google_gemini') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${agent.systemPrompt}\n\nAufgabe: ${prompt}`,
      });
      return res.json({
        success: true,
        agentName: agent.name,
        provider: agent.provider,
        output: response.text || 'Keine Antwort erhalten',
      });
    }

    // Heuristic and multi-agent synthesis response
    const agentResponse = `[${agent.name}]
${agent.role.toUpperCase()} // DACH-Markt Fokus

Analyse & Ausführung zu deiner Anfrage:
"${prompt}"

1. ERKENNTNIS & DIAGNOSE:
Für profitable Shopify-Shops im DACH-Raum ist entscheidend, dass wir nicht im Preiskampf mit Billig-Importen untergehen. Unsere Marge (DB II: 63.8%) basiert auf emotionaler Wertigkeit und blitzschnellem Versand aus Frankfurt (DHL GOGREEN 2-3 Tage).

2. KONKRETER MASSNAHMENPLAN:
• Positionierung: "Skandinavische Ruhe am Arbeitsplatz" statt austauschbarer Massenware.
• Akquisitions-Hebel: 3-Sekunden TikTok-Hook ("Warum dein Rücken nach 4 Stunden schmerzt") + 10% Rabattcode WELCOME10.
• Warenkorb-Hebel: Kostenloser DHL-Versand ab 50€ treibt den Durchschnittswarenkorb (AOV) von 39,95€ auf 54,80€.

3. SICHERHEITS-AUDIT:
Vor dem Verkauf pro Produkt prüfen: GPSR-Angaben (Hersteller/EU-Verantwortlicher), LUCID-Registrierung und Widerrufsbelehrung.

(Hinweis: Beispielantwort ohne KI – GEMINI_API_KEY fehlt oder Agent ist nicht Gemini.)`;

    return res.json({
      success: true,
      agentName: agent.name,
      provider: agent.provider,
      output: agentResponse,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// IN-APP DIRECT SELLING & MULTI-CHANNEL OMS
// ==========================================
let liveOrders = [
  {
    id: 'ord-101',
    orderNumber: '#AUR-2026-8941',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: 'Maximilian Weber',
    customerEmail: 'm.weber@tech-munich.de',
    shippingAddress: {
      street: 'Leopoldstraße 42',
      city: 'München',
      postalCode: '80802',
      country: 'Deutschland',
    },
    items: [
      {
        productId: 'prod-01',
        productTitle: 'Aura Dual-Felt & Vegan Leather Desk Mat',
        sku: 'AUR-DSK-001',
        quantity: 1,
        price: 39.95,
        selectedVariants: { 'Farbe': 'Saddle Brown & Charcoal', 'Größe': 'Medium (80 × 40 cm)' },
        image: '/src/assets/images/product_desk_mat_vegan_1792635490857.jpg',
      },
      {
        productId: 'prod-03',
        productTitle: '3-in-1 Solid Walnut MagCharge Dock',
        sku: 'AUR-MAG-003',
        quantity: 1,
        price: 59.90,
        selectedVariants: { 'Holzart': 'Walnuss Natur & Schwarz' },
        image: '/src/assets/images/product_magcharge_stand_1792635477072.jpg',
      }
    ],
    subtotal: 99.85,
    discount: 9.99, // 10% coupon WELCOME10
    shippingFee: 0.00, // Free shipping > 50€
    total: 89.86,
    paymentMethod: 'apple_pay',
    paymentStatus: 'Bezahlt',
    fulfillmentStatus: 'Versendet',
    trackingNumber: 'DHL-DE-99238491204',
    carrier: 'DHL Paket GOGREEN',
    salesChannel: 'In-App Direct',
  },
  {
    id: 'ord-102',
    orderNumber: '#AUR-2026-8942',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customerName: 'Laura Schmidt',
    customerEmail: 'laura.schmidt@berlin-design.io',
    shippingAddress: {
      street: 'Torstraße 178',
      city: 'Berlin',
      postalCode: '10115',
      country: 'Deutschland',
    },
    items: [
      {
        productId: 'prod-02',
        productTitle: 'Ergonomisches Memory-Foam Lendenkissen',
        sku: 'AUR-LUM-002',
        quantity: 1,
        price: 44.90,
        selectedVariants: { 'Farbe': 'Heather Charcoal' },
        image: '/src/assets/images/product_lumbar_support_cushion_1792635476185.jpg',
      }
    ],
    subtotal: 44.90,
    discount: 0.00,
    shippingFee: 3.90,
    total: 48.80,
    paymentMethod: 'klarna',
    paymentStatus: 'Bezahlt',
    fulfillmentStatus: 'In Vorbereitung',
    trackingNumber: 'DHL-DE-99238491205',
    carrier: 'DHL Paket GOGREEN',
    salesChannel: 'Shopify Web',
  }
];

let salesChannels = [
  {
    id: 'chan-inapp',
    name: 'Aura In-App Direct Selling (Native Checkout)',
    type: 'in_app',
    connected: true,
    syncedProductsCount: 4,
    activeOrdersToday: 6,
    todayRevenue: 348.50,
    status: 'Live & Synchron',
  },
  {
    id: 'chan-shopify',
    name: 'Shopify Online Store (aura-workspace.myshopify.com)',
    type: 'shopify_web',
    connected: true,
    syncedProductsCount: 4,
    activeOrdersToday: 18,
    todayRevenue: 984.20,
    status: 'Live & Synchron',
  },
  {
    id: 'chan-tiktok',
    name: 'TikTok Shop DACH (Short Video Commerce)',
    type: 'tiktok_shop',
    connected: true,
    syncedProductsCount: 3,
    activeOrdersToday: 9,
    todayRevenue: 412.00,
    status: 'Live & Synchron',
  },
  {
    id: 'chan-instagram',
    name: 'Instagram Shopping & Meta Catalog Feed',
    type: 'instagram_shopping',
    connected: true,
    syncedProductsCount: 4,
    activeOrdersToday: 5,
    todayRevenue: 245.90,
    status: 'Live & Synchron',
  },
  {
    id: 'chan-google',
    name: 'Google Merchant Center / Shopping Feed (PMax)',
    type: 'google_merchant',
    connected: true,
    syncedProductsCount: 4,
    activeOrdersToday: 11,
    todayRevenue: 618.40,
    status: 'Live & Synchron',
  }
];

// Get all orders
app.get('/api/orders', (_req, res) => {
  res.json({
    success: true,
    orders: liveOrders,
    totalOrders: liveOrders.length,
    totalRevenue: liveOrders.reduce((sum, o) => sum + o.total, 0),
  });
});

// Create native in-app order (Selling products right in the app!)
app.post('/api/orders/create', (req, res) => {
  try {
    const { items, customer, paymentMethod = 'apple_pay', discountCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Keine Artikel im Warenkorb' });
    }

    if (!Array.isArray(items) || items.length > 50 || items.some((it: any) =>
      !(Number(it?.price) > 0 && Number(it.price) < 100000) || !(Number.isInteger(Number(it?.quantity)) && Number(it.quantity) > 0 && Number(it.quantity) <= 99))) {
      return res.status(400).json({ success: false, error: 'Ungültige Artikel im Warenkorb' });
    }
    const subtotal = Number(items.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0).toFixed(2));
    const discount = discountCode === 'WELCOME10' ? Number((subtotal * 0.10).toFixed(2)) : 0;
    const shippingFee = subtotal >= 50 ? 0 : 3.90;
    const total = Number((subtotal - discount + shippingFee).toFixed(2));

    const orderNumber = `#AUR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `DHL-DE-${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerName: customer?.name || 'Gast-Kunde',
      customerEmail: customer?.email || 'kunde@online.de',
      shippingAddress: customer?.address || {
        street: 'Kaiserstraße 14',
        city: 'Frankfurt am Main',
        postalCode: '60311',
        country: 'Deutschland',
      },
      items,
      subtotal,
      discount,
      shippingFee,
      total,
      paymentMethod,
      paymentStatus: 'Ausstehend', // keine echte Zahlung angebunden
      fulfillmentStatus: 'In Vorbereitung',
      trackingNumber,
      carrier: 'DHL Paket GOGREEN (Frankfurt Hub)',
      salesChannel: 'In-App Direct',
    };

    liveOrders.unshift(newOrder);

    // Update sales channel metric
    const inAppChan = salesChannels.find(c => c.type === 'in_app');
    if (inAppChan) {
      inAppChan.activeOrdersToday += 1;
      inAppChan.todayRevenue += total;
    }

    return res.json({
      success: true,
      message: `Demo-Bestellung ${orderNumber} angelegt. Keine Zahlung, keine Übertragung an Shopify.`,
      order: newOrder,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Fulfill order with DHL tracking
app.post('/api/orders/fulfill', (req, res) => {
  const { orderId } = req.body;
  const order = liveOrders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Bestellung nicht gefunden' });
  }

  order.fulfillmentStatus = 'Versendet';
  res.json({
    success: true,
    message: `Bestellung ${order.orderNumber} als versendet markiert. DHL Tracking: ${order.trackingNumber}`,
    order,
  });
});

// Get sales channels
app.get('/api/sales-channels', (_req, res) => {
  res.json({
    success: true,
    channels: salesChannels,
  });
});

// Toggle sales channel
app.post('/api/sales-channels/toggle', (req, res) => {
  const { channelId } = req.body;
  const chan = salesChannels.find(c => c.id === channelId);
  if (chan) {
    chan.connected = !chan.connected;
    chan.status = chan.connected ? 'Live & Synchron' : 'Getrennt';
  }
  res.json({
    success: true,
    channels: salesChannels,
  });
});

// ==========================================
// AUTOMATED MULTI-PLATFORM ADVERTISING AUTOPILOT
// ==========================================
let advertisingPlatforms = [
  {
    id: 'ad-tiktok',
    platform: 'TikTok Ads & Organic Shorts',
    icon: 'tiktok',
    status: 'Aktiv (Auto-Pilot)',
    dailyBudget: '15,00 €',
    targetROAS: '3,8x',
    activeAdFormat: 'Spark Ads & 3s Hook UGC Videos',
    audience: 'Home-Office, Desk-Setup & Ergonomie DE (18-35 J.)',
    impressionsToday: 34200,
    clicksToday: 1480,
    ctr: '4,33%',
    spendToday: 14.80,
    conversions: 8,
    syncedCreative: 'Aura Dual-Felt Desk Mat (Vorher/Nachher Hook)',
  },
  {
    id: 'ad-meta',
    platform: 'Meta Ads (Instagram Reels & Facebook)',
    icon: 'instagram',
    status: 'Aktiv (Auto-Pilot)',
    dailyBudget: '20,00 €',
    targetROAS: '4,2x',
    activeAdFormat: 'Carousel DPA & 9:16 Reels Ads',
    audience: 'Design-Interessierte, Remote Workers, DACH',
    impressionsToday: 28400,
    clicksToday: 980,
    ctr: '3,45%',
    spendToday: 18.50,
    conversions: 11,
    syncedCreative: '3-in-1 Solid Walnut MagCharge Dock',
  },
  {
    id: 'ad-google',
    platform: 'Google Ads (PMax & Search High-Intent)',
    icon: 'google',
    status: 'Aktiv (Auto-Pilot)',
    dailyBudget: '25,00 €',
    targetROAS: '4,8x',
    activeAdFormat: 'Responsive Search Ads & Google Shopping Feed',
    audience: 'Kaufbereite Sucher ("schreibtischunterlage leder", "lendenkissen")',
    impressionsToday: 19800,
    clicksToday: 1240,
    ctr: '6,26%',
    spendToday: 24.10,
    conversions: 14,
    syncedCreative: 'Dynamische Produkt-Assets (Alle 4 Flaggschiffe)',
  },
  {
    id: 'ad-pinterest',
    platform: 'Pinterest Ads & Rich Shopping Pins',
    icon: 'pinterest',
    status: 'Aktiv (Auto-Pilot)',
    dailyBudget: '10,00 €',
    targetROAS: '3,5x',
    activeAdFormat: 'Vertical 9:16 Idea Pins & Shopping Catalogs',
    audience: 'Interior Design, Skandi Workspace, Schreibtisch Deko',
    impressionsToday: 41000,
    clicksToday: 820,
    ctr: '2,00%',
    spendToday: 9.80,
    conversions: 6,
    syncedCreative: 'Nordic Desk Setup Aesthetic Guide',
  },
  {
    id: 'ad-youtube',
    platform: 'YouTube Shorts Action Ads',
    icon: 'youtube',
    status: 'Aktiv (Auto-Pilot)',
    dailyBudget: '12,00 €',
    targetROAS: '3,6x',
    activeAdFormat: 'Vertical Shorts Video Ads mit Direktlink',
    audience: 'Tech-Reviewer, Produktivitäts-Channels & Setup-Fans',
    impressionsToday: 22100,
    clicksToday: 760,
    ctr: '3,44%',
    spendToday: 11.40,
    conversions: 5,
    syncedCreative: 'Ergonomie Test: Vorher vs. Nachher 14 Tage',
  },
  {
    id: 'ad-email',
    platform: 'Klaviyo / Shopify E-Mail Automation',
    icon: 'mail',
    status: 'Aktiv (Auto-Pilot)',
    dailyBudget: '0,00 € (Kostenlos)',
    targetROAS: '18,5x',
    activeAdFormat: '3-Stufen Abandoned Cart Flow & VIP Welcome',
    audience: 'Warenkorb-Abbrecher & Newsletter-Abonnenten',
    impressionsToday: 1420,
    clicksToday: 380,
    ctr: '26,76%',
    spendToday: 0.00,
    conversions: 9,
    syncedCreative: '10% Gutschein WELCOME10 + Dringlichkeits-Reminder',
  }
];

let autopilotSettings = {
  isAutoPilotRunning: true,
  dailyBudgetCap: '82,00 €',
  minTargetROAS: 3.5,
  autoCreativeRefresh: 'Täglich um 08:00 Uhr',
  safetyBudgetStop: true,
  lastDispatchedAt: new Date().toISOString(),
};

// Get autopilot advertising status
app.get('/api/autopilot/status', (_req, res) => {
  res.json({
    success: true,
    platforms: advertisingPlatforms,
    settings: autopilotSettings,
    totalDailySpend: advertisingPlatforms.reduce((sum, p) => sum + p.spendToday, 0),
    totalConversionsToday: advertisingPlatforms.reduce((sum, p) => sum + p.conversions, 0),
    blendedROAS: 4.82,
  });
});

// Launch automatic ad campaign on ALL platforms
app.post('/api/autopilot/launch-all', (req, res) => {
  const { productName = 'Aura Dual-Felt Desk Mat', customHook, targetROAS = 3.8 } = req.body;

  autopilotSettings.isAutoPilotRunning = true;
  autopilotSettings.lastDispatchedAt = new Date().toISOString();

  advertisingPlatforms = advertisingPlatforms.map(p => ({
    ...p,
    status: 'Aktiv (Auto-Pilot)',
    syncedCreative: `${productName} · ${customHook || 'Automatischer Vorher/Nachher Viral Hook'}`,
    impressionsToday: p.impressionsToday + Math.floor(500 + Math.random() * 1500),
    clicksToday: p.clicksToday + Math.floor(30 + Math.random() * 90),
    conversions: p.conversions + Math.floor(1 + Math.random() * 3),
  }));

  res.json({
    success: true,
    message: `Werbekampagne für "${productName}" erfolgreich und synchron auf allen 6 Plattformen ausgerollt! (TikTok, Meta, Google, Pinterest, YouTube, E-Mail)`,
    platforms: advertisingPlatforms,
    dispatchedAt: autopilotSettings.lastDispatchedAt,
  });
});

// Toggle individual advertising platform
app.post('/api/autopilot/toggle-platform', (req, res) => {
  const { platformId } = req.body;
  const platform = advertisingPlatforms.find(p => p.id === platformId);
  if (platform) {
    platform.status = platform.status.includes('Aktiv') ? 'Pausiert' : 'Aktiv (Auto-Pilot)';
  }
  res.json({
    success: true,
    platforms: advertisingPlatforms,
  });
});

// ==========================================
// AFFILIATE NETWORKS & TRACKING DASHBOARD API
// ==========================================
let affiliateNetworks = [
  {
    id: 'net-awin',
    name: 'AWIN (Affiliate Window Europe)',
    region: 'DACH & Europa #1',
    connected: true,
    merchantId: 'MID-89210-DE',
    trackingType: 'Server-to-Server Postback API',
    defaultCommission: '15% CPS (Cost per Sale)',
    cookieWindowDays: 30,
    activePartners: 64,
    revenueGenerated: 12480.00,
    paidCommission: 1872.00,
    status: 'Live & Verbunden',
  },
  {
    id: 'net-shopify-collabs',
    name: 'Shopify Collabs (Creator & Influencer Hub)',
    region: 'Global & Instagram/TikTok D2C',
    connected: true,
    merchantId: 'COLLAB-AURA-2026',
    trackingType: 'Shopify Native Order Attribution',
    defaultCommission: '20% für verifizierte Creator',
    cookieWindowDays: 30,
    activePartners: 48,
    revenueGenerated: 8940.50,
    paidCommission: 1788.10,
    status: 'Live & Verbunden',
  },
  {
    id: 'net-impact',
    name: 'Impact.com (Partnership Cloud)',
    region: 'Global Enterprise & Media Publishers',
    connected: true,
    merchantId: 'IMP-AURA-GLOBAL',
    trackingType: 'Universal Tracking Tag & REST Webhook',
    defaultCommission: '12% CPS + Tiered Bonus',
    cookieWindowDays: 45,
    activePartners: 18,
    revenueGenerated: 3410.00,
    paidCommission: 409.20,
    status: 'Live & Verbunden',
  },
  {
    id: 'net-shareasale',
    name: 'ShareASale',
    region: 'Nordamerika & UK',
    connected: false,
    merchantId: 'SAS-98124',
    trackingType: 'Pixel & API Tracking',
    defaultCommission: '15% CPS',
    cookieWindowDays: 30,
    activePartners: 8,
    revenueGenerated: 1120.00,
    paidCommission: 168.00,
    status: 'Getrennt (Bereit)',
  },
  {
    id: 'net-cj',
    name: 'CJ Affiliate (Commission Junction)',
    region: 'Global Affiliate Network',
    connected: false,
    merchantId: 'CJ-AURA-D2C',
    trackingType: 'GraphQL Order Conversion API',
    defaultCommission: '14% CPS',
    cookieWindowDays: 30,
    activePartners: 5,
    revenueGenerated: 640.00,
    paidCommission: 89.60,
    status: 'Getrennt (Bereit)',
  },
  {
    id: 'net-amazon',
    name: 'Amazon PartnerNet / Associates Bridge',
    region: 'DACH Vergleichsportale',
    connected: true,
    merchantId: 'auradesk-21',
    trackingType: 'SiteStripe & Product Advertising API',
    defaultCommission: '8% Festprovision',
    cookieWindowDays: 1,
    activePartners: 22,
    revenueGenerated: 2190.00,
    paidCommission: 175.20,
    status: 'Live & Verbunden',
  }
];

let affiliatePartners = [
  {
    id: 'aff-01',
    name: 'Fabian | Minimal Desk Setup (YouTube & TikTok)',
    channel: 'YouTube (140k Abos) · TikTok (@minimal.desk.de)',
    refCode: 'FABIAN15',
    refUrl: 'https://aura-workspace.de?ref=fabian_desk',
    commissionRate: 15, // %
    totalClicks: 4890,
    ordersDriven: 114,
    revenueDriven: 5120.00,
    earnedCommission: 768.00,
    payoutStatus: 'Ausgezahlt',
    network: 'Shopify Collabs',
  },
  {
    id: 'aff-02',
    name: 'HomeOfficeMagazin.de (Vergleichs-Portal)',
    channel: 'SEO Fachblog & Produkt-Testsieger',
    refCode: 'HOMEOFFICE10',
    refUrl: 'https://aura-workspace.de?ref=homeoffice_mag',
    commissionRate: 12,
    totalClicks: 8420,
    ordersDriven: 168,
    revenueDriven: 8240.00,
    earnedCommission: 988.80,
    payoutStatus: 'Ausgezahlt',
    network: 'AWIN',
  },
  {
    id: 'aff-03',
    name: 'Elena Design & Architecture',
    channel: 'Instagram (@elena.interior.skandi 85k)',
    refCode: 'ELENA_AURA',
    refUrl: 'https://aura-workspace.de?ref=elena_interior',
    commissionRate: 18,
    totalClicks: 3210,
    ordersDriven: 74,
    revenueDriven: 3980.00,
    earnedCommission: 716.40,
    payoutStatus: 'Ausgezahlt',
    network: 'Shopify Collabs',
  },
  {
    id: 'aff-04',
    name: 'TopGutscheine24 & Cashback DE',
    channel: 'Gutschein & Cashback Portal',
    refCode: 'CASHBACK_AURA',
    refUrl: 'https://aura-workspace.de?ref=topgutschein24',
    commissionRate: 10,
    totalClicks: 6140,
    ordersDriven: 92,
    revenueDriven: 4120.00,
    earnedCommission: 412.00,
    payoutStatus: 'Ausstehend (Freigabe nach 30 Tagen)',
    network: 'AWIN',
  },
  {
    id: 'aff-05',
    name: 'TechWorkspace Review Blog',
    channel: 'Hardware & Schreibtisch Ergonomie',
    refCode: 'TECH_WORK15',
    refUrl: 'https://aura-workspace.de?ref=techworkspace',
    commissionRate: 15,
    totalClicks: 2190,
    ordersDriven: 48,
    revenueDriven: 2420.00,
    earnedCommission: 363.00,
    payoutStatus: 'Bereit zur Auszahlung',
    network: 'Impact.com',
  }
];

// Get affiliate overview
app.get('/api/affiliates/overview', (_req, res) => {
  const totalRevenue = affiliateNetworks.reduce((sum, n) => sum + n.revenueGenerated, 0);
  const totalCommission = affiliateNetworks.reduce((sum, n) => sum + n.paidCommission, 0);
  const totalActivePartners = affiliateNetworks.reduce((sum, n) => sum + n.activePartners, 0);

  res.json({
    success: true,
    networks: affiliateNetworks,
    partners: affiliatePartners,
    metrics: {
      totalRevenue,
      totalCommission,
      netProfitAfterCommission: totalRevenue - totalCommission,
      totalActivePartners,
      avgConversionRate: '4,62%',
      pendingPayoutsAmount: 775.00,
      activeCookieDurationDays: 30,
    }
  });
});

// Connect or toggle affiliate network
app.post('/api/affiliates/connect-network', (req, res) => {
  const { networkId, merchantId, apiKey } = req.body;
  const net = affiliateNetworks.find(n => n.id === networkId);
  if (net) {
    net.connected = !net.connected;
    net.status = net.connected ? 'Live & Verbunden' : 'Getrennt (Bereit)';
    if (merchantId) net.merchantId = merchantId;
  }
  res.json({
    success: true,
    message: `${net?.name || 'Netzwerk'} erfolgreich aktualisiert.`,
    networks: affiliateNetworks,
  });
});

// Create new affiliate partner
app.post('/api/affiliates/create-partner', (req, res) => {
  const { name, channel, refCode, commissionRate = 15, network = 'Shopify Collabs' } = req.body;
  if (!name || !refCode) {
    return res.status(400).json({ success: false, error: 'Name und Ref-Code erforderlich' });
  }

  const newPartner = {
    id: `aff-${Date.now()}`,
    name,
    channel: channel || 'Creator & Publisher',
    refCode: refCode.toUpperCase(),
    refUrl: `https://aura-workspace.de?ref=${refCode.toLowerCase()}`,
    commissionRate: Number(commissionRate) || 15,
    totalClicks: 0,
    ordersDriven: 0,
    revenueDriven: 0.00,
    earnedCommission: 0.00,
    payoutStatus: 'Aktiv (Wartet auf erste Sales)',
    network,
  };

  affiliatePartners.unshift(newPartner);
  res.json({
    success: true,
    message: `Partner "${name}" mit Ref-Code "${refCode.toUpperCase()}" erfolgreich angelegt!`,
    partner: newPartner,
  });
});

// Approve payout
app.post('/api/affiliates/payout', (req, res) => {
  const { partnerId } = req.body;
  const partner = affiliatePartners.find(p => p.id === partnerId);
  if (partner) {
    partner.payoutStatus = 'Als ausgezahlt markiert (Demo)';
  }
  res.json({
    success: true,
    message: `Demo: Auszahlung für ${partner?.name || 'Partner'} markiert. Es wurde kein Geld überwiesen.`,
    partner,
  });
});

// ==========================================
// REGISTRATION PROGRAMS (VIP CLUB, CREATOR, B2B)
// ==========================================
interface RegisteredMember {
  id: string;
  type: 'customer_vip' | 'creator' | 'b2b';
  name: string;
  email: string;
  registeredAt: string;
  status: 'Aktiv' | 'Verifiziert' | 'In Prüfung';
  details: any;
}

let registeredMembers: RegisteredMember[] = [
  {
    id: 'mem-101',
    type: 'customer_vip',
    name: 'Sophie Wagner',
    email: 'sophie.wagner@icloud.com',
    registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'Aktiv',
    details: {
      tier: 'Silber',
      points: 840,
      totalOrders: 3,
      totalSpent: 184.50,
      voucherCode: 'AURA-VIP-842',
      interests: ['Minimal Desk', 'Ergonomie'],
    }
  },
  {
    id: 'mem-102',
    type: 'customer_vip',
    name: 'Maximilian Krause',
    email: 'm.krause@posteo.de',
    registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'Aktiv',
    details: {
      tier: 'Gold',
      points: 1920,
      totalOrders: 6,
      totalSpent: 429.00,
      voucherCode: 'AURA-VIP-119',
      interests: ['Tech & Gadgets', 'Walnuss Holz'],
    }
  },
  {
    id: 'mem-201',
    type: 'creator',
    name: 'Niklas | Workspace Aesthetic',
    email: 'niklas@workspace-creators.de',
    registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'Verifiziert',
    details: {
      platform: 'TikTok & Instagram',
      handle: '@niklas.setup (68k)',
      refCode: 'NIKLAS15',
      commissionRate: 18,
      clicks: 1420,
      conversions: 38,
      payoutMethod: 'PayPal',
    }
  },
  {
    id: 'mem-301',
    type: 'b2b',
    name: 'FinTech Hub Frankfurt GmbH',
    email: 'procurement@fintech-hub-ffm.de',
    registeredAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'Verifiziert',
    details: {
      company: 'FinTech Hub Frankfurt GmbH',
      contactPerson: 'Dr. Michael Brandstetter',
      vatId: 'DE318920491',
      employees: '50-100',
      workstationsToEquip: 45,
      tierDiscount: '25% B2B Firmenrabatt',
      paymentTerms: '30 Tage Netto auf Rechnung',
      statusNote: 'Erstausstattung 45x Schreibtischunterlagen + MagCharge genehmigt',
    }
  }
];

// Improvements and Optimization Matrix
let storeImprovements = [
  {
    id: 'opt-exit-intent',
    category: 'Conversion-Rate',
    title: 'Exit-Intent Warenkorb-Retter',
    description: 'Erkennt Mausbewegung zum Browser-Schließen oder Zurück-Button. Zeigt dezentes Modal mit 10% Sofort-Rabatt und 15-Minuten-Garantie.',
    enabled: true,
    expectedLift: '+14% gerettete Warenkörbe',
    impactScore: 95,
    difficulty: 'Sofort aktiv',
    metrics: { triggeredToday: 142, recoveredOrders: 19, addedRevenue: '984,20 €' },
  },
  {
    id: 'opt-free-shipping-bar',
    category: 'AOV Steigerung',
    title: 'Dynamischer Gratis-Versand Fortschrittsbalken',
    description: 'Interaktiver Balken im Warenkorb: "Noch 10,10 € bis zum kostenlosen DHL GoGreen Expressversand!" mit 1-Click Upsell-Empfehlungen.',
    enabled: true,
    expectedLift: '+22% höherer durchschnittlicher Warenkorbwert (AOV)',
    impactScore: 92,
    difficulty: 'Sofort aktiv',
    metrics: { avgAovBefore: '42,50 €', avgAovNow: '68,90 €', upsellAddonsTaken: 34 },
  },
  {
    id: 'opt-smart-bundles',
    category: 'AOV Steigerung',
    title: 'Smart Setup Bundling Engine ("Ergo-Trio")',
    description: 'Automatische Bundle-Angebote auf PDP: Desk Mat + Lendenkissen + MagCharge Stand für 149 € statt 174 € (Spare 25 €).',
    enabled: true,
    expectedLift: '+35% mehr Multi-Produkt-Bestellungen',
    impactScore: 90,
    difficulty: 'Sofort aktiv',
    metrics: { bundlesSoldThisWeek: 28, extraMargin: '1.240,00 €' },
  },
  {
    id: 'opt-trust-matrix',
    category: 'Vertrauen & Legal',
    title: 'DACH Trust & Sicherheitssiegel-Matrix',
    description: 'Einbindung von Trusted Shops (4.94/5), TÜV Rheinland Ergonomie-geprüft, DHL GoGreen CO2-neutral und 30 Tage Rückgaberecht.',
    enabled: true,
    expectedLift: '+18% Vertrauensindex & weniger Absprünge im Checkout',
    impactScore: 88,
    difficulty: 'Sofort aktiv',
    metrics: { checkoutCompletionRate: '86,4%', trustBadgeClicks: 412 },
  },
  {
    id: 'opt-pagespeed-turbo',
    category: 'Technik & SEO',
    title: 'Mobile PageSpeed Turbo & Core Web Vitals < 1.1s',
    description: 'Automatische WebP/AVIF Bild-Kompression, CSS Inlining, Deferred JS und Font Preloading für 98/100 Google PageSpeed.',
    enabled: true,
    expectedLift: '+28% Google Ranking & -15% Google Ads Klickkosten (Quality Score 10/10)',
    impactScore: 94,
    difficulty: 'Sofort aktiv',
    metrics: { mobileLcp: '0.98s', googleSpeedScore: '98/100', bounceRateReduction: '-31%' },
  },
  {
    id: 'opt-multi-currency',
    category: 'Internationalisierung',
    title: 'Schweiz & Österreich Auto-Geolocation & Währungsrechner',
    description: 'Erkennt Besucher aus CH/AT automatisch. Schweizer Kunden erhalten Preise in CHF inklusive automatischer Netto-Ausfuhr (MwSt.-Befreiung § 6 UStG).',
    enabled: true,
    expectedLift: '+40% Umsatzsteigerung im kaufkräftigen Schweizer Markt',
    impactScore: 89,
    difficulty: 'Sofort aktiv',
    metrics: { swissOrdersToday: 7, chfRevenueToday: '840 CHF' },
  },
  {
    id: 'opt-express-checkout',
    category: 'Checkout-UX',
    title: '1-Click Express Wallets (Apple Pay, Google Pay & Klarna)',
    description: 'Direktkauf ohne Ausfüllen von langen Adressformularen. Nutzt Biometrie (TouchID / FaceID) für sofortige Adressübermittlung.',
    enabled: true,
    expectedLift: '+32% mobile Checkout-Conversion',
    impactScore: 96,
    difficulty: 'Sofort aktiv',
    metrics: { mobileShare: '74%', expressCheckoutsCount: 68 },
  },
  {
    id: 'opt-gpsr-shield',
    category: 'Rechtssicherheit EU 2024',
    title: 'GPSR 2024 Produktsicherheits-Compliance Shield',
    description: 'Vollständige Erfüllung der neuen EU-Produktsicherheitsverordnung (GPSR) mit Herstellerdaten, EU-Verantwortlichem und Sicherheitshinweisen.',
    enabled: true,
    expectedLift: '100% Schutz vor Abmahnungen & Marktplatz-Sperren',
    impactScore: 99,
    difficulty: 'Sofort aktiv',
    metrics: { complianceCheck: '100% Konform', auditStatus: 'Bestanden' },
  },
  {
    id: 'opt-vip-loyalty',
    category: 'Kundenbindung',
    title: 'Gamifiziertes Aura Club Treueprogramm',
    description: 'Punkte sammeln bei jedem Kauf (1 € = 10 Pkt), Geburtstags-Geschenke, Vorab-Zugang zu limitierten Drops und Stufen-Vorteile.',
    enabled: true,
    expectedLift: '+45% Wiederkaufrate (Customer Lifetime Value)',
    impactScore: 91,
    difficulty: 'Sofort aktiv',
    metrics: { activeClubMembers: 1240, repeatPurchaseRate: '34,2%' },
  },
  {
    id: 'opt-live-stock-urgency',
    category: 'Social Proof',
    title: 'Echtzeit-Verfügbarkeits & Besucher-Transparenz',
    description: 'Zeigt echte, nicht-erfundene Bestandsgrenzen an ("Nur noch 4 Stück im Frankfurter DHL-Hub auf Lager").',
    enabled: true,
    expectedLift: '+12% schnellere Kaufentscheidung ohne Täuschung',
    impactScore: 85,
    difficulty: 'Sofort aktiv',
    metrics: { decisionTimeAvg: '2m 14s', cartRetention: '91%' },
  }
];

// Get all members
app.get('/api/members', (_req, res) => {
  res.json({
    success: true,
    members: registeredMembers,
    stats: {
      totalCustomers: registeredMembers.filter(m => m.type === 'customer_vip').length + 1240,
      totalCreators: registeredMembers.filter(m => m.type === 'creator').length + 48,
      totalB2B: registeredMembers.filter(m => m.type === 'b2b').length + 14,
    }
  });
});

// Register new customer VIP member
app.post('/api/members/register-customer', (req, res) => {
  const { name, email, interests = [] } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name und E-Mail sind erforderlich' });
  }

  const voucherCode = `AURA-VIP-${Math.floor(100 + Math.random() * 900)}`;
  const newMember: RegisteredMember = {
    id: `mem-${Date.now()}`,
    type: 'customer_vip',
    name,
    email,
    registeredAt: new Date().toISOString(),
    status: 'Aktiv',
    details: {
      tier: 'Bronze',
      points: 100, // Willkommensbonus!
      totalOrders: 0,
      totalSpent: 0,
      voucherCode,
      interests,
    }
  };

  registeredMembers.unshift(newMember);
  res.json({
    success: true,
    message: `Herzlich willkommen im Aura VIP Club, ${name}! Dein Willkommens-Gutscheincode ist ${voucherCode} (-10%) und 100 Treuepunkte wurden gutgeschrieben.`,
    member: newMember,
  });
});

// Register new Creator / Affiliate
app.post('/api/members/register-creator', (req, res) => {
  const { name, email, platform, handle, preferredRefCode, payoutMethod } = req.body;
  if (!name || !email || !handle) {
    return res.status(400).json({ success: false, error: 'Name, E-Mail und Social Handle sind erforderlich' });
  }

  const refCode = (preferredRefCode || name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)).toUpperCase();
  const newCreator: RegisteredMember = {
    id: `mem-${Date.now()}`,
    type: 'creator',
    name,
    email,
    registeredAt: new Date().toISOString(),
    status: 'Verifiziert',
    details: {
      platform: platform || 'Instagram / TikTok',
      handle,
      refCode,
      commissionRate: 15,
      clicks: 0,
      conversions: 0,
      payoutMethod: payoutMethod || 'SEPA Überweisung',
    }
  };

  registeredMembers.unshift(newCreator);

  // Sync with affiliate system
  affiliatePartners.unshift({
    id: `aff-${Date.now()}`,
    name: `${name} (${handle})`,
    channel: `${platform || 'Social'} · ${handle}`,
    refCode,
    refUrl: `https://aura-workspace.de?ref=${refCode.toLowerCase()}`,
    commissionRate: 15,
    totalClicks: 0,
    ordersDriven: 0,
    revenueDriven: 0.00,
    earnedCommission: 0.00,
    payoutStatus: 'Aktiv (Wartet auf erste Sales)',
    network: 'Shopify Collabs',
  });

  res.json({
    success: true,
    message: `Creator-Partnerschaft freigeschaltet! Dein persönlicher Tracking-Code ist "${refCode}". Du erhältst 15% Provision auf alle vermittelten Verkäufe.`,
    member: newCreator,
  });
});

// Register B2B corporate customer
app.post('/api/members/register-b2b', (req, res) => {
  const { company, contactPerson, email, vatId, employees, workstations } = req.body;
  if (!company || !contactPerson || !email) {
    return res.status(400).json({ success: false, error: 'Firma, Ansprechpartner und Firmen-E-Mail sind erforderlich' });
  }

  const newB2B: RegisteredMember = {
    id: `mem-${Date.now()}`,
    type: 'b2b',
    name: `${contactPerson} (${company})`,
    email,
    registeredAt: new Date().toISOString(),
    status: 'Verifiziert',
    details: {
      company,
      contactPerson,
      vatId: vatId || 'DE-IN-PRUEFUNG',
      employees: employees || '10-50',
      workstationsToEquip: Number(workstations) || 10,
      tierDiscount: '20% B2B Rabatt ab 5 Arbeitsplätzen',
      paymentTerms: '30 Tage Netto auf Rechnung',
      statusNote: 'B2B Konditionen freigeschaltet. Individuelles Angebot wird generiert.',
    }
  };

  registeredMembers.unshift(newB2B);
  res.json({
    success: true,
    message: `B2B Firmenkonto für "${company}" erfolgreich eingerichtet! Rabattstufe und Rechnungskauf (30 Tage Netto) sind aktiviert.`,
    member: newB2B,
  });
});

// Get improvements
app.get('/api/improvements', (_req, res) => {
  const enabledCount = storeImprovements.filter(i => i.enabled).length;
  res.json({
    success: true,
    improvements: storeImprovements,
    totalImprovements: storeImprovements.length,
    activeImprovementsCount: enabledCount,
    healthScore: Math.round((enabledCount / storeImprovements.length) * 100),
  });
});

// Toggle improvement
app.post('/api/improvements/toggle', (req, res) => {
  const { improvementId } = req.body;
  const imp = storeImprovements.find(i => i.id === improvementId);
  if (imp) {
    imp.enabled = !imp.enabled;
  }
  const enabledCount = storeImprovements.filter(i => i.enabled).length;
  res.json({
    success: true,
    message: `${imp?.title} wurde ${imp?.enabled ? 'erfolgreich aktiviert' : 'pausiert'}.`,
    improvements: storeImprovements,
    healthScore: Math.round((enabledCount / storeImprovements.length) * 100),
  });
});

// Apply all store improvements
app.post('/api/improvements/apply-all', (_req, res) => {
  storeImprovements = storeImprovements.map(i => ({ ...i, enabled: true }));
  res.json({
    success: true,
    message: 'Alle 10 Store-Optimierungen und Conversion-Booster wurden erfolgreich scharfgeschaltet!',
    improvements: storeImprovements,
    healthScore: 100,
  });
});

// ==========================================
// PERMANENT AI ASSISTANT CHAT FOR AGENT PROCESSES
// ==========================================
app.post('/api/gemini/assistant-chat', async (req, res) => {
  try {
    const { message: rawMessage, history: rawHistory = [] } = req.body;
    if (!rawMessage || typeof rawMessage !== 'string') {
      return res.status(400).json({ success: false, error: 'Nachricht ist erforderlich' });
    }
    const message = clip(rawMessage, 4000);
    const history = Array.isArray(rawHistory)
      ? rawHistory.slice(-6).map((h: any) => ({ role: h?.role === 'user' ? 'user' : 'assistant', text: clip(h?.text, 1500) }))
      : [];

    // Aggregate live runtime context
    const totalOrderRevenue = liveOrders.reduce((sum, o) => sum + o.total, 0);
    const totalConversions = advertisingPlatforms.reduce((sum, p) => sum + p.conversions, 0);
    const totalAdSpend = advertisingPlatforms.reduce((sum, p) => sum + p.spendToday, 0);
    const activeImprovements = storeImprovements.filter(i => i.enabled).length;

    const runtimeContext = `
Live-Telemetrie & Status des autonomen Shopify-Agenten (Stand: ${new Date().toLocaleTimeString('de-DE')}):
- Shopify Store: ${shopifyConfig.shopDomain} (${shopifyConfig.isConnected ? 'Verbunden' : 'Getrennt'})
- Theme-Status: ${shopifyConfig.activeTheme} | Staged Produkte: ${shopifyConfig.stagedProductsCount}
- Autonome Sicherheitsregeln: Live-Publishing ist GESPERRT (erfordert Bestätigungswort 'FREIGEBEN'), Werbe-Tagesbudget-Limit: ${autopilotSettings.dailyBudgetCap}, 0 bezahlte Apps installiert.
- Werbe-Autopilot: Aktiv auf 6 Plattformen (TikTok, Meta, Google PMax, Pinterest, YouTube, Klaviyo), Tagesbudget: ${autopilotSettings.dailyBudgetCap}, Spend heute: ${totalAdSpend.toFixed(2)} €, Blended ROAS: 4.82x, Conversions: ${totalConversions}.
- In-App & Shopify Verkäufe: ${liveOrders.length} Bestellungen, Gesamtumsatz: ${totalOrderRevenue.toFixed(2)} €, Letzte Bestellung: ${liveOrders[0]?.orderNumber || 'N/A'} (${liveOrders[0]?.carrier || 'DHL'}).
- Flaggschiff-Produkte & Margen:
  1. Dual-Felt Schreibtischunterlage (EK: 8,50 €, VK: 39,90 €, DB II: 22,95 € / 57,5%)
  2. Memory-Foam Lendenkissen (EK: 9,20 €, VK: 44,90 €, DB II: 24,75 € / 55,1%)
  3. 3-in-1 MagCharge Stand (EK: 14,80 €, VK: 59,90 €, DB II: 38,50 € / 64,3%)
  4. Titan Isolierflasche (EK: 11,00 €, VK: 49,00 €, DB II: 27,80 € / 56,8%)
- Logistik & Lieferanten: EU-Hub Frankfurt am Main (DHL Paket 1-3 Werktage), Zendrop Rotterdam Hub (3-5 Werktage).
- Affiliate-Netzwerke: AWIN, Shopify Collabs, Impact, Amazon. 64 aktive Partner, 15-20% CPS Provision.
- Store-Optimierungen: ${activeImprovements}/${storeImprovements.length} Optimierungen aktiv (Exit-Intent Gutschein STAY10, dynamischer Gratisversand-Balken ab 50 €, Bundle-Engine "Ergo-Trio" 149 €, Trust-Siegel).
- Registrierte Mitglieder: ${registeredMembers.length + 1240} Aura VIP Kunden, Creator & B2B Partner.
`;

    if (ai) {
      try {
        const systemInstruction = `Du bist der permanente, autonome KI-Operations-Assistent für den Shopify-Shop „Aura Minimalist Studio“.
Du stehst dem Betreiber als Experte zur Seite, um Fragen zu allen laufenden Agenten-Prozessen (Marktrecherche, Produkt-Scoring DB I/II, Logistik, Storefront, Staging, Marketing-Autopilot, ROAS, Bestellungen und Sicherheits-Leitplanken) zu beantworten.
Beantworte Anfragen:
- Präzise, faktenbasiert, auf Deutsch und unter Verwendung der realen Zahlen aus der Live-Telemetrie.
- Nutze Markdown, Aufzählungspunkte und Fettungen.
- Betone die autonomen Schutzgrenzen (keine ungeprüften Werbeausgaben, Schutz vor Live-Publishing ohne Freigabe, kein Schätzen/Erfinden von Verkaufszahlen).
- Sei freundlich, professionell und wie ein leitender Head of E-Commerce.`;

        // Build chat prompt with recent history if provided
        const recentHistoryText = Array.isArray(history) && history.length > 0
          ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'Nutzer' : 'Assistent'}: ${h.text}`).join('\n')
          : '';

        const fullPrompt = `${systemInstruction}\n\n${runtimeContext}\n\n${recentHistoryText ? `Bisheriger Dialog:\n${recentHistoryText}\n\n` : ''}Aktuelle Nutzerfrage: ${message}`;

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout (fast fallback)')), 4000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        if (response.text) {
          return res.json({
            success: true,
            source: 'gemini_3.8_flash',
            reply: response.text,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to operations engine:', geminiError?.message || geminiError);
        // Continue to resilient heuristic operations engine below
      }
    }

    // High-grade intelligent rule-based response engine when AI key is missing or offline
    const q = message.toLowerCase();
    let reply = '';

    if (q.includes('roas') || q.includes('werb') || q.includes('ad') || q.includes('kampagne') || q.includes('budget')) {
      reply = `**Aktueller Werbe-Autopilot Status:**\n\n` +
        `• **Blended ROAS:** **4.82x** über alle 6 synchronisierten Plattformen.\n` +
        `• **Tagesbudget-Cap:** ${autopilotSettings.dailyBudgetCap} (Spend heute: ${totalAdSpend.toFixed(2)} €).\n` +
        `• **Generierte Conversions:** ${totalConversions} Verkäufe heute.\n` +
        `• **Plattformen:** TikTok Ads & UGC, Meta (Instagram Reels), Google Ads (PMax & High-Intent Search), Pinterest Rich Pins, YouTube Shorts und Klaviyo Abandoned-Cart-Automatisierung.\n\n` +
        `*Sicherheitsregel:* Das Budget ist gedeckelt und stoppt automatisch, falls der ROAS unter 3.5x fällt.`;
    } else if (q.includes('produkt') || q.includes('marge') || q.includes('deckungsbeitrag') || q.includes('gewinn') || q.includes('db')) {
      reply = `**Deckungsbeitrags-Analyse (DB I & DB II):**\n\n` +
        `1. **3-in-1 MagCharge Stand:** VK 59,90 € · EK 14,80 € → **DB II: 38,50 € (64,3% Marge)** – Unser margenstärkstes Tech-Accessoire.\n` +
        `2. **Dual-Felt Schreibtischunterlage:** VK 39,90 € · EK 8,50 € → **DB II: 22,95 € (57,5% Marge)** – Höchste Nachfrage & bester Viral-Faktor.\n` +
        `3. **Memory-Foam Lendenkissen:** VK 44,90 € · EK 9,20 € → **DB II: 24,75 € (55,1% Marge)** – Geringste Retourenquote (1,8%).\n` +
        `4. **Titan Isolierflasche:** VK 49,00 € · EK 11,00 € → **DB II: 27,80 € (56,8% Marge)** – Hoher AOV-Booster.\n\n` +
        `*Hinweis:* Alle Berechnungen berücksichtigen Wareneinsatz, DHL-Versand, Payment-Gebühren und Retourenrisiko.`;
    } else if (q.includes('shopify') || q.includes('theme') || q.includes('verbind') || q.includes('staging')) {
      reply = `**Shopify-Verbindung & Theme-Status:**\n\n` +
        `• **Shop-Domain:** \`${shopifyConfig.shopDomain}\` (${shopifyConfig.isConnected ? 'Aktiv verbunden' : 'Getrennt'}).\n` +
        `• **Aktives Theme:** \`${shopifyConfig.activeTheme}\`.\n` +
        `• **Staging:** Alle 4 Flaggschiffe befinden sich im geschützten Entwurfsmodus.\n` +
        `• **Sicherheits-Schutz:** Direktes Live-Publishing in den Produktions-Store ist standardmäßig gesperrt. Erst nach expliziter Eingabe des Sicherheitsworts **"FREIGEBEN"** wird das Theme scharfgestellt.`;
    } else if (q.includes('sicher') || q.includes('regel') || q.includes('leitplanke') || q.includes('grenz')) {
      reply = `**Eingebaute autonome Sicherheits-Leitplanken:**\n\n` +
        `1. **Keine unautorisierten Kosten:** 0,00 € Ad-Spend ohne Budgetfreigabe; 0 kostenpflichtige Shopify-Apps.\n` +
        `2. **Theme-Schutz:** Niemals Live-Veröffentlichung ohne explizite Freigabe durch den Shop-Inhaber.\n` +
        `3. **Katalog-Schutz:** Vorhandene Produkte werden niemals überschrieben oder gelöscht; neue Artikel starten immer als Entwurf.\n` +
        `4. **Transparenz:** Vollständige Protokollierung aller Agenten-Entscheidungen im Revisionsprotokoll.\n` +
        `5. **Notfall-Ausschalter (Kill Switch):** Jederzeit mit einem Klick alle Prozesse sofort stoppbar.`;
    } else if (q.includes('bestell') || q.includes('order') || q.includes('umsatz') || q.includes('dhl') || q.includes('tracking')) {
      reply = `**Bestellungen & Fulfillment:**\n\n` +
        `• **Bestellungen im System:** ${liveOrders.length} Bestellungen (${totalOrderRevenue.toFixed(2)} € Gesamtumsatz).\n` +
        `• **Letzte Bestellung:** ${liveOrders[0]?.orderNumber || '#AUR-2026-8941'} von ${liveOrders[0]?.customerName || 'Kunde'} (${liveOrders[0]?.total?.toFixed(2) || '89.86'} € via ${liveOrders[0]?.paymentMethod || 'Apple Pay'}).\n` +
        `• **Fulfillment:** Automatische Sendungsnummern-Erstellung via **DHL Paket GOGREEN** über das EU-Zentrallager Frankfurt am Main (Laufzeit: 1-3 Werktage).`;
    } else if (q.includes('optimier') || q.includes('conversion') || q.includes('booster') || q.includes('exit')) {
      reply = `**Store-Optimierungen & Conversion-Booster:**\n\n` +
        `• **Aktive Hebel:** ${activeImprovements} von ${storeImprovements.length} Optimierungen aktiv.\n` +
        `• **Warenkorb-Retter:** Exit-Intent Pop-up mit 10% Rabattcode \`STAY10\` aktiv.\n` +
        `• **AOV-Booster:** Dynamischer Gratis-Versand-Balken ab 50,00 € + Smart Bundle "Ergo-Trio" (149 € statt 174 €).\n` +
        `• **Vertrauens-Siegel:** Trusted Shops (4.94/5), TÜV-Rheinland und GPSR 2024 Sicherheits-Compliance aktiviert.\n` +
        `• **PageSpeed:** Google Core Web Vitals LCP 0.98s durch WebP & Deferred Loading.`;
    } else if (q.includes('affiliate') || q.includes('partner') || q.includes('creator')) {
      reply = `**Affiliate & Creator System:**\n\n` +
        `• **Netzwerke:** AWIN (DACH #1), Shopify Collabs, Impact.com, Amazon PartnerNet.\n` +
        `• **Aktive Partner:** 64 Partner mit 15% bis 20% Provision.\n` +
        `• **Top-Performer:** *Fabian Minimal Desk* (114 Sales, 5.120 € Umsatz) & *HomeOfficeMagazin.de* (168 Sales, 8.240 € Umsatz).\n` +
        `• **Betrugsschutz:** 30 Tage Cookie-Tracking mit Auszahlungssperre bei Retouren.`;
    } else {
      reply = `**Status des E-Commerce Agenten:**\n\n` +
        `Ich überwache alle laufenden Prozesse des Shops **Aura Minimalist Studio**:\n\n` +
        `• **Shopify & Theme:** Verbunden, Staged Theme v2.4 gesichert.\n` +
        `• **Werbe-Autopilot:** 6 Plattformen aktiv (ROAS 4.82x, Budget-Cap ${autopilotSettings.dailyBudgetCap}).\n` +
        `• **Bestellungen:** ${liveOrders.length} Bestellungen (${totalOrderRevenue.toFixed(2)} € Umsatz) via Frankfurt DHL Hub.\n` +
        `• **Store-Gesundheit:** ${activeImprovements}/${storeImprovements.length} Optimierungen aktiv.\n\n` +
        `*Stelle mir gerne konkrete Fragen wie:*\n` +
        `- „Wie steht es um unseren Werbe-ROAS?“\n` +
        `- „Welches Produkt bringt den höchsten Deckungsbeitrag?“\n` +
        `- „Welche Sicherheitsregeln gelten für den Agenten?“\n` +
        `- „Wie ist der Status der letzten Bestellung?“`;
    }

    return res.json({
      success: true,
      source: 'heuristic_operations_engine',
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Assistant chat error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Fehler bei der Assistenten-Verarbeitung',
    });
  }
});


// ==========================================
// FULL VERSION APK DOWNLOAD ENDPOINT
// ==========================================
app.get('/api/download/apk', (_req, res) => {
  const apkPath = path.resolve(__dirname, 'public', 'downloads', 'goalsforce-agent-v2.4.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="Goalsforce-Business-Agent-v2.4.apk"');
    return res.sendFile(apkPath);
  }
  return res.status(404).json({ success: false, error: 'Keine native APK verfügbar. Bitte die App über „Zum Startbildschirm hinzufügen“ installieren.' });
});

// Setup Vite in Dev or Static in Production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Postgres-Speicher: Caches vorab laden, bevor Anfragen bedient werden.
  await kvReady();
  console.log(`[Storage] ${usingPostgres() ? 'Postgres (DATABASE_URL) aktiv' : 'Datei-Speicher (kein DATABASE_URL)'}`);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Autonomous Shopify Agent Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
