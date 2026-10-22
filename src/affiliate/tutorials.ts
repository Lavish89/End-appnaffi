// Inhalte fuer Anfaenger: gefuehrte Tour, Lernbereich mit Lektionen und kurze Hilfetexte je Bereich.
// Allgemeine Hinweise fuer Deutschland – keine Rechts- oder Steuerberatung.

export type HubTab = 'overview' | 'learn' | 'links' | 'programs' | 'earnings' | 'automations' | 'drafts' | 'tasks' | 'legal' | 'settings';

export interface TourStep {
  tab: HubTab;
  title: string;
  text: string;
}

export const TOUR: TourStep[] = [
  { tab: 'overview', title: 'Willkommen im Affiliate-Hub 👋', text: 'Hier verdienst du Provision, indem du Produkte anderer Firmen empfiehlst. Kauft jemand über deinen Link, bekommst du einen Anteil. Diese Tour zeigt dir in 2 Minuten, wie alles zusammenhängt.' },
  { tab: 'overview', title: 'Deine Übersicht', text: 'Oben siehst du Einnahmen, Klicks und den Verdienst pro Klick. Die „Ersten Schritte“ führen dich der Reihe nach durch alles Wichtige.' },
  { tab: 'programs', title: '1. Partnerprogramm wählen', text: 'Bevor du Links bekommst, meldest du dich bei einem Partnerprogramm an, z. B. Amazon oder AWIN. Unten findest du ein Verzeichnis. Mit „Übernehmen“ trägst du es hier ein.' },
  { tab: 'links', title: '2. Link anlegen', text: 'Kopiere deinen Affiliate-Link aus dem Partnerprogramm und füge ihn hier ein. Du bekommst einen kurzen, eigenen Link, der Klicks zählt.' },
  { tab: 'automations', title: '3. Automationen arbeiten für dich', text: 'Sobald du einen Link anlegst, erstellen die Automationen Post-Entwürfe mit Werbekennzeichnung, hängen eine SubID an und erinnern dich an Aufgaben. Du kannst jede einzeln an- oder ausschalten.' },
  { tab: 'drafts', title: '4. Posten', text: 'Hier liegen deine fertigen Texte. Kopieren, anpassen, auf Instagram, TikTok oder im Blog veröffentlichen. Die Kennzeichnung „Anzeige“ ist schon drin.' },
  { tab: 'earnings', title: '5. Provision eintragen', text: 'Wenn dein Partnerprogramm einen Verkauf meldet, trägst du die Provision hier ein. So siehst du, welche Links sich lohnen.' },
  { tab: 'learn', title: 'Lernen in deinem Tempo', text: 'Im Bereich „Lernen“ warten 10 kurze Lektionen mit Mini-Quiz – von „Was ist Affiliate-Marketing?“ bis zu Steuern. Viel Erfolg!' },
];

export interface Lesson {
  id: string;
  level: 'Start' | 'Grundlagen' | 'Fortgeschritten';
  minutes: number;
  title: string;
  intro: string;
  steps: string[];
  tryIt?: { tab: HubTab; label: string };
  quiz: { q: string; options: string[]; correct: number; explain: string };
}

