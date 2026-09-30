# Blog-Autopilot: Redaktionsbrief

Dieser Brief ist die **einzige Quelle der Wahrheit** für den automatisierten Blogbeitrag,
den `.github/workflows/blog-autopilot.yml` an jedem Werktag erzeugt. Der Workflow startet
mit leerem Kontext — alles, was für einen veröffentlichungsreifen Beitrag nötig ist, steht hier.

## Wofür wir schreiben

**Ziel ist ein gebuchtes Erstgespräch (Lead), nicht Traffic.** Mein Beamtenportal berät
Beamtinnen, Beamte, Referendare und Anwärter im öffentlichen Dienst zu Beihilfe, PKV,
Dienstunfähigkeit (DU/BU) und Pension/Altersvorsorge.

**SEO-Priorität: stark regional und auf den Berufseinstieg fokussieren.** Das ist der
Hauptwachstumshebel:

- **Bundesland-spezifische Beiträge sind Kern-Strategie, nicht Nebensache.** Beihilfesätze,
  Beihilfeverordnungen und Verbeamtungspraxis unterscheiden sich je Bundesland erheblich —
  das ergibt 16× Long-Tail-Potenzial pro bundesweitem Thema. Beispiele: „Beihilfe Bayern
  Bemessungssatz 2026", „PKV für Referendare in NRW", „Verbeamtung auf Probe
  Baden-Württemberg: Fristen & Ablauf", „Beihilfe Hessen: Was Beamte wissen müssen".
- **Referendare und Anwärter sind die profitabelste Zielgruppe** (frisch im System, noch
  keine PKV/Absicherung, hoher Beratungsbedarf) — mindestens jeder zweite Beitrag adressiert
  diese Gruppe direkt oder in Kombination mit einem Bundesland.
- Zielgruppe insgesamt: 22–45 Jahre, Referendariat/Anwärterzeit oder erste Jahre im
  Beamtenverhältnis, Wechsel von GKV zu PKV steht an oder ist gerade erfolgt, noch keine
  Dienstunfähigkeitsversicherung.

**Nicht die Zielgruppe** (dafür wird nichts geschrieben):

- Nicht-Beamte / Privatwirtschaft ohne Bezug zum öffentlichen Dienst
- Fragen ohne Beratungsbezug/kommerzielle Absicht („was ist Beihilfe" als reine
  Lexikon-Erklärung ohne Handlungsaufforderung)
- Rentennahe Beamte kurz vor Pensionierung (das ist Pension-Cluster, aber nicht der
  Beratungs-Trigger — Fokus bleibt auf Berufseinstieg/Laufbahnentscheidungen)

## Ablauf pro Lauf

1. `src/content-posts.json` UND `src/content-posts-new.json` lesen: vorhandene `slug`-Werte,
   `categories`-Verteilung und bereits behandelte Bundesländer/Themen erfassen (Duplikate und
   Kannibalisierung vermeiden — bei Themennähe lieber einen bestehenden Artikel als
   internen Link einbinden als ein Duplikat schreiben).
2. Cluster + Region für heute bestimmen (Rotation + Balance-Check unten).
3. **Thema wählen**: eine Kategorie, ein Bundesland ODER eine Persona (Referendar/Anwärter/
   junger Beamter), ein Fokus-Keyword mit kommerzieller/lokaler Suchintention
   (`<Thema> <Bundesland>`, `<Thema> für Referendare`, `<Thema> Kosten`, `<Thema> Fehler`,
   `<Thema> Checkliste`).
4. Zeitkritische Zahlen (Beihilfesätze, Beitragsbemessungsgrenzen, Freibeträge, Fristen,
   BeamtVG-Prozentsätze, Landesbeihilfeverordnungen) **immer** per WebSearch gegen eine
   amtliche/aktuelle Quelle prüfen (z. B. Landesministerium, BeamtVG-Gesetzestext). Nie aus
   dem Modellwissen übernehmen, besonders bei bundeslandspezifischen Sätzen.
5. **Hero-Bild besorgen**:
   `python3 migration/fetch_autopilot_image.py "<slug>" "<englischer Suchbegriff, z.B. german civil servant office>"`
   Ergebnis (JSON mit `featuredImage`/`featuredImageAlt`) in den Post übernehmen. Liefert das
   Skript `featuredImage: null` (kein `UNSPLASH_ACCESS_KEY` hinterlegt oder kein Treffer),
   Artikel trotzdem **ohne** Hero-Bild veröffentlichen — kein Blocker.
6. Artikel als JSON-Objekt bauen (Struktur unten) und über
   `echo '<json>' | python3 migration/add_new_post.py` an `content-posts-new.json` anhängen.
   Das Skript validiert Slug-Eindeutigkeit, Pflichtfelder und Kategorien — bei Fehlern
   korrigieren und erneut versuchen. **Niemals `content-posts.json` direkt bearbeiten** — das
   ist WordPress-Migrationsoutput und wird bei jedem `migration/build_content.py`-Lauf
   überschrieben.
