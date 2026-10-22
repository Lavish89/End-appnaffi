# Änderungen – 22.10.2026

## Neu: Startseite, Community, Jobbörse, Feedback, Glücksrad, 100 neue Werkzeuge
- **Startseite** (Standard nach dem Login): persönliche Vorschläge (nächster Schritt, nächste Lektion, Jobs in deiner Nische …), Hinweise (überfällige Aufgaben, Link-Limit, Zahlungsprobleme, Kündigung, Pro-Bonus), neueste Community-Nachrichten und Jobs, Benachrichtigungen, Glücksrad, Feedback-Button.
- **Benachrichtigungen** mit Glocke im Header: Erwähnungen (@Vorname), neue Bewerbungen, Zu-/Absagen, Antworten auf Feedback, neue Abzeichen, Ankündigungen des Admins.
- **Community-Chat** mit 5 Kanälen (Allgemein, Anfänger-Fragen, Erfolge, Partnerprogramme, Content & Feedback), Regeln, Melden (ab 3 Meldungen automatisch ausgeblendet), eigene Nachrichten löschen, Schutz vor Spam (Tempo-Limit, max. 2 Links).
- **Jobbörse für Influencer:** Jobs einstellen (bezahlte Kooperation, Produkt gegen Beitrag, Affiliate-Partnerschaft, UGC-Auftrag, Gesuch), filtern nach Art/Plattform/Stichwort, bewerben (mit ausdrücklicher Freigabe der E-Mail-Adresse), Bewerbungen annehmen/absagen, Jobs schließen/löschen/melden.
- **Feedback:** Idee, Fehler, Lob mit Sternebewertung; eigene Historie mit Antworten.
- **Glücksrad:** einmal am Tag kostenlos, ohne Einsatz; Gewinne: Punkte (Level), Abzeichen, Profi-Tipps oder 1–3 Tage Pro. Das Ergebnis bestimmt der Server per kryptografischem Zufall (Verteilung getestet).
- **Admin „Feedback & Community“:** Feedback beantworten und Status setzen, gemeldete Inhalte löschen oder freigeben, Ankündigungen an alle schicken, Kennzahlen.
- **100 neue Werkzeuge (jetzt 150):** Influencer & Creator (15), Social Media (12), Texte (14), SEO & Web (12), E-Commerce (12), Finanzen (12), Produktivität (11), Daten & Umwandlung (12) – in `src/data/moreTools.ts`.
- Server: `server-community.ts` (läuft auch in der Testversion), Speicher `server-kv.ts` unter `data/community/`.

## Neu: Mitgliedschaften (Free & Pro, monatlich/jährlich)
- **Free:** bis 10 Links, 5 fertige Automationen, Lernbereich, Toolkit, CSV-Export. **Pro:** unbegrenzte Links, alle 10 Automationen, eigene Regeln, KI-Entwürfe, Link-Prüfung. Admins haben immer Pro.
- Vorschlagspreise 9,90 €/Monat bzw. 99 €/Jahr – im Admin-Bereich änderbar, ebenso Testtage und Preishinweis.
- **Bezahlung über Stripe Checkout** (Karte, PayPal, SEPA, Klarna, Apple/Google Pay – je nach Freischaltung in Stripe), Webhook mit Signaturprüfung, Kundenportal für Zahlungsmethode und Rechnungen (`server-billing.ts`).
- Limits werden auch serverseitig geprüft (402), nicht nur in der Oberfläche.
- **Rechtliches DE:** Bestell-Button „Zahlungspflichtig abonnieren“ erst nach Zustimmung zu AGB/Widerruf; Kündigung über „Verträge hier kündigen“ → „Jetzt kündigen“ mit Eingangszeitpunkt und Bestätigung per E-Mail; Kündigung zurücknehmen; AGB um Abo-Bedingungen ergänzt.
- Admin: Pro kostenlos vergeben/entziehen, Übersicht mit Pro-Mitgliedern sowie Monats- und Jahresabos.

