import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import {
  HOECHSTSATZ,
  NETTO_FAKTOR_AKTIV,
  ENTNAHMERATE,
  MODELL_RENDITE,
  PROZENT_PRO_DIENSTJAHR,
  REGELALTERSGRENZE,
  calcPension,
  kapitalFuerEntnahme,
  sparrateFuerZiel,
  type PensionInput,
} from "@/lib/pension-calc";

// Persönliche PDF-Auswertung zur Pensionsberechnung (A4, 4 Seiten, Sie-Form).
// Läuft serverseitig (reines JS, keine Dateizugriffe). Alle Beträge sind gerundete Richtwerte.

const NAVY = rgb(0, 0.157, 0.333); // #002855
const GOLD = rgb(0.118, 0.373, 0.659); // Akzentblau #1E5FA8
const ACC_LIGHT = rgb(0.6, 0.78, 0.95);
const SLATE = rgb(0.392, 0.455, 0.545); // #64748B
const LIGHT = rgb(0.918, 0.949, 0.984); // #EAF2FB
const BORDER = rgb(0.886, 0.91, 0.941); // #E2E8F0
const WHITE = rgb(1, 1, 1);

const W = 595.28;
const H = 841.89;
const M = 50;
const CW = W - 2 * M;

// Helvetica (WinAnsi) kennt nicht jedes Zeichen: unbekannte durch Ersatz ersetzen.
const clean = (t: string) =>
  t
    .replace(/[−]/g, "-")
    .replace(/→/g, "->")
    .replace(/≈/g, "ca.")
    .replace(/[   ]/g, " ")
    .replace(/[^\x00-\xff€–—‘’‚“”„•…]/g, "");