7. `npm run build` muss fehlerfrei durchlaufen. Bei Fehlern beheben und neu bauen.
   **Wird der Build nicht grün, nicht committen.**
8. Optional, aber empfohlen: `python3 scripts/seo_check.py` laufen lassen und prüfen, dass
   der neue Artikel 🟢 oder 🟡 ist (nicht 🔴). Bei 🔴 vor dem Commit nachbessern.
9. Committen (Format unten), dann `git pull --rebase origin main` (falls inzwischen andere
   Commits dazukamen), dann `git push origin HEAD:main`. Vercel deployt automatisch.

## Themen-Strategie

Erlaubte `categories`-Werte ausschließlich: `Beamte`, `PKV`, `Pension`, `Referendare`, `BU`,
`DU`, `Allgemein`. Ein Artikel kann mehrere tragen (z. B. `["PKV", "Referendare"]` für „PKV
für Referendare in Bayern"), listet aber die **thematisch wichtigste zuerst** (die erste
Kategorie erscheint als Badge auf Artikelkarten).

| Cluster | Zielanteil neuer Artikel | Inhalte |
| --- | --- | --- |
| **PKV + Referendare/Anwärter** (Schwerpunkt) | **~35 %** | PKV-Wechsel GKV→PKV beim Referendariat, PKV-Tarifvergleich für Berufseinsteiger, Beihilfe+PKV-Zusammenspiel, Gesundheitsfragen bei jungen Antragstellern, PKV nach Bundesland |
| **Bundesland-Beihilfe** | **~30 %** | Beihilfebemessungssatz je Bundesland, Beihilfeverordnung-Besonderheiten, Beihilfeantrag stellen (je Bundesland unterschiedliche Stellen/Formulare) |
| **DU/BU bei Berufsanfängern** | **~20 %** | Dienstunfähigkeit in den ersten Dienstjahren, 5-Jahres-Hürde, private DU/BU für Referendare, Gesundheitsfragen-Fallen |
| **Pension/Altersvorsorge** | **~15 %** | Ruhegehaltssatz-Grundlagen für Berufseinsteiger, Versorgungslücke früh erkennen, Pension bei Beamten auf Widerruf/Probe |

`Allgemein` bekommt **keine neuen** Beiträge (Sammelkategorie für Altbestand).

### Bundesland-Rotation

Bei bundeslandspezifischen Themen reihum durch alle 16 Bundesländer rotieren (Reihenfolge
nach Einwohnerzahl, absteigend): Nordrhein-Westfalen, Bayern, Baden-Württemberg,
Niedersachsen, Hessen, Rheinland-Pfalz, Sachsen, Berlin, Schleswig-Holstein, Brandenburg,
Sachsen-Anhalt, Thüringen, Hamburg, Mecklenburg-Vorpommern, Saarland, Bremen. Prüfen, welche
Bundesländer in `content-posts.json`/`content-posts-new.json` schon behandelt wurden, und mit
dem am längsten unbehandelten weitermachen.

### Wochenrotation (Startpunkt, Balance-Check sticht)

| Mo | Di | Mi | Do | Fr |
| --- | --- | --- | --- | --- |
| PKV/Referendare | Bundesland-Beihilfe | DU/BU Berufsanfänger | PKV/Referendare | Bundesland-Beihilfe |

### Balance-Check

Ist-Verteilung der `categories` über **alle** Beiträge (inkl. Altbestand) zählen. Der
Altbestand ist stark bei `Beamte`/`PKV` allgemein und schwach bei bundeslandspezifischen und
Referendar-spezifischen Themen — das ist gewollt, neue Artikel sollen diese Lücke füllen.
Bediene das Cluster, das relativ zu seinem Zielanteil (bezogen auf neue Autopilot-Artikel,
nicht auf den WordPress-Altbestand) am weitesten zurückliegt.

## Stilregeln (verbindlich)

- Deutsch, Sie-Form.
- **Ich-Form, nie „wir"/„unser".** Mein Beamtenportal ist die Einzelberatung von Albert
  Sibert, kein Team. „Ich berate Sie…", nicht „Wir beraten Sie…".
- **Kein KI-Sprech.** Keine generischen Floskeln wie „In der heutigen Zeit…", „Es ist wichtig
  zu beachten…", „ohne Fachjargon", „Sie müssen mir nicht blind vertrauen" o.ä. Direkt in den
  Sachverhalt, konkret und faktenbasiert statt atmosphärisch.