## Login verbessert
- Registrierung mit freiwilligen Angaben: Land, wichtigster Kanal, Erfahrung, Nische, „Wie gefunden?“, Newsletter-Einwilligung. Profil später unter „Konto & Mitgliedschaft“ bearbeitbar.
- **Anmelden mit Google und Facebook** (`server-oauth.ts`), aktiv sobald die Zugangsdaten in `.env` stehen. Konten werden über die bestätigte E-Mail verknüpft.
- **Passwort vergessen** mit Link per E-Mail (60 Minuten gültig, einmalig nutzbar; die Antwort verrät nicht, ob eine E-Mail existiert).
- Neue Kontoseite mit Profil, Mitgliedschaft und Sicherheit.

## E-Mails
- Willkommen/Danke für die Registrierung, Danke für das Pro-Abo, Kündigungsbestätigung, Zahlung fehlgeschlagen, Passwort zurücksetzen (`mail-templates.ts`, Versand über Resend in `server-mail.ts`). Ohne API-Schlüssel werden E-Mails nur protokolliert; der Admin sieht das Protokoll.

## Werbeseite
- Neue öffentliche Startseite (`src/landing/Landing.tsx`): Hero mit Anmeldung, echte Kennzahlen (50 Werkzeuge, 10 Automationen, 10 Lektionen, 12 Netzwerke), „In drei Schritten“, Funktionen, Preise mit Monats-/Jahresumschalter und Vergleichstabelle, FAQ, Abschluss-Aufruf, Footer mit Impressum, Datenschutz, AGB.

## Einrichten für den echten Betrieb
Alle neuen Schlüssel stehen in `.env.example` (APP_URL, STRIPE_*, RESEND_API_KEY, MAIL_FROM, GOOGLE_*, FACEBOOK_*). Den Status siehst du im Admin-Bereich unter „Integrationen“.

## Neu: Voller Admin-Zugriff für dragosserbu6@gmail.com
- Diese E-Mail (Groß-/Kleinschreibung egal) bekommt **immer** volle Admin-Rechte – egal, wann sie registriert wird. Alle anderen Konten sind Mitglieder. Die frühere Regel „erstes Konto wird Inhaber“ gilt nur noch, wenn `OWNER_EMAIL` leer gesetzt wird.
- Ein bestehendes Konto mit dieser E-Mail wird beim Serverstart und beim Login automatisch zum Admin.
- Das Haupt-Admin-Konto kann nicht herabgestuft, gesperrt oder gelöscht werden und darf sich auch bei geschlossener Registrierung registrieren.
- **Nutzerverwaltung** (Tab „Admin: Nutzer“, `src/components/AdminUsers.tsx`, `server-admin.ts`): Übersicht (Konten, Admins, Mitglieder, neu in 7 Tagen, gesperrt), Suche, pro Nutzer Links/Klicks/Einnahmen und letzte Anmeldung; weitere Admins ernennen, sperren/entsperren, Passwort zurücksetzen (zufälliges Passwort, einmal angezeigt), Konto löschen mit E-Mail-Bestätigung, Registrierung öffnen/schließen.
- Änderbar über `OWNER_EMAIL` in `.env`.
- **Wichtig:** Es gibt noch keine E-Mail-Bestätigung. Registriere dich deshalb direkt nach dem Deployment mit deiner Adresse, bevor du den Link teilst.

## Neu: Tutorials für Anfänger
- **Geführte Tour** (8 Schritte) startet beim ersten Öffnen des Affiliate-Hubs und wechselt dabei in die passenden Bereiche. Jederzeit unter Einstellungen neu startbar.
- **Lernbereich** mit 10 Lektionen (Start → Fortgeschritten): Was ist Affiliate-Marketing, Nische, erstes Partnerprogramm, erster Link, Kennzeichnung, Inhalte, Zahlen auswerten, Automationen, Gewerbe & Steuern, typische Fehler. Jede Lektion mit Schritt-für-Schritt-Anleitung, „Jetzt ausprobieren“-Button und Quizfrage; Fortschrittsbalken.
- **Hilfetexte** oben in jedem Bereich (ausblendbar).
- **Marketing-Toolkit:** Schnellstart mit drei Einsteiger-Werkzeugen; alle Text-Werkzeuge haben jetzt Beispieltexte.
- Inhalte: `src/affiliate/tutorials.ts`.