export const LESSONS: Lesson[] = [
  {
    id: 'basics', level: 'Start', minutes: 3, title: 'Was ist Affiliate-Marketing?',
    intro: 'Du empfiehlst ein Produkt mit einem persönlichen Link. Kauft jemand darüber, zahlt der Händler dir eine Provision. Für den Käufer ändert sich der Preis nicht.',
    steps: [
      'Händler bieten über Partnerprogramme (Netzwerke) Provisionen an.',
      'Du bekommst nach der Anmeldung persönliche Links.',
      'Ein Cookie merkt sich für einige Tage, dass der Käufer von dir kam.',
      'Kauft er in dieser Zeit, wird die Provision dir gutgeschrieben – meist erst „offen“, später „bestätigt“ und dann „ausgezahlt“.',
    ],
    quiz: { q: 'Wer bezahlt die Provision?', options: ['Der Käufer zahlt einen Aufpreis', 'Der Händler', 'Die Plattform Instagram'], correct: 1, explain: 'Der Händler zahlt dir einen Anteil am Umsatz. Der Käufer zahlt den normalen Preis.' },
  },
  {
    id: 'niche', level: 'Start', minutes: 4, title: 'Die richtige Nische finden',
    intro: 'Eine Nische ist ein klares Thema mit klarer Zielgruppe, z. B. „Fitness in kleinen Wohnungen“. Je klarer, desto leichter findest du passende Produkte und Leser.',
    steps: [
      'Wähle ein Thema, über das du auch in einem Jahr noch gern sprichst.',
      'Prüfe, ob es Produkte mit Partnerprogramm gibt (Verzeichnis unter „Partnerprogramme“).',
      'Schau, ob Menschen Fragen dazu stellen (Suchvorschläge bei Google, Kommentare bei YouTube).',
      'Trag deine Nische unter „Einstellungen“ ein – sie fließt dann in deine Entwürfe ein.',
    ],
    tryIt: { tab: 'settings', label: 'Nische eintragen' },
    quiz: { q: 'Welche Nische ist für den Start am besten?', options: ['„Alles rund ums Leben“', '„Home-Workout für Berufstätige mit wenig Platz“', '„Produkte“'], correct: 1, explain: 'Eine klare Zielgruppe mit einem konkreten Problem macht Empfehlungen glaubwürdig.' },
  },
  {
    id: 'program', level: 'Start', minutes: 5, title: 'Beim ersten Partnerprogramm anmelden',
    intro: 'Für den Anfang reicht ein Programm. Amazon ist einfach, Netzwerke wie AWIN bieten viele Marken.',
    steps: [
      'Öffne „Partnerprogramme“ und wähle ein Netzwerk aus dem Verzeichnis.',
      'Tippe auf „Anmelden“ und erstelle dort dein Publisher-Konto. Gib deine Website oder dein Social-Profil an.',
      'Lies die Programmregeln – z. B. ob Werbung über Google Ads erlaubt ist.',
      'Trag das Programm hier ein (Status „beworben“) und setze es auf „aktiv“, sobald du freigeschaltet bist.',
    ],
    tryIt: { tab: 'programs', label: 'Programm eintragen' },
    quiz: { q: 'Was brauchst du meist für die Anmeldung bei einem Netzwerk?', options: ['Eine Website oder ein Social-Profil', 'Ein Gewerbe mit Mitarbeitern', 'Nichts, man wird sofort freigeschaltet'], correct: 0, explain: 'Netzwerke wollen sehen, wo du die Produkte bewirbst.' },
  },
  {
    id: 'link', level: 'Grundlagen', minutes: 3, title: 'Deinen ersten Link anlegen',
    intro: 'Im Partnerprogramm erzeugst du einen Affiliate-Link zu einem Produkt. Hier machst du daraus einen kurzen Link, der Klicks zählt.',
    steps: [
      'Kopiere den Affiliate-Link aus dem Partnerprogramm (er enthält deine Partner-ID).',
      'Öffne „Links“, gib einen Namen ein und füge den Link ein.',
      'Die Automationen hängen eine SubID an und erstellen Post-Entwürfe.',
      'Kopiere deinen Kurzlink und nutze ihn in Bio, Story oder Blog.',
    ],
    tryIt: { tab: 'links', label: 'Link anlegen' },
    quiz: { q: 'Wozu dient die SubID?', options: ['Sie macht den Link schneller', 'Du siehst im Partnerprogramm, welcher Link verkauft hat', 'Sie ist für Google'], correct: 1, explain: 'Mit SubIDs erkennst du im Netzwerk-Bericht, welcher deiner Links den Verkauf gebracht hat.' },
  },
  {
    id: 'disclosure', level: 'Grundlagen', minutes: 3, title: 'Werbung richtig kennzeichnen',
    intro: 'In Deutschland musst du Affiliate-Links als Werbung kennzeichnen. Das schützt dich vor Abmahnungen und schafft Vertrauen.',
    steps: [
      'Schreib „Anzeige“ oder „Werbung“ deutlich an den Anfang des Beitrags.',
      'Markiere Links mit * und erkläre kurz, dass du eine Provision bekommst.',
      'Bei Amazon ist der Satz „Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.“ Pflicht.',
      'Deine Entwürfe enthalten diese Hinweise automatisch – lösch sie nicht heraus.',
    ],
    tryIt: { tab: 'legal', label: 'Checkliste öffnen' },
    quiz: { q: 'Reicht der Hashtag #ad ganz am Ende vieler Hashtags?', options: ['Ja, das reicht', 'Nein, die Kennzeichnung muss deutlich und am Anfang stehen', 'Kennzeichnung ist nicht nötig'], correct: 1, explain: 'Versteckte Hinweise gelten oft als nicht ausreichend. Deutlich und am Anfang ist sicher.' },
  },
  {
    id: 'content', level: 'Grundlagen', minutes: 5, title: 'Inhalte, die verkaufen',
    intro: 'Menschen kaufen, wenn sie dir vertrauen. Ehrliche Erfahrungen wirken besser als Werbesprüche.',
    steps: [
      'Zeig das Produkt in Benutzung und nenne auch Nachteile.',
      'Beantworte eine konkrete Frage: „Lohnt sich X für kleine Wohnungen?“',
      'Nutze die Vorlagen unter „Entwürfe“ als Startpunkt und schreib sie in deinen Worten um.',
      'Poste regelmäßig – lieber 3 gute Beiträge pro Woche als 10 schnelle.',
    ],
    tryIt: { tab: 'drafts', label: 'Entwurf erstellen' },
    quiz: { q: 'Was baut am meisten Vertrauen auf?', options: ['Nur Vorteile nennen', 'Ehrliche Erfahrung mit Vor- und Nachteilen', 'Möglichst viele Links pro Beitrag'], correct: 1, explain: 'Wer auch Schwächen nennt, wirkt glaubwürdig – und Leser kaufen eher.' },
  },
  {
    id: 'numbers', level: 'Grundlagen', minutes: 4, title: 'Provisionen eintragen und auswerten',
    intro: 'Nur wer misst, weiß, was funktioniert. Die wichtigste Zahl ist der Verdienst pro Klick (EPC).',
    steps: [
      'Schau einmal pro Woche in dein Partner-Dashboard.',
      'Trag neue Provisionen unter „Einnahmen“ ein und wähle den Link aus.',
      'Setze den Status später auf „bestätigt“ oder „ausgezahlt“.',
      'Vergleiche in „Links“ Klicks und Provision: Mehr Content für Links mit hohem Verdienst pro Klick.',
    ],
    tryIt: { tab: 'earnings', label: 'Provision eintragen' },
    quiz: { q: 'Link A: 100 Klicks, 10 €. Link B: 1.000 Klicks, 20 €. Welcher hat den höheren Verdienst pro Klick?', options: ['Link A (0,10 €)', 'Link B (0,02 €)', 'Beide gleich'], correct: 0, explain: '10 € / 100 = 0,10 € pro Klick. Link A ist effizienter – dort lohnt sich mehr Reichweite.' },
  },
  {
    id: 'automation', level: 'Fortgeschritten', minutes: 4, title: 'Automationen sinnvoll nutzen',
    intro: 'Automationen nehmen dir Routine ab: Entwürfe, Erinnerungen, Berichte. Du bleibst trotzdem verantwortlich für das, was du postest.',
    steps: [
      'Lass die Standard-Automationen an: SubID, Social-Posts, Wochenbericht, Auszahlung nachverfolgen.',
      'Schalte „Ungenutzte Links aufräumen“ ein, sobald du mehr als 10 Links hast.',
      'Bau eigene Regeln, z. B. „Wenn ein Link 100 Klicks hat → Aufgabe: Story posten“.',
      'Schau ins Protokoll, um zu sehen, was automatisch passiert ist.',
    ],
    tryIt: { tab: 'automations', label: 'Automationen ansehen' },
    quiz: { q: 'Darf eine Automation Beiträge ohne deine Prüfung veröffentlichen?', options: ['Ja, immer', 'Hier werden nur Entwürfe erstellt – du prüfst und postest selbst', 'Nur bei Amazon'], correct: 1, explain: 'Der Hub erstellt Entwürfe. Veröffentlichen tust du selbst – so bleibt alles korrekt und ehrlich.' },
  },
  {
    id: 'tax', level: 'Fortgeschritten', minutes: 3, title: 'Gewerbe und Steuern – die Basics',
    intro: 'Wer regelmäßig Provisionen verdient, ist in Deutschland in der Regel gewerblich tätig.',
    steps: [
      'Gewerbe beim Gewerbeamt deiner Stadt anmelden (meist online, kleine Gebühr).',
      'Das Finanzamt schickt dir den Fragebogen zur steuerlichen Erfassung.',
      'Prüfe mit Steuerberatung, ob die Kleinunternehmerregelung für dich passt.',
      'Exportiere deine Einnahmen regelmäßig als CSV (unter „Einnahmen“).',
    ],
    tryIt: { tab: 'earnings', label: 'CSV-Export ansehen' },
    quiz: { q: 'Was solltest du bei regelmäßigen Provisionen tun?', options: ['Nichts, das ist privat', 'Gewerbe anmelden und Einnahmen angeben', 'Nur ab 100.000 € melden'], correct: 1, explain: 'Regelmäßige Provisionen sind meist gewerbliche Einnahmen. Im Zweifel Steuerberatung fragen.' },
  },
  {
    id: 'mistakes', level: 'Fortgeschritten', minutes: 3, title: '7 typische Anfängerfehler',
    intro: 'Diese Fehler kosten am meisten Zeit und Geld – und lassen sich leicht vermeiden.',
    steps: [
      'Zu viele Programme auf einmal – starte mit einem.',
      'Produkte bewerben, die du nicht kennst.',
      'Keine Werbekennzeichnung.',
      'Nur Links posten statt hilfreicher Inhalte.',
      'Nicht messen, was funktioniert.',
      'Nach zwei Wochen aufgeben – Affiliate braucht oft Monate.',
      'Programmregeln ignorieren (z. B. Markenbegriffe in Anzeigen).',
    ],
    quiz: { q: 'Wie lange dauert es oft bis zu spürbaren Einnahmen?', options: ['1–2 Tage', 'Oft mehrere Monate', 'Nie'], correct: 1, explain: 'Vertrauen und Reichweite wachsen langsam. Dranbleiben lohnt sich.' },
  },
];

