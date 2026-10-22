# Goalsforce online stellen und als App installieren

Diese Anleitung bringt die App auf **Render** (Server in Frankfurt). Danach kannst du sie auf jedem Handy wie eine App installieren.

## Was du brauchst
- Ein **GitHub**-Konto mit dem Repository `Lvish89/Dragos-Serbu`
- Ein **Render**-Konto (render.com, Anmeldung mit GitHub geht am schnellsten)
- Einen bezahlten Render-Instanztyp: Der dauerhafte Speicher für Konten und Daten funktioniert nicht mit dem Free-Plan. Rechne mit ca. 7 $ im Monat für die kleinste Instanz plus 0,25 $ pro GB Speicher (1 GB reicht für den Anfang). Aktuelle Preise: render.com/pricing

## Schritt 1 – Code auf GitHub hochladen
1. Entpacke `Dragos-Serbu-verbessert.zip` auf deinem Computer.
2. Öffne dein Repository auf github.com → **Add file → Upload files**.
3. Zieh **den Inhalt** des Ordners `Dragos-Serbu-main` hinein (nicht den Ordner selbst, nicht `node_modules`).
4. Unten **Commit changes** klicken.

## Schritt 2 – Bei Render anlegen
1. Auf render.com: **New → Blueprint**.
2. Repository `Dragos-Serbu` auswählen. Render liest die Datei `render.yaml` und schlägt den Dienst „goalsforce“ vor.
3. Render fragt nach den Werten mit „sync: false“. Für den Start reichen:
   - `GEMINI_API_KEY` – aus Google AI Studio (für KI-Texte; leer lassen geht auch)
   - `APP_URL` – erst mal leer lassen
   - Alles andere (Stripe, Resend, Google, Facebook) kannst du später nachtragen.
4. Instanztyp **Starter** (oder größer) wählen und **Apply** klicken.
5. Warte, bis der Status **Live** ist (ein paar Minuten). Render zeigt dir die Adresse, z. B. `https://goalsforce.onrender.com`.
6. Trag diese Adresse unter **Environment → APP_URL** ein und speichere (Render startet neu).

## Schritt 3 – Sofort als Admin registrieren
Öffne die Adresse und registriere dich **sofort** mit `dragosserbu6@gmail.com`. Dieses Konto ist automatisch Admin. Erst danach den Link weitergeben.

## Schritt 4 – Auf dem Handy installieren
- **Android (Chrome):** Adresse öffnen → oben „App installieren“ in der App oder Menü ⋮ → **App installieren**.
- **iPhone (Safari):** Adresse öffnen → Teilen-Symbol → **Zum Home-Bildschirm**.

Die App startet dann mit eigenem Symbol und ohne Browserleiste.

## Später ergänzen (im Admin-Bereich unter „Integrationen“ siehst du den Stand)
| Funktion | Werte in Render → Environment | Zusätzlich |
|---|---|---|
| Bezahlung | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | In Stripe einen Webhook auf `<APP_URL>/api/billing/webhook` anlegen (Ereignisse: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed) |
| E-Mails | `RESEND_API_KEY`, `MAIL_FROM` | Domain bei Resend bestätigen |
| Google-Login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Redirect-URI: `<APP_URL>/api/auth/oauth/google/callback` |
| Facebook-Login | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | Redirect-URI: `<APP_URL>/api/auth/oauth/facebook/callback` |

## Eigene Domain (optional)
Render → Service → **Settings → Custom Domains**, z. B. `app.goalsforce.store`. Danach `APP_URL` auf die neue Adresse ändern.

## Wenn etwas nicht klappt
- **Build schlägt fehl:** In Render unter **Logs** nachsehen und die letzten Zeilen schicken.
- **Daten weg nach Neustart:** Prüfen, ob die Disk unter **Disks** angehängt ist und `DATA_DIR=/var/data` gesetzt ist.
