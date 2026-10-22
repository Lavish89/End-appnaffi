// E-Mail-Versand ueber die Resend-API (https://resend.com). Ohne RESEND_API_KEY werden E-Mails
// nur protokolliert (data/mail-log.json), damit die App auch ohne Versand funktioniert.
import fs from 'fs';
import path from 'path';
import { renderMail, MailKind, MailData } from './mail-templates';

export interface MailLogEntry { at: string; to: string; kind: MailKind; subject: string; status: 'sent' | 'logged' | 'failed'; error?: string; html: string }
export interface Mailer {
  configured: boolean;
  send: (to: string, kind: MailKind, data: Omit<MailData, 'appUrl'> & { appUrl?: string }) => Promise<void>;
  log: () => MailLogEntry[];
}

export function createMailer(dataDir: string): Mailer {
  const key = process.env.RESEND_API_KEY || '';
  const from = process.env.MAIL_FROM || 'Goalsforce <onboarding@resend.dev>';
  const appUrl = process.env.APP_URL || '';
  const file = path.join(dataDir, 'mail-log.json');
  const read = (): MailLogEntry[] => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; } };
  const write = (e: MailLogEntry) => {
    fs.mkdirSync(dataDir, { recursive: true });
    // Passwort-Links nicht dauerhaft speichern
    const safe = e.kind === 'password_reset' ? { ...e, html: '(Link aus Sicherheitsgründen nicht gespeichert)' } : e;
    fs.writeFileSync(file, JSON.stringify([safe, ...read()].slice(0, 200)), { mode: 0o600 });
  };

  return {
    configured: Boolean(key),
    log: read,
    async send(to, kind, data) {
      const m = renderMail(kind, { appUrl, ...data } as MailData);
      const entry: MailLogEntry = { at: new Date().toISOString(), to, kind, subject: m.subject, status: 'logged', html: m.html };
      if (key) {
        try {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to: [to], subject: m.subject, html: m.html, text: m.text }),
          });
          if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
          entry.status = 'sent';
        } catch (e: any) {
          entry.status = 'failed';
          entry.error = e?.message || 'Versand fehlgeschlagen';
          console.error('[mail]', entry.error);
        }
      }
      write(entry);
    },
  };
}