export const TAB_HELP: Record<HubTab, string> = {
  overview: 'Deine wichtigsten Zahlen auf einen Blick. Folge den „Ersten Schritten“, wenn du neu bist.',
  learn: 'Kurze Lektionen für Anfänger. Jede endet mit einer Quizfrage – so merkst du dir das Wichtigste.',
  links: 'Füge hier den Link aus deinem Partnerprogramm ein. Du bekommst einen Kurzlink, der Klicks zählt. Tipp: ein Link pro Produkt und Kanal.',
  programs: 'Trag die Partnerprogramme ein, bei denen du angemeldet bist. Noch keins? Wähle unten ein Netzwerk und tippe auf „Anmelden“.',
  earnings: 'Trag Provisionen aus deinem Partner-Dashboard ein. „Offen“ = gemeldet, „bestätigt“ = sicher, „ausgezahlt“ = auf dem Konto.',
  automations: 'Automationen erledigen Routine, sobald etwas passiert – z. B. ein neuer Link. Schalte sie mit dem Schalter an oder aus.',
  drafts: 'Fertige Texte für deine Beiträge. Kopieren, in deinen Worten anpassen, posten. Die Werbekennzeichnung ist schon enthalten.',
  tasks: 'Deine To-dos. Viele entstehen automatisch, z. B. die Erinnerung, eine Auszahlung zu prüfen.',
  legal: 'Das Wichtigste, damit du rechtlich sauber startest. Hake ab, was erledigt ist.',
  settings: 'Dein Name, deine Nische und wie Hinweise formuliert werden. Hier kannst du die Tour erneut starten.',
};
