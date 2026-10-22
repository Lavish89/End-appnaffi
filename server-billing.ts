// Mitgliedschaften ueber Stripe (Karte, PayPal, SEPA, Klarna, Apple/Google Pay – je nach
// Freischaltung im Stripe-Dashboard). Ohne STRIPE_SECRET_KEY bleibt die Bezahlung ausgeschaltet.
// Rechtliches (DE): Bestell-Button „Zahlungspflichtig abonnieren“ (§ 312j BGB), Kuendigungs-Button
// mit Bestaetigung per E-Mail (§ 312k BGB) – beides in der Oberflaeche umgesetzt.
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Express, Request } from 'express';
import type { AuthApi, StoredUser } from './server-auth';
import type { Mailer } from './server-mail';
import { DEFAULT_BILLING, BillingSettings, Interval, formatPrice } from './src/billing/plans';

const STRIPE = 'https://api.stripe.com/v1';

/** Stripe erwartet Formular-Daten mit verschachtelten Schluesseln, z. B. line_items[0][price]. */
export function formEncode(obj: Record<string, unknown>, prefix = ''): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') parts.push(formEncode(v as Record<string, unknown>, key));
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return parts.filter(Boolean).join('&');
}

/** Prueft die Stripe-Signatur (Header „Stripe-Signature“: t=…,v1=…). */
export function verifyStripeSignature(raw: Buffer | string, header: string, secret: string, toleranceSec = 300, now = Date.now()) {
  const items = Object.fromEntries(header.split(',').map(p => p.split('=') as [string, string]));
  const t = Number(items.t);
  const sigs = header.split(',').filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  if (!t || !sigs.length) return false;
  if (Math.abs(now / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw.toString()}`).digest('hex');
  return sigs.some(s => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

export function installBilling(app: Express, opts: { dataDir: string; auth: AuthApi; mailer: Mailer }) {
  const key = process.env.STRIPE_SECRET_KEY || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const file = path.join(opts.dataDir, 'billing.json');
  let settings: BillingSettings = { ...DEFAULT_BILLING };
  try { settings = { ...settings, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch { /* Standardpreise */ }
  const saveSettings = () => { fs.mkdirSync(opts.dataDir, { recursive: true }); fs.writeFileSync(file, JSON.stringify(settings), { mode: 0o600 }); };

  const stripe = async (method: 'GET' | 'POST', p: string, body?: Record<string, unknown>) => {
    const r = await fetch(`${STRIPE}${p}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body ? formEncode(body) : undefined,
    });
    const j: any = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || `Stripe-Fehler ${r.status}`);
    return j;
  };
  const baseUrl = (req: Request) => process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const periodEnd = (sub: any): string | undefined => {
    const ts = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end; // neuere API-Versionen: am Item
    return ts ? new Date(ts * 1000).toISOString() : undefined;
  };
  const priceLabel = (i?: Interval) => (i === 'year' ? `${formatPrice(settings.priceYearCents)} / Jahr` : `${formatPrice(settings.priceMonthCents)} / Monat`);

  // ---- oeffentlich ----
  app.get('/api/billing/plans', (_req, res) => {
    res.json({ success: true, settings, paymentsEnabled: Boolean(key) });
  });

  // ---- angemeldet ----
  app.post('/api/billing/checkout', async (req, res) => {
    const me = (req as any).user;
    const interval: Interval = req.body?.interval === 'year' ? 'year' : 'month';
    if (!key) return res.status(503).json({ success: false, error: 'Die Bezahlung ist noch nicht eingerichtet. Bitte versuche es später erneut.' });
    if (me.effectivePlan === 'pro' && me.role !== 'owner') return res.status(400).json({ success: false, error: 'Du hast Pro bereits.' });
    if (req.body?.acceptTerms !== true) return res.status(400).json({ success: false, error: 'Bitte bestätige AGB und Hinweise zum Widerrufsrecht.' });
    try {
      const u = opts.auth.getUser(me.id)!;
      const priceId = interval === 'year' ? process.env.STRIPE_PRICE_YEAR : process.env.STRIPE_PRICE_MONTH;
      const lineItem = priceId
        ? { price: priceId, quantity: 1 }
        : { quantity: 1, price_data: { currency: 'eur', unit_amount: interval === 'year' ? settings.priceYearCents : settings.priceMonthCents, recurring: { interval }, product_data: { name: `Goalsforce Pro (${interval === 'year' ? 'jährlich' : 'monatlich'})` } } };
      const session = await stripe('POST', '/checkout/sessions', {
        mode: 'subscription',
        line_items: { 0: lineItem },
        success_url: `${baseUrl(req)}/?checkout=success`,
        cancel_url: `${baseUrl(req)}/?checkout=cancel`,
        client_reference_id: u.id,
        ...(u.stripeCustomerId ? { customer: u.stripeCustomerId } : { customer_email: u.email }),
        metadata: { userId: u.id, interval },
        subscription_data: { metadata: { userId: u.id, interval }, ...(settings.trialDays > 0 ? { trial_period_days: settings.trialDays } : {}) },
        allow_promotion_codes: true,
        locale: 'de',
      });
      res.json({ success: true, url: session.url });
    } catch (e: any) {
      res.status(502).json({ success: false, error: e.message });
    }
  });

  // Kuendigen zum Ende der Laufzeit (§ 312k BGB) – mit Bestaetigung per E-Mail
  app.post('/api/billing/cancel', async (req, res) => {
    const me = (req as any).user;
    const u = opts.auth.getUser(me.id)!;
    if (u.plan !== 'pro' || u.planStatus === 'canceled') return res.status(400).json({ success: false, error: 'Du hast kein aktives Abo.' });
    try {
      let until = u.planRenewsAt;
      if (key && u.stripeSubscriptionId) {
        const sub = await stripe('POST', `/subscriptions/${encodeURIComponent(u.stripeSubscriptionId)}`, { cancel_at_period_end: true });
        until = periodEnd(sub) || until;
      }
      opts.auth.updateUser(u.id, { planStatus: until ? 'canceling' : 'canceled', planRenewsAt: until });
      const untilText = until ? new Date(until).toLocaleDateString('de-DE') : undefined;
      await opts.mailer.send(u.email, 'cancel_confirm', { name: u.profile?.firstName || u.name, plan: `Pro ${u.planInterval === 'year' ? 'jährlich' : 'monatlich'}`, until: untilText });
      res.json({ success: true, until, receivedAt: new Date().toISOString() });
    } catch (e: any) {
      res.status(502).json({ success: false, error: e.message });
    }
  });

  app.post('/api/billing/resume', async (req, res) => {
    const u = opts.auth.getUser((req as any).user.id)!;
    if (u.planStatus !== 'canceling') return res.status(400).json({ success: false, error: 'Es gibt keine Kündigung, die zurückgenommen werden kann.' });
    try {
      if (key && u.stripeSubscriptionId) await stripe('POST', `/subscriptions/${encodeURIComponent(u.stripeSubscriptionId)}`, { cancel_at_period_end: false });
      opts.auth.updateUser(u.id, { planStatus: 'active' });
      res.json({ success: true });
    } catch (e: any) {
      res.status(502).json({ success: false, error: e.message });
    }
  });

  // Stripe-Kundenportal: Zahlungsmethode aendern, Rechnungen ansehen
  app.post('/api/billing/portal', async (req, res) => {
    const u = opts.auth.getUser((req as any).user.id)!;
    if (!key || !u.stripeCustomerId) return res.status(400).json({ success: false, error: 'Für dein Konto gibt es noch keine Zahlungsdaten.' });
    try {
      const s = await stripe('POST', '/billing_portal/sessions', { customer: u.stripeCustomerId, return_url: `${baseUrl(req)}/` });
      res.json({ success: true, url: s.url });
    } catch (e: any) {
      res.status(502).json({ success: false, error: e.message });
    }
  });

  // ---- Admin ----
  app.get('/api/admin/billing', (_req, res) => {
    res.json({
      success: true,
      settings,
      integrations: {
        stripe: Boolean(key),
        stripeWebhook: Boolean(webhookSecret),
        mail: opts.mailer.configured,
        google: Boolean(process.env.GOOGLE_CLIENT_ID),
        facebook: Boolean(process.env.FACEBOOK_APP_ID),
        appUrl: process.env.APP_URL || '',
      },
    });
  });
  app.post('/api/admin/billing', (req, res) => {
    const b = req.body || {};
    const cents = (v: unknown, fallback: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 && n <= 1_000_000 ? n : fallback; };
    settings = {
      priceMonthCents: cents(b.priceMonthCents, settings.priceMonthCents),
      priceYearCents: cents(b.priceYearCents, settings.priceYearCents),
      priceNote: typeof b.priceNote === 'string' ? b.priceNote.slice(0, 200) : settings.priceNote,
      trialDays: Math.min(60, Math.max(0, Math.round(Number(b.trialDays ?? settings.trialDays)) || 0)),
    };
    saveSettings();
    res.json({ success: true, settings });
  });

  // ---- Webhook (oeffentlich, durch Signatur geschuetzt) ----
  app.post('/api/billing/webhook', async (req, res) => {
    const raw: Buffer | undefined = (req as any).rawBody;
    const sig = String(req.headers['stripe-signature'] || '');
    if (!webhookSecret || !raw || !verifyStripeSignature(raw, sig, webhookSecret)) {
      return res.status(400).json({ success: false, error: 'Ungültige Signatur' });
    }
    const event = JSON.parse(raw.toString());
    const obj = event?.data?.object || {};
    const byCustomer = (c: string) => opts.auth.findBy(u => u.stripeCustomerId === c);
    try {
      if (event.type === 'checkout.session.completed' && obj.mode === 'subscription') {
        const userId = obj.client_reference_id || obj.metadata?.userId;
        const u = userId ? opts.auth.getUser(userId) : undefined;
        if (u) {
          let renews: string | undefined;
          if (key && obj.subscription) { try { renews = periodEnd(await stripe('GET', `/subscriptions/${encodeURIComponent(obj.subscription)}`)); } catch { /* */ } }
          const interval: Interval = obj.metadata?.interval === 'year' ? 'year' : 'month';
          opts.auth.updateUser(u.id, { plan: 'pro', planStatus: 'active', planInterval: interval, planRenewsAt: renews, stripeCustomerId: obj.customer, stripeSubscriptionId: obj.subscription });
          await opts.mailer.send(u.email, 'payment_thanks', { name: u.profile?.firstName || u.name, plan: `Pro ${interval === 'year' ? 'jährlich' : 'monatlich'}`, amount: obj.amount_total != null ? formatPrice(obj.amount_total) : priceLabel(interval) });
        }
      } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const u: StoredUser | undefined = (obj.metadata?.userId && opts.auth.getUser(obj.metadata.userId)) || byCustomer(obj.customer);
        if (u) {
          const status = event.type === 'customer.subscription.deleted' || obj.status === 'canceled' ? 'canceled'
            : obj.cancel_at_period_end ? 'canceling'
            : obj.status === 'past_due' || obj.status === 'unpaid' ? 'past_due' : 'active';
          opts.auth.updateUser(u.id, { plan: status === 'canceled' ? 'free' : 'pro', planStatus: status, planRenewsAt: periodEnd(obj) || u.planRenewsAt, stripeSubscriptionId: obj.id });
        }
      } else if (event.type === 'invoice.payment_failed') {
        const u = byCustomer(obj.customer);
        if (u) {
          opts.auth.updateUser(u.id, { planStatus: 'past_due' });
          await opts.mailer.send(u.email, 'payment_failed', { name: u.profile?.firstName || u.name });
        }
      }
      res.json({ received: true });
    } catch (e: any) {
      console.error('[billing] webhook', e);
      res.status(500).json({ success: false });
    }
  });
}