## Getestet
Automatischer Browsertest mit 32 Prüfungen (Login/Registrierung inkl. Fehlerfälle, alle 19 Cockpit-Tabs, Tour, Lektionen, Programme, Links, Entwürfe, Einnahmen, Aufgaben, Automationen, Rechtliches, Sicherung, alle 50 Toolkit-Werkzeuge, Mitglieder-Sperre, Passwort ändern): alle bestanden, keine JS-Fehler. Zusätzlich Tests für Server-Login, Kurzlinks und Automations-Engine.

## Neu: Öffentliche Version mit Affiliate-Hub
Jeder kann sich registrieren und mit Affiliate-Links für fremde Produkte Provision verdienen.

- **Rollen:** Das erste Konto ist Inhaber und sieht alles. Alle weiteren Konten sind Mitglieder und sehen nur ihren eigenen Affiliate-Hub und das Marketing-Toolkit. Das Shop-Cockpit ist für Mitglieder gesperrt, auch serverseitig (403).
- **Startseite:** Login-Seite mit den Vorteilen für neue Nutzer.
- **Affiliate-Hub** (`src/affiliate/`): Übersicht mit Kennzahlen und Monatsdiagramm, Links, Partnerprogramme mit Verzeichnis von 12 Netzwerken, Einnahmen mit CSV-Export, Automationen, Entwürfe (5 Kanäle, auch per KI), Aufgaben, Rechts-Checkliste, Einstellungen mit Sicherung.
- **Kurzlinks mit Klickzählung:** `/go/<nutzer>/<kurzname>` leitet auf den Affiliate-Link weiter und zählt Klicks (Bots werden nicht gezählt, nur http/https-Ziele, pausierte Links sind aus).
- **Link-Prüfung:** prüft, ob ein Ziel-Link erreichbar ist (nur öffentliche Adressen).
- **Automationen:** 10 fertige Rezepte (SubID anhängen, Social-Posts mit Kennzeichnung, Wochenbericht, Auszahlung nachverfolgen, Top-Link markieren, ungenutzte Links aufräumen/pausieren, 1.000-Klick-Meilenstein, Newsletter-Entwurf, Erfahrungsbericht planen) und ein Baukasten für eigene Regeln. Alles wird protokolliert.
- **Rechtlich sauber:** Kennzeichnung „Anzeige“/„Werbung“ und der Amazon-Pflichthinweis werden automatisch in Entwürfe eingefügt.
- Server: `server-workspace.ts` (Daten pro Nutzer in `data/workspaces/`, Klicks in `data/clicks/`).

## Neu: Registrierung & Login
- Login- und Registrierungsseite im Design der App (`src/auth/AuthGate.tsx`), Kontomenü oben rechts mit Passwort ändern und Abmelden.
- Server (`server-auth.ts`): Passwörter mit scrypt + Salt gehasht, Sitzung als HttpOnly-Cookie (7 Tage), Schutz vor Passwort-Raten (10 Versuche / 15 Min.), alle `/api`-Endpunkte nur noch mit Anmeldung.
- Das erste Konto wird **Inhaber**. Mit `ALLOW_REGISTRATION=false` ist die Registrierung danach geschlossen.
- Konten liegen in `data/users.json` (in `.gitignore`). Auf Cloud Run ist dieser Ordner flüchtig – für Dauerbetrieb eine Datenbank anbinden.
- „Passwort vergessen“ verweist auf den Inhaber, weil noch kein E-Mail-Versand eingerichtet ist.

## Neu: Testversion ohne Server (`web-build/`)
- `node web-build/build.mjs <pfad-zu-esbuild> <ausgabe.html>` baut die komplette App als eine HTML-Seite. Die Server-Logik aus `server.ts` läuft dabei im Browser; Konten werden nur im Browser gespeichert.

## Neu: Marketing-Toolkit (50 Werkzeuge)
Neuer Tab „Marketing-Toolkit (50)“ mit Suche und Kategorien. Alle Tools rechnen nur mit deinen Eingaben.

