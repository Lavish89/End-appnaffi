// E-Mail-Vorlagen (gemeinsam fuer Server und Testversion). Schlicht gehalten, damit sie in jedem
// Postfach gut aussehen. Werte werden vor dem Einsetzen in HTML maskiert.

export type MailKind = 'welcome' | 'payment_thanks' | 'cancel_confirm' | 'password_reset' | 'payment_failed';

export interface MailData {
  name: string;
  appUrl: string;
  plan?: string;
  amount?: string;
  until?: string;
  resetUrl?: string;
}

const esc = (s: string) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function wrap(title: string, bodyHtml: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#020617;padding:20px 28px;color:#fbbf24;font-weight:bold;font-size:18px">Goalsforce</td></tr>
<tr><td style="padding:28px">
<h1 style="font-size:20px;margin:0 0 16px">${esc(title)}</h1>
${bodyHtml}
${cta ? `<p style="margin:24px 0"><a href="${esc(cta.url)}" style="background:#fbbf24;color:#020617;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px;display:inline-block">${esc(cta.label)}</a></p>` : ''}
<p style="font-size:13px;color:#71717a;margin-top:28px">Viele Grüße<br>Dragos von Goalsforce</p>
</td></tr>
<tr><td style="padding:16px 28px;background:#fafafa;font-size:11px;color:#a1a1aa">Goalsforce · Dragos Serbu · Ernst-Moritz-Arndt-Straße 38 · 46537 Dinslaken · dragosserbu6@gmail.com</td></tr>
</table></td></tr></table></body></html>`;
}
const p = (t: string) => `<p style="font-size:15px;line-height:1.55;margin:0 0 12px">${t}</p>`;

export function renderMail(kind: MailKind, d: MailData): { subject: string; html: string; text: string } {
  const n = esc(d.name || 'du');
  switch (kind) {
    case 'welcome':
      return {
        subject: 'Willkommen bei Goalsforce – schön, dass du da bist!',
        html: wrap(`Danke für deine Registrierung, ${d.name}!`, [
          p(`Hallo ${n},`),
          p('dein Konto ist bereit. So startest du am besten:'),
          `<ol style="font-size:15px;line-height:1.6;padding-left:20px;margin:0 0 12px"><li>Mach die kurze Tour im Affiliate-Hub.</li><li>Lies die Lektion „Was ist Affiliate-Marketing?“.</li><li>Leg dein erstes Partnerprogramm und deinen ersten Link an.</li></ol>`,
          p('Bei Fragen antworte einfach auf diese E-Mail.'),
        ].join(''), { label: 'Jetzt loslegen', url: d.appUrl }),
        text: `Hallo ${d.name},\n\ndanke für deine Registrierung bei Goalsforce! Dein Konto ist bereit.\n\n1. Mach die kurze Tour im Affiliate-Hub.\n2. Lies die Lektion „Was ist Affiliate-Marketing?“.\n3. Leg dein erstes Partnerprogramm und deinen ersten Link an.\n\n${d.appUrl}\n\nViele Grüße\nDragos von Goalsforce`,
      };
    case 'payment_thanks':
      return {
        subject: 'Danke für dein Goalsforce Pro-Abo!',
        html: wrap('Vielen Dank – Pro ist freigeschaltet!', [
          p(`Hallo ${n},`),
          p(`danke für dein Vertrauen! Dein Abo <strong>${esc(d.plan || 'Pro')}</strong>${d.amount ? ` (${esc(d.amount)})` : ''} ist aktiv.`),
          p('Jetzt kannst du unbegrenzt Links anlegen, alle Automationen nutzen, eigene Regeln bauen und Posts per KI schreiben lassen.'),
          p('Die Rechnung bekommst du separat vom Zahlungsanbieter. Kündigen kannst du jederzeit unter „Konto & Mitgliedschaft“.'),
        ].join(''), { label: 'Zu meinem Hub', url: d.appUrl }),
        text: `Hallo ${d.name},\n\ndanke für dein Goalsforce Pro-Abo${d.amount ? ` (${d.amount})` : ''}! Pro ist jetzt freigeschaltet.\n\nKündigen kannst du jederzeit unter „Konto & Mitgliedschaft“.\n\n${d.appUrl}\n\nViele Grüße\nDragos von Goalsforce`,
      };
    case 'cancel_confirm':
      return {
        subject: 'Bestätigung deiner Kündigung',
        html: wrap('Deine Kündigung ist eingegangen', [
          p(`Hallo ${n},`),
          p(`hiermit bestätigen wir den Eingang deiner Kündigung für <strong>${esc(d.plan || 'Pro')}</strong>.`),
          p(d.until ? `Dein Zugang bleibt bis zum <strong>${esc(d.until)}</strong> aktiv. Danach wechselst du automatisch zu Free – deine Daten bleiben erhalten.` : 'Danach wechselst du automatisch zu Free – deine Daten bleiben erhalten.'),
          p('Schade, dass du gehst! Wenn du magst, antworte kurz, was wir besser machen können.'),
        ].join('')),
        text: `Hallo ${d.name},\n\nwir bestätigen den Eingang deiner Kündigung für ${d.plan || 'Pro'}.${d.until ? ` Dein Zugang bleibt bis zum ${d.until} aktiv.` : ''} Danach wechselst du zu Free, deine Daten bleiben erhalten.\n\nViele Grüße\nDragos von Goalsforce`,
      };
    case 'password_reset':
      return {
        subject: 'Dein Link zum Zurücksetzen des Passworts',
        html: wrap('Passwort zurücksetzen', [
          p(`Hallo ${n},`),
          p('du hast ein neues Passwort angefordert. Der Link ist 60 Minuten gültig.'),
          p('Wenn du das nicht warst, ignoriere diese E-Mail – dein Passwort bleibt unverändert.'),
        ].join(''), { label: 'Neues Passwort festlegen', url: d.resetUrl || d.appUrl }),
        text: `Hallo ${d.name},\n\nhier kannst du ein neues Passwort festlegen (60 Minuten gültig):\n${d.resetUrl}\n\nWenn du das nicht warst, ignoriere diese E-Mail.\n\nViele Grüße\nDragos von Goalsforce`,
      };
    case 'payment_failed':
      return {
        subject: 'Zahlung fehlgeschlagen – bitte Zahlungsmethode prüfen',
        html: wrap('Deine Zahlung hat nicht geklappt', [
          p(`Hallo ${n},`),
          p('die letzte Zahlung für dein Pro-Abo ist fehlgeschlagen. Bitte prüfe deine Zahlungsmethode unter „Konto & Mitgliedschaft“, damit Pro aktiv bleibt.'),
        ].join(''), { label: 'Zahlungsmethode prüfen', url: d.appUrl }),
        text: `Hallo ${d.name},\n\ndie letzte Zahlung für dein Pro-Abo ist fehlgeschlagen. Bitte prüfe deine Zahlungsmethode unter „Konto & Mitgliedschaft“.\n\n${d.appUrl}`,
      };
  }
}
