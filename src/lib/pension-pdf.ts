import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import {
  ENTNAHMERATE,
  HOECHSTSATZ,
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

const TITLE = rgb(0.059, 0.09, 0.165); // #0F172A
const BLUE = rgb(0.118, 0.251, 0.686); // #1E40AF
const BLUE2 = rgb(0.145, 0.388, 0.922); // #2563EB
const TEXT = rgb(0.2, 0.255, 0.333); // #334155
const MUTED = rgb(0.392, 0.455, 0.545); // #64748B
const SOFT = rgb(0.937, 0.965, 1); // #EFF6FF
const SOFT_BORDER = rgb(0.749, 0.859, 0.996); // #BFDBFE
const GREY = rgb(0.973, 0.98, 0.988); // #F8FAFC
const LINE = rgb(0.886, 0.91, 0.941); // #E2E8F0
const WHITE = rgb(1, 1, 1);

const W = 595.28;
const H = 841.89;
const M = 48;
const CW = W - 2 * M;
const TOTAL = 4;

// Helvetica (WinAnsi) kennt nicht jedes Zeichen: unbekannte durch Ersatz ersetzen.
const clean = (t: string) =>
  t
    .replace(/[−]/g, "-")
    .replace(/→/g, "->")
    .replace(/≈/g, "ca.")
    .replace(/[   ]/g, " ")
    .replace(/[^\x00-\xff€–—‘’‚“”„•…]/g, "");

const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;
const pct = (n: number, d = 1) => `${n.toFixed(d).replace(".", ",")} %`;

interface Ctx {
  doc: PDFDocument;
  reg: PDFFont;
  bold: PDFFont;
}

function wrap(font: PDFFont, t: string, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const para of clean(t).split("\n")) {
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

interface TextOpts {
  bold?: boolean;
  color?: ReturnType<typeof rgb>;
  maxW?: number;
  lead?: number;
}

/** Zeichnet Text, gibt die neue y-Position unterhalb des Textes zurück. */
function text(page: PDFPage, ctx: Ctx, t: string, x: number, y: number, size: number, o: TextOpts = {}) {
  const font = o.bold ? ctx.bold : ctx.reg;
  const lead = o.lead ?? size * 1.5;
  const lines = o.maxW ? wrap(font, t, size, o.maxW) : [clean(t)];
  lines.forEach((l, i) => page.drawText(l, { x, y: y - i * lead, size, font, color: o.color ?? TEXT }));
  return y - lines.length * lead;
}

function height(ctx: Ctx, t: string, size: number, maxW: number, bold = false, lead?: number) {
  return wrap(bold ? ctx.bold : ctx.reg, t, size, maxW).length * (lead ?? size * 1.5);
}

function roundRect(page: PDFPage, x: number, yTop: number, w: number, h: number, r: number, fill: ReturnType<typeof rgb>, border?: ReturnType<typeof rgb>, bw = 1) {
  const path = `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  page.drawSvgPath(path, { x, y: yTop, color: fill, borderColor: border, borderWidth: border ? bw : 0 });
}

function page(ctx: Ctx, nr: number, right: string) {
  const p = ctx.doc.addPage([W, H]);
  text(p, ctx, "Mein Beamtenportal", M, H - 46, 13, { bold: true, color: BLUE });
  const rw = ctx.reg.widthOfTextAtSize(clean(right), 9.5);
  text(p, ctx, right, W - M - rw, H - 45, 9.5, { color: MUTED });
  p.drawLine({ start: { x: M, y: H - 58 }, end: { x: W - M, y: H - 58 }, thickness: 2.2, color: BLUE });
  p.drawLine({ start: { x: M, y: 48 }, end: { x: W - M, y: 48 }, thickness: 0.6, color: LINE });
  text(p, ctx, "Mein Beamtenportal · www.mein-beamtenportal.de", M, 32, 8.5, { color: MUTED });
  const pn = `Seite ${nr} von ${TOTAL}`;
  text(p, ctx, pn, W - M - ctx.reg.widthOfTextAtSize(pn, 8.5), 32, 8.5, { color: MUTED });
  return p;
}

function heading(p: PDFPage, ctx: Ctx, t: string, y: number) {
  text(p, ctx, t, M, y, 15, { bold: true, color: BLUE });
  p.drawLine({ start: { x: M, y: y - 8 }, end: { x: W - M, y: y - 8 }, thickness: 0.6, color: LINE });
  return y - 30;
}

function numberDot(p: PDFPage, ctx: Ctx, n: string, cx: number, cy: number) {
  p.drawCircle({ x: cx, y: cy, size: 8.5, color: BLUE2 });
  const w = ctx.bold.widthOfTextAtSize(n, 9);
  p.drawText(n, { x: cx - w / 2, y: cy - 3.2, size: 9, font: ctx.bold, color: WHITE });
}

function checkDot(p: PDFPage, cx: number, cy: number) {
  p.drawCircle({ x: cx, y: cy, size: 8.5, color: BLUE });
  p.drawLine({ start: { x: cx - 3.6, y: cy - 0.2 }, end: { x: cx - 1, y: cy - 2.9 }, thickness: 1.6, color: WHITE });
  p.drawLine({ start: { x: cx - 1, y: cy - 2.9 }, end: { x: cx + 3.8, y: cy + 3 }, thickness: 1.6, color: WHITE });
}

function badge(p: PDFPage, ctx: Ctx, label: string, x: number, yTop: number) {
  const l = clean(label);
  const w = ctx.bold.widthOfTextAtSize(l, 7.5) + 16;
  roundRect(p, x, yTop, w, 15, 4, BLUE);
  p.drawText(l, { x: x + 8, y: yTop - 10.5, size: 7.5, font: ctx.bold, color: WHITE });
}

export async function buildPensionPdf(input: PensionInput): Promise<Uint8Array> {
  const c = calcPension(input);
  const doc = await PDFDocument.create();
  doc.setTitle(`Pensionsanalyse ${input.gruppe}`);
  doc.setAuthor("Mein Beamtenportal");
  const ctx: Ctx = { doc, reg: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) };
  const datum = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date());
  const jahre = c.jahreBisPension;

  // ================= Seite 1 =================
  {
    const p = page(ctx, 1, `Versorgungsanalyse · Stand ${datum}`);
    let y = H - 100;
    y = text(p, ctx, "Pensionsanalyse & Kaufkraftberechnung:", M, y, 24, { bold: true, color: TITLE, lead: 30 });
    y = text(p, ctx, `Besoldungsgruppe ${input.gruppe}`, M, y, 24, { bold: true, color: TITLE, lead: 30 });
    y = text(p, ctx, "Versorgungsanspruch, reale Besteuerung und Schließung der Lücke", M, y - 2, 11.5, { bold: true, color: BLUE2 }) - 12;

    // Angaben-Leiste
    roundRect(p, M, y, CW, 36, 6, GREY, LINE);
    const facts: [string, string][] = [
      ["Besoldungsgruppe", input.gruppe],
      ["Alter heute", `${input.alter} Jahre`],
      ["Pensionsalter", `${input.pensionsalter} Jahre`],
      ["Dienstjahre", `${input.dienstjahre}`],
    ];
    const fw = CW / 4;
    facts.forEach(([k, v], i) => {
      text(p, ctx, `${k}:`, M + 14 + i * fw, y - 15, 8.5, { color: MUTED });
      text(p, ctx, v, M + 14 + i * fw, y - 28, 10.5, { bold: true, color: TITLE });
    });
    y -= 56;

    const intro = `Guten Tag, diese Auswertung zeigt Ihren voraussichtlichen Versorgungsanspruch im Ruhestand auf Basis der Besoldungsgruppe ${input.gruppe}. Viele Beamtinnen und Beamte gehen davon aus, dass das Ruhegehalt nahezu dem letzten Nettoeinkommen entspricht. Eine genaue Betrachtung muss jedoch die Besteuerung der Pension, die Restkosten der privaten Krankenversicherung (PKV) und die schleichende Entwertung der Kaufkraft berücksichtigen.`;
    y = text(p, ctx, intro, M, y, 10.5, { maxW: CW, lead: 15.5 }) - 14;

    // Kernfakten
    const facts3: [string, string][] = [
      [`Maximaler Ruhegehaltssatz: ${pct(HOECHSTSATZ, 2)}`, `Der Höchstsatz wird nach 40 ruhegehaltfähigen Dienstjahren erreicht (§ 14 BeamtVG). Jedes Dienstjahr bringt ${PROZENT_PRO_DIENSTJAHR.toString().replace(".", ",")} %. Bei Ihren Angaben sind es ${pct(c.satz, 2)}${c.abschlag > 0 ? `, abzüglich ${pct(c.abschlag * 100)} Versorgungsabschlag` : ""}.`],
      ["Besteuerung nach § 19 EStG", "Pensionen sind Versorgungsbezüge und werden besteuert. Der Versorgungsfreibetrag mindert die Steuer, wird aber für spätere Pensionsjahrgänge schrittweise abgeschmolzen."],
      ["Die PKV bleibt lebenslang bestehen", "Der Beihilfesatz steigt im Ruhestand in der Regel auf 70 %. Für den verbleibenden Teil der Krankheitskosten bleibt Ihre PKV bestehen, ihr Beitrag wird lebenslang aus den Versorgungsbezügen bezahlt."],
    ];
    const innerW = CW - 56;
    let ch = 44;
    facts3.forEach(([, d]) => (ch += 17 + height(ctx, d, 9.5, innerW, false, 13.5) + 12));
    roundRect(p, M, y, CW, ch, 8, SOFT, SOFT_BORDER);
    text(p, ctx, "Die 3 Kernfakten Ihrer Pensionsstruktur", M + 18, y - 24, 12, { bold: true, color: BLUE });
    let fy = y - 48;
    facts3.forEach(([t, d], i) => {
      numberDot(p, ctx, String(i + 1), M + 27, fy - 3);
      text(p, ctx, t, M + 44, fy, 10.5, { bold: true, color: TITLE });
      fy = text(p, ctx, d, M + 44, fy - 15, 9.5, { maxW: innerW, lead: 13.5 }) - 12;
    });
    y -= ch + 18;

    // Ergebnis
    const bw = (CW - 14) / 2;
    roundRect(p, M, y, bw, 84, 8, WHITE, LINE);
    text(p, ctx, "Voraussichtliche Netto-Pension", M + 16, y - 20, 9.5, { color: MUTED });
    text(p, ctx, `${eur(c.pensionNetto)}`, M + 16, y - 50, 24, { bold: true, color: TITLE });
    text(p, ctx, `pro Monat, brutto ca. ${eur(c.pensionBrutto)}`, M + 16, y - 70, 8.5, { color: MUTED });
    roundRect(p, M + bw + 14, y, bw, 84, 8, SOFT, SOFT_BORDER);
    text(p, ctx, "Lücke zum heutigen Netto", M + bw + 30, y - 20, 9.5, { color: MUTED });
    text(p, ctx, `${eur(c.luecke)}`, M + bw + 30, y - 50, 24, { bold: true, color: BLUE });
    text(p, ctx, `pro Monat, ${pct(c.lueckeProzent, 0)} weniger als heute`, M + bw + 30, y - 70, 8.5, { color: MUTED });
    y -= 84 + 18;

    // Ziel
    const ziel = "Sie erfahren Ihr voraussichtliches Netto im Ruhestand und im 3-Töpfe-Fahrplan, wie Sie die Differenz zum heutigen Netto Schritt für Schritt verkleinern können. Alle Werte sind Richtwerte in heutiger Kaufkraft.";
    const zh = 38 + height(ctx, ziel, 9.5, CW - 36, false, 13.5);
    roundRect(p, M, y, CW, zh, 6, GREY, LINE);
    p.drawRectangle({ x: M, y: y - zh, width: 4, height: zh, color: BLUE });
    text(p, ctx, "Ziel dieser Auswertung", M + 18, y - 22, 11.5, { bold: true, color: BLUE });
    text(p, ctx, ziel, M + 18, y - 40, 9.5, { maxW: CW - 36, lead: 13.5 });
  }

  // ================= Seite 2 =================
  {
    const p = page(ctx, 2, `${input.gruppe} Netto-Pensionsberechnung`);
    let y = H - 98;
    y = heading(p, ctx, `Die Aufschlüsselung (Netto-Pension ${input.gruppe})`, y);
    y = text(p, ctx, "Um die tatsächliche Kaufkraft im Ruhestand zu ermitteln, werden von den ruhegehaltfähigen Dienstbezügen die Abzüge für Steuern, Pflege und Krankenversicherung abgezogen.", M, y, 10.5, { maxW: CW, lead: 15.5 }) - 10;

    const rows: [string, string, "n" | "b" | "r"][] = [
      [`Ruhegehaltfähige Dienstbezüge (${input.gruppe}, Endstufe, gerundet)`, eur(c.brutto), "n"],
      [`Ruhegehaltssatz (${input.dienstjahre} Jahre x ${PROZENT_PRO_DIENSTJAHR.toString().replace(".", ",")} %, max. ${pct(HOECHSTSATZ, 2)}): ${pct(c.satz, 2)}`, eur((c.brutto * c.satz) / 100), "b"],
    ];
    if (c.abschlag > 0) rows.push([`Versorgungsabschlag (Pension mit ${input.pensionsalter} statt ${REGELALTERSGRENZE}): ${pct(c.abschlag * 100)}`, `- ${eur(((c.brutto * c.satz) / 100) * c.abschlag)}`, "n"]);
    rows.push(["= Bruttopension", eur(c.pensionBrutto), "b"]);
    rows.push([`Abzüge für Lohnsteuer, Pflege und PKV-Eigenanteil (Richtwert, ca. ${pct((1 - c.faktorPension) * 100, 0)})`, `- ${eur(c.pensionBrutto - c.pensionNetto)}`, "n"]);
    rows.push(["= REALE NETTO-PENSION (geschätzt)", `ca. ${eur(c.pensionNetto)}`, "r"]);

    const RH = 28;
    roundRect(p, M, y, CW, 28, 4, BLUE);
    text(p, ctx, "Berechnungsschritt / Position", M + 14, y - 18, 10, { bold: true, color: WHITE });
    const hw = ctx.bold.widthOfTextAtSize("Betrag (Richtwert)", 10);
    text(p, ctx, "Betrag (Richtwert)", M + CW - 14 - hw, y - 18, 10, { bold: true, color: WHITE });
    y -= 28;
    rows.forEach(([a, b, k]) => {
      if (k === "r") {
        p.drawRectangle({ x: M, y: y - RH, width: CW, height: RH, color: SOFT });
        p.drawLine({ start: { x: M, y }, end: { x: M + CW, y }, thickness: 1.5, color: BLUE2 });
        p.drawLine({ start: { x: M, y: y - RH }, end: { x: M + CW, y: y - RH }, thickness: 1.5, color: BLUE2 });
      } else p.drawLine({ start: { x: M, y: y - RH }, end: { x: M + CW, y: y - RH }, thickness: 0.5, color: LINE });
      const f = k === "n" ? ctx.reg : ctx.bold;
      const col = k === "r" ? BLUE : TITLE;
      p.drawText(clean(a), { x: M + 14, y: y - 18, size: 9.5, font: f, color: col });
      const t = clean(b);
      p.drawText(t, { x: M + CW - 14 - f.widthOfTextAtSize(t, 9.5), y: y - 18, size: 9.5, font: f, color: col });
      y -= RH;
    });
    y -= 38;

    y = heading(p, ctx, "Die Kaufkraft-Lücke im Detail", y);
    y = text(p, ctx, `Dem errechneten Netto im Ruhestand steht Ihr heutiges Nettoeinkommen im aktiven Dienst gegenüber (ca. ${pct(78, 0)} der Besoldung, je nach Familienstand und Zulagen).`, M, y, 10.5, { maxW: CW, lead: 15.5 }) - 8;
    roundRect(p, M, y, CW, 84, 8, WHITE, BLUE2, 1.4);
    const lines: [string, string, boolean][] = [
      ["Monatliches Netto im aktiven Dienst:", `ca. ${eur(c.nettoAktiv)}`, false],
      ["Monatliches Netto im Ruhestand:", `ca. ${eur(c.pensionNetto)}`, false],
      ["Versorgungslücke:", `ca. ${eur(c.luecke)} / Monat`, true],
    ];
    lines.forEach(([a, b, strong], i) => {
      const ly = y - 24 - i * 22;
      const f = strong ? ctx.bold : ctx.reg;
      p.drawText(clean(a), { x: M + 16, y: ly, size: strong ? 11 : 10, font: f, color: strong ? BLUE : TITLE });
      const t = clean(b);
      p.drawText(t, { x: M + CW - 16 - f.widthOfTextAtSize(t, strong ? 12 : 10.5), y: ly, size: strong ? 12 : 10.5, font: ctx.bold, color: strong ? BLUE : TITLE });
    });
    y -= 84 + 18;

    const infl = "Die Pension wird mit den Besoldungsanpassungen fortgeschrieben. Bleiben diese hinter der tatsächlichen Inflation zurück, vergrößert sich die Differenz bis weit in den Ruhestand schleichend. Auch die Beiträge der PKV können im Alter stärker steigen als die Pension. Ein frühzeitiger, strukturierter Kapitalaufbau gleicht das aus.";
    const ih = 40 + height(ctx, infl, 9.5, CW - 36, false, 13.5);
    roundRect(p, M, y, CW, ih, 6, GREY, LINE);
    p.drawRectangle({ x: M, y: y - ih, width: 4, height: ih, color: BLUE });
    text(p, ctx, "Der Einfluss der Inflation", M + 18, y - 22, 11.5, { bold: true, color: BLUE });
    text(p, ctx, infl, M + 18, y - 40, 9.5, { maxW: CW - 36, lead: 13.5 });
    y -= ih + 16;

    const hint = "Rechtlicher Hinweis: Modellrechnung auf Basis des Beamtenversorgungsgesetzes (BeamtVG) bzw. des Landesbeamtenversorgungsgesetzes (LBeamtVG). Gerundete Endgrundgehälter, pauschale Netto-Faktoren, ohne Familienzuschläge. Die exakten Ansprüche hängen von Ihren Vordienstzeiten, Teilzeitphasen und Dienstjahren ab. Verbindlich ist nur der Bescheid Ihrer Versorgungsstelle.";
    const hh = 22 + height(ctx, hint, 8.5, CW - 28, false, 12);
    roundRect(p, M, y, CW, hh, 6, GREY, LINE);
    text(p, ctx, hint, M + 14, y - 17, 8.5, { maxW: CW - 28, lead: 12, color: MUTED });
  }

  // ================= Seite 3 =================
  {
    const p = page(ctx, 3, "Die Lösungsstrategie");
    let y = H - 98;
    y = heading(p, ctx, "Der 3-Töpfe-Fahrplan", y);
    y = text(p, ctx, "Ein nachhaltiger Vermögensaufbau basiert nicht auf einem einzelnen Produkt, sondern auf einer klaren Aufteilung nach Liquidität, steuerlicher Effizienz und Flexibilität.", M, y, 10.5, { maxW: CW, lead: 15.5 }) - 8;

    const topf: { badge: string; title: string; bullets: [string, string][]; soft?: boolean }[] = [
      {
        badge: "TOPF 1 · LIQUIDITÄT & SICHERHEIT",
        title: "Sicherheitsreserve auf Tagesgeld",
        bullets: [
          ["Ziel:", "Unvorhergesehene Ausgaben abdecken, ohne Kapital verkaufen zu müssen."],
          ["Umfang:", "Drei bis sechs Monatsausgaben auf einem Tagesgeldkonto. Dazu gehört die Absicherung bei Dienstunfähigkeit, solange Ihr Anspruch auf Ruhegehalt noch klein ist."],
        ],
      },
      {
        badge: "TOPF 2 · STEUER-HEBEL (BASISRENTE)",
        title: "Basisrente nach § 10 EStG",
        soft: true,
        bullets: [
          ["Für Beamte:", "Sie zahlen keine Pflichtbeiträge in die gesetzliche Rente. Der abziehbare Höchstbetrag wird für Beamte allerdings gekürzt."],
          ["Steuer-Effekt:", `Ihr Beispiel-Beitrag von ${eur(input.sparrate)} pro Monat bringt einen Steuervorteil von etwa ${eur(c.steuervorteilJahr)} pro Jahr. Netto kostet er etwa ${eur(c.nettoKostenMonat)} im Monat.`],
          ["Form:", "Lebenslange Rente, nicht vererbbar und nicht beleihbar, auch fondsgebunden möglich. Die spätere Rente wird nachgelagert besteuert."],
        ],
      },
      {
        badge: "TOPF 3 · FLEXIBLER KAPITALAUFBAU",
        title: "Freies Depot",
        bullets: [
          ["Ziel:", "Flexibilität vor dem offiziellen Ruhestand, zum Beispiel für ein Sabbatical, einen früheren Ruhestand oder eine Immobilie."],
          ["Funktion:", "Jederzeit verfügbar, keine feste Auszahlungsform. Erträge werden regulär besteuert, Kursschwankungen sind möglich."],
        ],
      },
    ];
    const bw = CW - 36;
    topf.forEach((t) => {
      let h = 62;
      t.bullets.forEach(([k, v]) => (h += height(ctx, `${k} ${v}`, 9, bw - 10, false, 12.5) + 4));
      roundRect(p, M, y, CW, h, 8, t.soft ? SOFT : WHITE, t.soft ? SOFT_BORDER : LINE);
      badge(p, ctx, t.badge, M + 16, y - 12);
      text(p, ctx, t.title, M + 16, y - 44, 11.5, { bold: true, color: TITLE });
      let by = y - 62;
      t.bullets.forEach(([k, v]) => {
        p.drawCircle({ x: M + 20, y: by + 3, size: 1.6, color: BLUE2 });
        const kw = ctx.bold.widthOfTextAtSize(clean(k) + " ", 9);
        p.drawText(clean(k), { x: M + 28, y: by, size: 9, font: ctx.bold, color: TITLE });
        // erster Zeilenanfang nach dem fetten Stichwort, Folgezeilen eingerückt
        const words = clean(v).split(" ");
        let line = "";
        let first = true;
        let ly = by;
        const limit = () => (first ? bw - 10 - kw : bw - 10);
        const startX = () => (first ? M + 28 + kw : M + 28);
        words.forEach((w) => {
          const test = line ? `${line} ${w}` : w;
          if (ctx.reg.widthOfTextAtSize(test, 9) > limit() && line) {
            p.drawText(line, { x: startX(), y: ly, size: 9, font: ctx.reg, color: TEXT });
            ly -= 12.5;
            first = false;
            line = w;
          } else line = test;
        });
        p.drawText(line, { x: startX(), y: ly, size: 9, font: ctx.reg, color: TEXT });
        by = ly - 16.5;
      });
      y -= h + 10;
    });

    // Sparraten-Modell
    y = text(p, ctx, "Welche Sparrate die Lücke schließen kann (Modellrechnung)", M, y - 6, 12, { bold: true, color: BLUE }) - 6;
    const gesamtKapital = kapitalFuerEntnahme(c.luecke);
    y = text(p, ctx, `Für ${eur(c.luecke)} zusätzlich pro Monat brauchen Sie bei ${Math.round(ENTNAHMERATE * 100)} % Entnahme pro Jahr ein Kapital von etwa ${eur(gesamtKapital)}.${jahre > 0 ? ` Bis zu Ihrem Pensionsalter sind es noch ${jahre} Jahre.` : ""}`, M, y, 9.5, { maxW: CW, lead: 13.5 }) - 6;
    if (jahre > 0) {
      const ws = [CW - 3 * 100, 100, 100, 100];
      roundRect(p, M, y, CW, 24, 4, BLUE);
      let x = M + 14;
      ["Sparrate pro Monat", "3 % Rendite", "5 % Rendite", "7 % Rendite"].forEach((h, i) => {
        p.drawText(h, { x, y: y - 16, size: 9.5, font: ctx.bold, color: WHITE });
        x += ws[i];
      });
      y -= 24;
      ([["Lücke zu 100 % schließen", gesamtKapital], ["Lücke zu 50 % schließen", gesamtKapital / 2]] as [string, number][]).forEach(([label, ziel]) => {
        p.drawLine({ start: { x: M, y: y - 24 }, end: { x: M + CW, y: y - 24 }, thickness: 0.5, color: LINE });
        let cx = M + 14;
        [label, ...[0.03, 0.05, 0.07].map((r) => eur(sparrateFuerZiel(ziel, jahre, r)))].forEach((cell, i) => {
          p.drawText(clean(cell), { x: cx, y: y - 16, size: 9.5, font: i === 0 ? ctx.bold : ctx.reg, color: TITLE });
          cx += ws[i];
        });
        y -= 24;
      });
    }
    y = text(p, ctx, `Ihr Beispiel-Beitrag: ${eur(input.sparrate)} pro Monat über ${jahre} Jahre ergibt bei ${Math.round(MODELL_RENDITE * 100)} % Modellrendite etwa ${eur(c.sparKapital)} Kapital, bei ${Math.round(ENTNAHMERATE * 100)} % Entnahme rund ${eur(c.zusatzRente)} pro Monat (ca. ${c.lueckeGeschlossenProzent.toFixed(0)} % Ihrer Lücke).`, M, y - 16, 9.5, { maxW: CW, lead: 13.5, bold: true, color: TITLE });
    text(p, ctx, "Modellrechnung, keine Prognose: Renditen sind nicht garantiert. Kosten, Steuern auf Erträge und Inflation sind nicht eingerechnet. Als Basisrente wird später eine lebenslange Rente gezahlt, keine Kapitalentnahme.", M, y - 4, 8, { maxW: CW, lead: 11, color: MUTED });
  }

  // ================= Seite 4 =================
  {
    const p = page(ctx, 4, "Nächste Schritte & Kontakt");
    let y = H - 98;

    const fazit = "Erst das Zusammenspiel der drei Töpfe verkleinert Ihre Versorgungslücke, ohne dass Sie im Alltag auf Liquidität oder Flexibilität verzichten müssen. Fangen Sie mit dem Beitrag an, den Sie dauerhaft halten können, und passen Sie ihn jährlich an.";
    const fh = 40 + height(ctx, fazit, 9.5, CW - 36, false, 13.5);
    roundRect(p, M, y, CW, fh, 6, GREY, LINE);
    p.drawRectangle({ x: M, y: y - fh, width: 4, height: fh, color: BLUE });
    text(p, ctx, "Strategisches Fazit", M + 18, y - 22, 11.5, { bold: true, color: BLUE });
    text(p, ctx, fazit, M + 18, y - 40, 9.5, { maxW: CW - 36, lead: 13.5 });
    y -= fh + 26;

    y = heading(p, ctx, "Warum jede Pensionsberechnung individuell geprüft werden muss", y);
    y = text(p, ctx, "Die vorliegende Auswertung ist eine Orientierung. Für belastbare Zahlen müssen Ihre persönlichen Rahmenbedingungen berücksichtigt werden:", M, y, 10.5, { maxW: CW, lead: 15.5 }) - 8;
    ([
      ["Versorgungsauskunft", "Fordern Sie bei Ihrer Versorgungsstelle eine Versorgungsauskunft an und vergleichen Sie sie mit dieser Auswertung."],
      ["Vordienstzeiten", "Zeiten aus Studium, Referendariat, Wehr- oder Zivildienst oder Angestelltenverhältnissen können Ihren Ruhegehaltssatz verändern."],
      ["Teilzeit- und Beurlaubungsphasen", "Teilzeit und Beurlaubung verringern die anrechenbaren Dienstjahre."],
      ["Grenzsteuersatz & PKV-Tarif", "Die Ersparnis über den Steuer-Hebel hängt von Ihrem Steuersatz ab, die Kosten im Alter von Ihrem PKV-Tarif. Klären Sie den Basisrente-Beitrag mit einem Steuerberater."],
    ] as [string, string][]).forEach(([t, d]) => {
      checkDot(p, M + 8.5, y - 3);
      text(p, ctx, t, M + 26, y, 10.5, { bold: true, color: TITLE });
      y = text(p, ctx, d, M + 26, y - 15, 9.5, { maxW: CW - 26, lead: 13.5 }) - 10;
    });

    // CTA
    y -= 4;
    roundRect(p, M, y, CW, 104, 8, WHITE, BLUE2, 1.6);
    const t1 = "Ihr nächster Schritt: Das persönliche Gespräch";
    p.drawText(t1, { x: M + (CW - ctx.bold.widthOfTextAtSize(t1, 13)) / 2, y: y - 28, size: 13, font: ctx.bold, color: TITLE });
    const t2 = "Lassen Sie Ihre Daten und Vordienstzeiten in einem kurzen, kostenfreien Gespräch prüfen.";
    p.drawText(t2, { x: M + (CW - ctx.reg.widthOfTextAtSize(t2, 9.5)) / 2, y: y - 46, size: 9.5, font: ctx.reg, color: TEXT });
    const t3 = "Termin buchen: cal.com/mein-beamtenportal/kostenfreie-erstberatung";
    const bwid = ctx.bold.widthOfTextAtSize(t3, 10) + 36;
    roundRect(p, M + (CW - bwid) / 2, y - 58, bwid, 26, 5, BLUE);
    p.drawText(t3, { x: M + (CW - bwid) / 2 + 18, y: y - 75, size: 10, font: ctx.bold, color: WHITE });
    const t4 = "Digital per Video oder Telefon · Unverbindlich · Kostenfrei";
    p.drawText(t4, { x: M + (CW - ctx.bold.widthOfTextAtSize(t4, 8.5)) / 2, y: y - 94, size: 8.5, font: ctx.bold, color: BLUE });
    y -= 104 + 18;

    // Absender
    roundRect(p, M, y, CW, 64, 6, GREY, LINE);
    text(p, ctx, "Mein Beamtenportal", M + 16, y - 22, 12, { bold: true, color: TITLE });
    text(p, ctx, "Unabhängiger Finanzberater & Versicherungsvertreter (§ 34d Abs. 1 GewO) · Spezialist für Beamte", M + 16, y - 38, 9, { bold: true, color: BLUE2 });
    text(p, ctx, "4,9 von 5 Sternen bei über 80 Bewertungen", M + 16, y - 53, 9, { color: TEXT });
    y -= 64 + 14;

    text(p, ctx, "Impressum & Registerangaben:", M, y, 8.5, { bold: true, color: MUTED });
    y -= 13;
    [
      "Inhaber: Albert Sibert · Gämsenbergstraße 22 · 71640 Ludwigsburg · Telefon +49 176 92609041",
      "E-Mail: kontakt@albert-sibert.de · Web: www.mein-beamtenportal.de",
      "Versicherungsvertreter mit Erlaubnis nach § 34d Abs. 1 GewO (Reg.-Nr. D-4EHE-G249E-13) und Finanzanlagenvermittler nach § 34f Abs. 1 GewO",
      "Registerabfrage: www.vermittlerregister.info · Zuständige Behörde: IHK Region Stuttgart, Jägerstraße 30, 70174 Stuttgart",
      "Schlichtungsstelle: Versicherungsombudsmann e.V., Postfach 08 06 32, 10006 Berlin",
      "Diese Auswertung dient der allgemeinen Information und ersetzt keine Steuer-, Rechts- oder Anlageberatung.",
    ].forEach((l) => {
      y = text(p, ctx, l, M, y, 8, { maxW: CW, color: MUTED, lead: 11.5 });
    });
  }

  return doc.save();
}