- **Kalkulation (10):** ROAS, Break-even-ROAS, CPA, max. CPA, Customer Lifetime Value, LTV:CAC, Deckungsbeitrag pro Bestellung, Rabatt-Auswirkung, Werbebudget-Planer, Influencer-Kalkulator
- **Werbeanzeigen (8):** CTR, CPC & CPM, Conversion-Rate, Funnel-Simulator, A/B-Test-Signifikanz, A/B-Test-Stichprobe, Frequenz-Check, Budget-Aufteilung 70/20/10
- **SEO (8):** Meta-Title-Prüfer, Meta-Description-Prüfer, URL-Slug, Keyword-Dichte, Lesbarkeit (Flesch DE), Google-Vorschau, Produkt-Schema (JSON-LD), Alt-Texte
- **Content & Social (10):** Hashtags, Video-Hooks, Caption-Längen-Check, 30-Tage-Content-Kalender, Posting-Aufwand, AIDA-Text, PAS-Text, Merkmal→Nutzen, Text-Bereiniger, KI-Werbetext (Gemini)
- **E-Mail (6):** Betreffzeilen-Generator, Betreffzeilen-Check, Warenkorbabbruch-Serie, Willkommens-Serie, E-Mail-Kennzahlen, Listenwachstum
- **Conversion & Preise (5):** Preisschwellen, Versandkostenfrei-Schwelle, Bundle-Preis, Gutscheincodes, Bewertungs-Anfrage
- **Tracking & Planung (3):** UTM-Link-Builder, Kampagnen-Namensschema, Umsatzziel rückwärts

Dateien: `src/data/marketingTools.ts` (Logik), `src/components/MarketingToolkit.tsx` (Oberfläche).

## Fehler & Risiken behoben
- **Impressum/Datenschutz/AGB in der App:** Erfundene Firma („Aura Studio GmbH“, Fantasie-HRB, -USt-ID, -LUCID-, -WEEE-Nummer) entfernt und durch deine echten Betreiberdaten aus dem Shopify-Impressum ersetzt. Falsche Versprechen (30 Tage Widerruf, Lager Frankfurt, Zahlungsarten) entfernt, Links auf die Rechtstexte im Shop ergänzt. § 5 TMG → § 5 DDG. Veralteter Link zur EU-OS-Plattform entfernt.
- **Gefälschte APK entfernt:** Die Datei war ein 3-KB-Platzhalter ohne Code. Der Button installiert jetzt die Web-App (PWA).
- **Ehrliche Meldungen:** Simulierte Aktionen (Shopify-Verbindung, Sync, Theme-Veröffentlichung, Bestellung, Affiliate-Auszahlung) melden jetzt „Demo“ statt Erfolg. Neue Demo-Bestellungen sind „Ausstehend“ statt „Bezahlt“.
- **Compliance:** GPSR/LUCID werden nicht mehr automatisch als erfüllt angezeigt.
- **Demo-Hinweis** oben in der App.

## Sicherheit & Kosten
- KI-Endpunkte: Rate-Limit pro IP (Standard 10/Minute, `AI_RATE_LIMIT_PER_MIN`).
- Eingaben für KI-Prompts werden gekürzt (Kosten, Prompt-Injection).
- Request-Größe auf 100 KB begrenzt, Sicherheitsheader ergänzt.
- Bestellungen: Preise und Mengen werden serverseitig geprüft.

## Performance
- 9 Produktbilder komprimiert: 6,2 MB → 1,1 MB (gleiche Auflösung).
- Dashboard auf `noindex` gesetzt (interne App mit Demo-Daten gehört nicht in Google).

## Offen (nicht im Code lösbar)
- Shop-Impressum enthält noch Platzhalter `[[INSERT …]]`; Rechtstexte sind auf Englisch.
- Shopify, Bestellungen, Affiliates und Werbe-Autopilot sind weiterhin simuliert. Echte Anbindung braucht die Shopify Admin API mit Access Token.
- `npm install`/Build konnte in dieser Umgebung nicht laufen (Registry gesperrt). Syntax beider Teile mit esbuild geprüft, Toolkit-Logik mit strenger TypeScript-Prüfung und allen 50 Tools getestet. Bitte einmal `npm install && npm run lint && npm run build` ausführen.