const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} EUR`;
const pct = (n: number, d = 1) => `${n.toFixed(d).replace(".", ",")} %`;

interface Ctx {
  doc: PDFDocument;
  reg: PDFFont;
  bold: PDFFont;
}

function wrap(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const para of clean(text).split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        out.push(line);
        line = word;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

function text(page: PDFPage, ctx: Ctx, t: string, x: number, y: number, size: number, o: { bold?: boolean; color?: ReturnType<typeof rgb>; maxW?: number; lead?: number } = {}) {
  const font = o.bold ? ctx.bold : ctx.reg;
  const lead = o.lead ?? size * 1.45;
  const lines = o.maxW ? wrap(font, t, size, o.maxW) : [clean(t)];
  lines.forEach((l, i) => page.drawText(l, { x, y: y - i * lead, size, font, color: o.color ?? NAVY }));
  return y - lines.length * lead;
}

function newPage(ctx: Ctx, title: string, nr: number, total: number) {
  const page = ctx.doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: GOLD });
  text(page, ctx, title, M, H - 56, 20, { bold: true });
  page.drawLine({ start: { x: M, y: H - 70 }, end: { x: W - M, y: H - 70 }, thickness: 0.8, color: BORDER });
  // Fußzeile
  page.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.5, color: BORDER });
  text(page, ctx, "Albert Sibert · Mein Beamtenportal · www.mein-beamtenportal.de", M, 32, 8, { color: SLATE });
  const pn = `Seite ${nr} von ${total}`;
  text(page, ctx, pn, W - M - ctx.reg.widthOfTextAtSize(pn, 8), 32, 8, { color: SLATE });
  return page;
}

function h2(page: PDFPage, ctx: Ctx, t: string, y: number) {
  page.drawRectangle({ x: M, y: y - 3, width: 3, height: 15, color: GOLD });
  text(page, ctx, t, M + 10, y, 13, { bold: true });
  return y - 22;
}

function box(page: PDFPage, x: number, y: number, w: number, h: number, fill = WHITE) {
  page.drawRectangle({ x, y: y - h, width: w, height: h, color: fill, borderColor: BORDER, borderWidth: 1 });
}

function row(page: PDFPage, ctx: Ctx, y: number, cells: string[], widths: number[], o: { head?: boolean; strong?: boolean; left?: boolean } = {}) {
  const h = 22;
  if (o.head) page.drawRectangle({ x: M, y: y - h + 6, width: CW, height: h, color: NAVY });
  else page.drawLine({ start: { x: M, y: y - h + 6 }, end: { x: M + CW, y: y - h + 6 }, thickness: 0.5, color: BORDER });
  let x = M + 8;
  cells.forEach((c, i) => {
    const isLast = i === cells.length - 1;
    const f = o.head || o.strong ? ctx.bold : ctx.reg;
    const t = clean(c);
    const tx = isLast && cells.length > 1 && !o.left ? x + widths[i] - 16 - f.widthOfTextAtSize(t, 10) : x;
    page.drawText(t, { x: tx, y: y - 9, size: 10, font: f, color: o.head ? WHITE : NAVY });
    x += widths[i];
  });
  return y - h;
}

export async function buildPensionPdf(input: PensionInput): Promise<Uint8Array> {
  const c = calcPension(input);
  const doc = await PDFDocument.create();
  doc.setTitle(`Pensionsanalyse ${input.gruppe}`);
  doc.setAuthor("Albert Sibert, Mein Beamtenportal");
  const ctx: Ctx = { doc, reg: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) };
  const TOTAL = 4;
  const datum = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date());

  // ---- Seite 1: Ergebnis ----
  {
    const page = ctx.doc.addPage([W, H]);
    page.drawRectangle({ x: 0, y: H - 150, width: W, height: 150, color: NAVY });
    page.drawRectangle({ x: 0, y: H - 154, width: W, height: 4, color: GOLD });
    text(page, ctx, "PERSÖNLICHE AUSWERTUNG", M, H - 52, 9, { bold: true, color: ACC_LIGHT });
    text(page, ctx, `Ihre Pensionsanalyse ${input.gruppe}`, M, H - 84, 28, { bold: true, color: WHITE });
    text(page, ctx, `Ruhestand, Versorgungslücke und 3-Töpfe-Fahrplan · Stand ${datum}`, M, H - 112, 11, { color: rgb(0.8, 0.84, 0.88) });

    let y = H - 190;
    y = h2(page, ctx, "Ihre Angaben", y);
    const facts = [
      ["Besoldungsgruppe", input.gruppe],
      ["Alter heute", `${input.alter} Jahre`],
      ["Geplantes Pensionsalter", `${input.pensionsalter} Jahre`],
      ["Dienstjahre", `${input.dienstjahre}`],
    ];
    const fw = CW / 4;
    facts.forEach(([k, v], i) => {
      text(page, ctx, k, M + i * fw, y, 9, { color: SLATE });
      text(page, ctx, v, M + i * fw, y - 16, 14, { bold: true });
    });
    y -= 50;

    y = h2(page, ctx, "Ihr Ergebnis pro Monat (Richtwerte, heutige Kaufkraft)", y);
    const bw = (CW - 14) / 2;
    box(page, M, y + 4, bw, 100);
    text(page, ctx, "Voraussichtliche Netto-Pension", M + 14, y - 16, 10, { color: SLATE });
    text(page, ctx, eur(c.pensionNetto), M + 14, y - 52, 26, { bold: true });
    text(page, ctx, `Brutto ca. ${eur(c.pensionBrutto)}`, M + 14, y - 74, 9, { color: SLATE });
    box(page, M + bw + 14, y + 4, bw, 100, LIGHT);
    text(page, ctx, "Lücke zum heutigen Netto", M + bw + 28, y - 16, 10, { color: SLATE });
    text(page, ctx, eur(c.luecke), M + bw + 28, y - 52, 26, { bold: true });
    text(page, ctx, `${pct(c.lueckeProzent, 0)} weniger als heute (ca. ${eur(c.nettoAktiv)} netto)`, M + bw + 28, y - 74, 9, { color: SLATE });
    y -= 124;

    // Balkenvergleich
    y = h2(page, ctx, "Der Vergleich auf einen Blick", y);
    const maxV = Math.max(c.nettoAktiv, 1);
    const bars: [string, number, ReturnType<typeof rgb>][] = [
      ["Heutiges Netto", c.nettoAktiv, SLATE],
      ["Netto-Pension", c.pensionNetto, NAVY],
      ["Lücke", c.luecke, GOLD],
    ];
    bars.forEach(([label, v, col], i) => {
      const by = y - i * 30;
      text(page, ctx, label, M, by - 10, 10, { bold: true });
      const maxBar = CW - 200;
      page.drawRectangle({ x: M + 110, y: by - 16, width: Math.max((v / maxV) * maxBar, 2), height: 18, color: col });
      text(page, ctx, eur(v), M + 110 + Math.max((v / maxV) * maxBar, 2) + 8, by - 10, 10, { bold: true });
    });
    y -= 110;

    y = h2(page, ctx, "Was das für Sie bedeutet", y);
    y = text(
      page,
      ctx,
      `Nach 40 Dienstjahren erreicht das Ruhegehalt den Höchstsatz von ${pct(HOECHSTSATZ, 2)}. Bei Ihren Angaben sind es ${pct(c.satz, 2)}${c.abschlag > 0 ? ` abzüglich ${pct(c.abschlag * 100)} Versorgungsabschlag` : ""}. Nach Steuern, Pflege und Krankenversicherung bleiben davon rund ${pct(c.faktorPension * 100, 0)} übrig. Ihr Einkommen im Ruhestand liegt damit ungefähr ${eur(c.luecke)} pro Monat unter Ihrem heutigen Netto.`,
      M,
      y,
      10.5,
      { maxW: CW }
    );
    text(page, ctx, "Alle Werte sind gerundete Richtwerte und in heutiger Kaufkraft angegeben. Verbindlich ist nur der Bescheid Ihrer Versorgungsstelle.", M, y - 6, 9, { color: SLATE, maxW: CW });
    page.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.5, color: BORDER });
    text(page, ctx, "Albert Sibert · Mein Beamtenportal · www.mein-beamtenportal.de", M, 32, 8, { color: SLATE });
    text(page, ctx, `Seite 1 von ${TOTAL}`, W - M - ctx.reg.widthOfTextAtSize(`Seite 1 von ${TOTAL}`, 8), 32, 8, { color: SLATE });
  }

  // ---- Seite 2: Rechenweg und Realitäten ----
  {
    const page = newPage(ctx, "So wurde gerechnet", 2, TOTAL);
    let y = H - 100;
    const widths = [CW - 160, 160];
    y = row(page, ctx, y, ["Schritt", "Wert"], widths, { head: true });
    y = row(page, ctx, y, [`Ruhegehaltfähige Dienstbezüge (${input.gruppe}, Endstufe, gerundet)`, eur(c.brutto)], widths);
    y = row(page, ctx, y, [`Ruhegehaltssatz (${input.dienstjahre} Jahre x ${PROZENT_PRO_DIENSTJAHR.toString().replace(".", ",")} %, max. ${pct(HOECHSTSATZ, 2)})`, pct(c.satz, 2)], widths);
    if (c.abschlag > 0) y = row(page, ctx, y, [`Versorgungsabschlag (Pension mit ${input.pensionsalter} statt ${REGELALTERSGRENZE})`, `- ${pct(c.abschlag * 100)}`], widths);
    y = row(page, ctx, y, ["Bruttopension", eur(c.pensionBrutto)], widths, { strong: true });
    y = row(page, ctx, y, [`Nach Steuern, Pflege und PKV (ca. ${pct(c.faktorPension * 100, 0)} der Brutto-Pension)`, eur(c.pensionNetto)], widths, { strong: true });
    y = row(page, ctx, y, [`Heutiges Netto (ca. ${pct(NETTO_FAKTOR_AKTIV * 100, 0)} der Besoldung)`, eur(c.nettoAktiv)], widths);
    y = row(page, ctx, y, ["Lücke pro Monat", eur(c.luecke)], widths, { strong: true });
    y -= 22;

    y = h2(page, ctx, "Drei Punkte, die im Ruhestand häufig unterschätzt werden", y);
    const pts = [
      ["Besteuerung der Pension.", "Beamtenpensionen werden als Versorgungsbezüge nach § 19 EStG besteuert. Der Versorgungsfreibetrag mindert die Steuer, wird aber für spätere Pensionsjahrgänge schrittweise abgeschmolzen. Zulagen, die nicht ruhegehaltfähig sind, entfallen. So entsteht eine spürbare Lücke zum letzten Nettoeinkommen."],
      ["Die PKV bleibt lebenslang bestehen.", "Der Beihilfesatz steigt im Ruhestand in der Regel auf 70 %. Für den verbleibenden Teil der Krankheitskosten bleibt Ihre private Krankenversicherung bestehen, ihr Beitrag wird lebenslang aus den Versorgungsbezügen bezahlt."],
      ["Der steuerliche Hebel.", "Als Beamter zahlen Sie keine Pflichtbeiträge zur gesetzlichen Rentenversicherung. Beiträge zu einer Basisrente sind nach § 10 EStG steuerlich absetzbar, wobei der Höchstbetrag für Beamte gekürzt wird. Die spätere Rente wird nachgelagert besteuert."],
    ];
    pts.forEach(([t, d], i) => {
      text(page, ctx, `${i + 1}.`, M, y, 11, { bold: true, color: GOLD });
      text(page, ctx, t, M + 18, y, 10.5, { bold: true });
      y = text(page, ctx, d, M + 18, y - 15, 10, { maxW: CW - 18 });
      y -= 10;
    });

    y = h2(page, ctx, "Annahmen der Rechnung", y - 4);
    [
      "Die Besoldung steigt in der Regel mit den Preisen. Deshalb sind alle Werte in heutiger Kaufkraft angegeben.",
      "Endgrundgehälter sind gerundet, Familienzuschläge sind nicht enthalten. Länder haben eigene Besoldungstabellen.",
      "Die Netto-Faktoren sind pauschal. Ihre tatsächliche Steuer hängt von Familienstand, Freibeträgen und Abzügen ab.",
      "Rechtsgrundlage: Beamtenversorgungsgesetz des Bundes (§ 14) bzw. das Landesbeamtenversorgungsgesetz Ihres Dienstherrn.",
    ].forEach((a) => {
      page.drawCircle({ x: M + 3, y: y + 3, size: 1.6, color: GOLD });
      y = text(page, ctx, a, M + 12, y, 9.5, { maxW: CW - 12 }) - 3;
    });
  }

  // ---- Seite 3: 3-Töpfe-Fahrplan ----
  {
    const page = newPage(ctx, "Der 3-Töpfe-Fahrplan", 3, TOTAL);
    let y = H - 96;
    y = text(page, ctx, "Die Lücke schließen Sie nicht mit einem einzigen Produkt, sondern mit drei Töpfen mit unterschiedlicher Aufgabe: einer steuerlich geförderten Basis, einem flexiblen Kapitalaufbau und einer Sicherheitsreserve.", M, y, 10.5, { maxW: CW }) - 12;

    const tw = (CW - 20) / 3;
    const topf: [string, string, string][] = [
      ["TOPF 1", "Steuerlich gefördert", `Basisrente nach § 10 EStG. Ihr Beispiel-Beitrag: ${eur(input.sparrate)} pro Monat. Möglicher Steuervorteil ca. ${eur(c.steuervorteilJahr)} pro Jahr, Ihr Beitrag kostet netto etwa ${eur(c.nettoKostenMonat)} im Monat. Lebenslange Rente, nicht vererbbar und nicht beleihbar.`],
      ["TOPF 2", "Flexibel und frei verfügbar", "Kapitalaufbau mit Sparplan, zum Beispiel über breit gestreute Fonds oder ETF. Jederzeit verfügbar, keine feste Auszahlungsform. Erträge werden regulär besteuert, Kursschwankungen sind möglich."],
      ["TOPF 3", "Sicherheit", "Liquiditätsreserve von drei bis sechs Monatsausgaben auf einem Tagesgeldkonto. Dazu die Absicherung bei Dienstunfähigkeit, solange Ihr Anspruch auf Ruhegehalt noch klein ist."],
    ];
    topf.forEach(([k, t, d], i) => {
      const x = M + i * (tw + 10);
      box(page, x, y, tw, 205);
      page.drawRectangle({ x, y: y - 4, width: tw, height: 4, color: GOLD });
      text(page, ctx, k, x + 10, y - 22, 8, { bold: true, color: GOLD });
      text(page, ctx, t, x + 10, y - 38, 11, { bold: true, maxW: tw - 20 });
      text(page, ctx, d, x + 10, y - 72, 9, { maxW: tw - 20 });
    });
    y -= 225;

    y = h2(page, ctx, "Welche Sparrate die Lücke schließen kann (Modellrechnung)", y);
    const jahre = c.jahreBisPension;
    const gesamtKapital = kapitalFuerEntnahme(c.luecke);
    y = text(
      page,
      ctx,
      `Um ${eur(c.luecke)} pro Monat zusätzlich zu entnehmen, brauchen Sie bei einer Entnahmerate von 3 % pro Jahr ein Kapital von etwa ${eur(gesamtKapital)}.${jahre > 0 ? ` Bis zu Ihrem Pensionsalter sind es noch ${jahre} Jahre.` : ""}`,
      M,
      y,
      10,
      { maxW: CW }
    ) - 6;
    if (jahre > 0) {
      const w3 = [CW - 360, 120, 120, 120];
      y = row(page, ctx, y, ["Sparrate pro Monat", "3 % p. a.", "5 % p. a.", "7 % p. a."], [CW - 330, 110, 110, 110], { head: true, left: true });
      const lines: [string, number][] = [
        ["Lücke zu 100 % schließen", gesamtKapital],
        ["Lücke zu 50 % schließen", gesamtKapital / 2],
      ];
      lines.forEach(([label, ziel]) => {
        const cells = [label, ...[0.03, 0.05, 0.07].map((r) => eur(sparrateFuerZiel(ziel, jahre, r)))];
        let x = M + 8;
        const ws = [CW - 330, 110, 110, 110];
        page.drawLine({ start: { x: M, y: y - 16 }, end: { x: M + CW, y: y - 16 }, thickness: 0.5, color: BORDER });
        cells.forEach((cell, i) => {
          page.drawText(clean(cell), { x, y: y - 9, size: 10, font: i === 0 ? ctx.bold : ctx.reg, color: NAVY });
          x += ws[i];
        });
        y -= 22;
      });
      void w3;
    }
    y = text(
      page,
      ctx,
      "Modellrechnung, keine Prognose: Renditen sind nicht garantiert und schwanken. Kosten, Steuern auf Erträge und Inflation sind nicht eingerechnet. Entnahmerate 3 % p. a. als Annahme.",
      M,
      y - 4,
      8.5,
      { color: SLATE, maxW: CW }
    );
    y = text(
      page,
      ctx,
      `Ihr Beispiel-Beitrag: ${eur(input.sparrate)} pro Monat über ${jahre} Jahre ergibt bei ${Math.round(MODELL_RENDITE * 100)} % Modellrendite ein Kapital von etwa ${eur(c.sparKapital)}. Bei ${Math.round(ENTNAHMERATE * 100)} % Entnahme wären das rund ${eur(c.zusatzRente)} pro Monat und damit etwa ${c.lueckeGeschlossenProzent.toFixed(0)} % Ihrer Lücke.`,
      M,
      y - 6,
      10,
      { maxW: CW, bold: true }
    );
    y = h2(page, ctx, "So gehen Sie vor", y - 12);
    [
      "Erst die Reserve (Topf 3), dann Beitrag nach Beitrag aufbauen, den Sie dauerhaft halten können.",
      "Basisrente (Topf 1) nur in der Höhe, die zu Ihrem Grenzsteuersatz und Ihrem Höchstbetrag passt. Prüfen Sie das mit einem Steuerberater.",
      "Den Rest flexibel aufbauen (Topf 2) und jährlich nachsteuern, wenn sich Gehalt oder Planung ändern.",
    ].forEach((a, i) => {
      text(page, ctx, `${i + 1}.`, M, y, 10, { bold: true, color: GOLD });
      y = text(page, ctx, a, M + 16, y, 10, { maxW: CW - 16 }) - 4;
    });
  }

  // ---- Seite 4: nächste Schritte, Hinweise ----
  {
    const page = newPage(ctx, "Nächste Schritte und Hinweise", 4, TOTAL);
    let y = H - 100;
    y = h2(page, ctx, "Ihre Checkliste", y);
    [
      "Bei Ihrer Versorgungsstelle eine Versorgungsauskunft anfordern und mit dieser Auswertung vergleichen.",
      "Teilzeit-, Beurlaubungs- und Vordienstzeiten prüfen: Welche Zeiten sind ruhegehaltfähig?",
      "Einen früheren Ruhestand mit dem Versorgungsabschlag (3,6 % pro Jahr) durchrechnen.",
      "Beitrag und Tarif der PKV im Ruhestand ansehen. Der Beihilfesatz steigt in der Regel auf 70 %.",
      "Eine Liquiditätsreserve aufbauen und den Dauerauftrag für Topf 1 und Topf 2 einrichten.",
      "Mit einem Steuerberater klären, wie viel Basisrente-Beitrag für Sie abzugsfähig ist.",
    ].forEach((a) => {
      page.drawRectangle({ x: M, y: y - 3, width: 9, height: 9, borderColor: GOLD, borderWidth: 1.2, color: WHITE });
      y = text(page, ctx, a, M + 20, y, 10.5, { maxW: CW - 20 }) - 8;
    });

    y = h2(page, ctx, "Möchten Sie es exakt berechnen lassen?", y - 10);
    y = text(page, ctx, "In einem kurzen Gespräch rechne ich mit Ihren individuellen Dienstjahren, Vordienstzeiten und dem konkreten Steuer-Einsparpotenzial. Termin buchen: cal.com/mein-beamtenportal/kostenfreie-erstberatung oder per E-Mail an kontakt@albert-sibert.de.", M, y, 10.5, { maxW: CW }) - 20;

    y = h2(page, ctx, "Wichtige Hinweise", y);
    y = text(page, ctx, "Diese Auswertung dient der allgemeinen Information und ist keine Steuer-, Rechts- oder Anlageberatung. Alle Beträge sind gerundete Richtwerte auf Basis pauschaler Annahmen. Die Besoldungstabellen unterscheiden sich je nach Dienstherr, deshalb kann Ihre tatsächliche Pension abweichen. Verbindlich sind nur die Bescheide Ihrer Versorgungsstelle und des Finanzamts. Wertentwicklungen aus der Vergangenheit sind kein verlässlicher Indikator für die Zukunft.", M, y, 9.5, { maxW: CW, color: SLATE }) - 14;

    y = h2(page, ctx, "Angaben zum Vermittler", y);
    [
      "Albert Sibert · Gämsenbergstraße 22 · 71640 Ludwigsburg",
      "Telefon +49 176 92609041 · kontakt@albert-sibert.de",
      "Versicherungsvertreter mit Erlaubnis nach § 34d Abs. 1 GewO (Reg.-Nr. D-4EHE-G249E-13) und Finanzanlagenvermittler nach § 34f Abs. 1 GewO",
      "Registerabfrage: www.vermittlerregister.info · Aufsichtsbehörde: IHK Region Stuttgart, Jägerstraße 30, 70174 Stuttgart",
      "Schlichtungsstelle: Versicherungsombudsmann e.V., Postfach 08 06 32, 10006 Berlin",
    ].forEach((l) => {
      y = text(page, ctx, l, M, y, 9, { maxW: CW, color: SLATE }) - 2;
    });
  }

  return doc.save();
}