- Kein Konjunktiv als Weichmacher („könnte", „würde", „sollte man"). Aussagen treffen.
- **Keine konkreten Tarife/Gesellschaften nennen** (Interessenkonflikt) — außer offiziellen
  Landes-/Bundesstellen (Landesamt für Besoldung, Bezügestelle etc.) als Quelle.
- Mindestens **eine Tabelle oder Checkliste** mit konkreten Prüfpunkten/Zahlen.
- Fokus-Keyword in H1 (=`title`), erstem H2 und erstem Absatz.
- Mindestens **2 interne Links** auf thematisch passende bestehende Artikel (Slug aus
  `content-posts.json` suchen) plus ein Link zu `/ratgeber`.
- Länge: **1.200–1.800 Wörter**.
- Albert Sibert ist rechtlich **Versicherungsvertreter**, keine Honorarberatung — falls
  überhaupt erwähnt, nicht als „unabhängiger Versicherungsmakler" bezeichnen.

## Technische Vorlage

Post-JSON-Objekt für `add_new_post.py` (Felder wie im `Post`-Interface in
`src/lib/content.ts`):

```json
{
  "slug": "pkv-referendare-bayern",
  "title": "PKV für Referendare in Bayern: Tarife, Kosten und Beihilfe-Zusammenspiel",
  "subtitle": "Was beim Wechsel von der GKV in die private Krankenversicherung während des Referendariats in Bayern zu beachten ist.",
  "toc": [
    { "href": "#kuerze", "text": "Das Wichtigste in Kürze" },
    { "href": "#abschnitt-1", "text": "<Überschrift Abschnitt 1>" },
    { "href": "#abschnitt-2", "text": "<Überschrift Abschnitt 2>" }
  ],
  "description": "Meta-Description, 70-160 Zeichen, mit Fokus-Keyword.",
  "date": "<heutiges Datum ISO, z.B. 2026-10-01T08:00:00",
  "categories": ["PKV", "Referendare"],
  "featuredImage": "/blog-media/pkv-referendare-bayern.jpg",
  "featuredImageAlt": "Beschreibung des Bildes",
  "html": "<div>...</div>"
}
```

`html`-Struktur (als Vorlage einen bestehenden Artikel spiegeln, z. B. den Eintrag mit Slug
`dienstunfaehigkeit-bei-berufsanfaengern` in `content-posts.json` — dessen `html`-Feld zeigt
die exakte Struktur):

1. Einleitungsabsatz(-absätze) mit Fokus-Keyword, danach optional ein `<a>`-Link auf einen
   thematisch verwandten bestehenden Artikel.
2. `<div class="summary-box"><h2 id="kuerze">Das Wichtigste in Kürze</h2><ul><li><p><strong>...</strong> ...</p></li>...</ul></div>`
   — 4-6 `<li>`-Punkte, jeweils **fett vorangestellte Kernaussage** + kurzer Satz.
   (Kein `icon-row`/`<img>` davor einbauen — die kleinen SVG-Icons stammen aus dem
   WordPress-Altbestand, für neue Artikel gibt es keine passenden Icon-Dateien. Ohne Icon
   sieht die Box weiterhin sauber aus, das CSS greift auch so.)
3. `<div class="team-box"><img alt="Albert Sibert" class="profile-photo" src="/albert-portrait.webp"/><div><p>Ich bin Albert Sibert, unabhängiger Finanzberater mit Schwerpunkt auf Beamte, Referendare und Anwärter. Seit 2019 begleite ich Sie bei Beihilfe, PKV, BU und Altersvorsorge – mit über 250 Partnergesellschaften statt nur einem Produkt.</p></div></div>`
   — wortgleich übernehmen, nicht umformulieren.
4. `<p class="legal-note"><strong>Disclaimer:</strong> Dieser Beitrag dient der allgemeinen Information und ersetzt keine fachliche Beratung. Die Informationen können sich regelmäßig ändern. Trotz sorgfältiger Recherche und Fachkenntnis übernehme ich keine Gewähr oder Haftung für Richtigkeit, Aktualität oder Vollständigkeit.</p>`
   — wortgleich übernehmen.
5. Body-Abschnitte: `<h2 class="blue-background" id="abschnitt-1">...</h2>` gefolgt von
   `<p>`/`<ul>`/`<table>`-Inhalt, `id` fortlaufend `abschnitt-2`, `abschnitt-3` usw. Jede
   `h2`/`h3`-Überschrift bekommt eine `id` und einen passenden Eintrag im `toc`-Array (Text
   muss exakt der Überschrift entsprechen).
6. Mindestens eine `<table>` (mit `<thead>`/`<tbody>`) oder `<ul>`-Checkliste mit konkreten
   Zahlen/Prüfpunkten irgendwo im Body.
7. Abschluss-Absatz mit klarem CTA-Satz (kein `<a>`-Button nötig — der Buchungs-Button/die
   Sidebar rendert `[slug]/page.tsx` bereits automatisch um jeden Artikel herum, nicht
   duplizieren).

`ArticleLayout`-Äquivalent (`src/app/[slug]/page.tsx`) erzeugt Hero, Trust-Badge, Sidebar mit
Inhaltsverzeichnis und Buchungs-CTA sowie „Verwandte Beiträge" automatisch aus `categories` —
nichts davon im `html` duplizieren.

## Commit

Commit-Message-Format: `Blog: <Titel des Beitrags>`

Am Ende der Message:

```
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```
