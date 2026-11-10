import { PDFDocument, PDFFont, PDFPage, StandardFonts } from "pdf-lib";
import { EMOJI_OK, EMOJI_STOP, EMOJI_WARN } from "@/lib/pdf-emoji";
import { BLUE, CW, GREY, H, LINE, M, MUTED, SOFT, SOFT_BORDER, TEXT, TITLE, WHITE, clean, page, roundRect, text, wrap, type Ctx } from "@/lib/pension-pdf";

// Beamten-Versorgungs-Checkliste (A4, 2 Seiten, Sie-Form). Allgemeine Information, keine individuelle Beratung.

interface Item {
  t: string;
  warum: string;
  empf: string;
}
interface Section {
  title: string;
  items: Item[];
}

const SECTIONS: Section[] = [
  {
    title: "1. Krankenversicherung und Beihilfe",
    items: [
      {
        t: "Beihilfesatz und Restkosten-Tarif aufeinander abgestimmt?",
        warum: "Die Beihilfe übernimmt je nach Dienstherr und Familienstand meist 50 bis 70 % der Krankheitskosten (im Ruhestand und bei mehreren Kindern oft 70 %). Die PKV sollte den Rest ohne Leistungslücken abdecken.",
        empf: "Tarifbedingungen auf Ergänzungs- und Wahlleistungen prüfen.",
      },
      {
        t: "Öffnungsaktion bei Erstverbeamtung geprüft oder genutzt?",
        warum: "Bei der Erstverbeamtung gibt es zeitlich begrenzt die Möglichkeit, ohne Gesundheitsprüfung in die PKV aufgenommen zu werden, meist mit einem Risikozuschlag von höchstens 30 %.",
        empf: "Die Frist (in der Regel sechs Monate nach der Ernennung) im Blick behalten und rechtzeitig prüfen.",
      },
      {
        t: "Anwartschaft im Studium oder Referendariat gesichert?",
        warum: "Sie kann den Gesundheitszustand und das Eintrittsalter für die spätere PKV sichern, bevor neue Diagnosen den Eintritt erschweren.",
        empf: "Vor Dienstantritt prüfen, ob eine kleine oder große Anwartschaft sinnvoll ist.",
      },
      {
        t: "Beitragsentwicklung und Altersrückstellungen im Ruhestand bedacht?",
        warum: "Auch im Ruhestand zahlen Sie den Beitrag zum Restkosten-Tarif weiter, aus den Versorgungsbezügen. Tarifgestaltung und Altersrückstellungen beeinflussen die Beitragsentwicklung.",
        empf: "Tarife mit nachvollziehbarem Konzept zu Altersrückstellungen bevorzugen.",
      },
    ],
  },
  {
    title: "2. Dienstunfähigkeit und Einkommenssicherung",
    items: [
      {
        t: "Dienstunfähigkeitsklausel (DU-Klausel) in der Absicherung enthalten?",
        warum: "Eine reine Berufsunfähigkeitsabsicherung deckt für Beamte oft nicht ab, wenn der Dienstherr sie als dienstunfähig in den Ruhestand versetzt oder entlässt. Eine DU-Klausel schließt diese Lücke.",
        empf: "Bestehende Verträge auf beamtenrechtliche Wortlaute prüfen.",
      },
      {
        t: "Status berücksichtigt: Widerruf, Probe oder Lebenszeit?",
        warum: "Vor Ablauf der fünfjährigen Wartezeit besteht bei Dienstunfähigkeit ohne Dienstunfall in der Regel kein Ruhegehaltsanspruch. Beamten auf Widerruf und Probe kann die Entlassung mit Nachversicherung in der gesetzlichen Rente drohen.",
        empf: "In den ersten Dienstjahren eine anpassbare Absicherung mit ausreichender Höhe prüfen.",
      },
      {
        t: "Laufzeit und Höhe an die Pensionslücke angepasst?",
        warum: "Die Absicherung sollte bis zum geplanten Pensionsalter laufen und die Lücke zwischen Gehalt und späterer Versorgung berücksichtigen.",
        empf: "Zu kurze Laufzeiten, etwa nur bis Alter 60, vermeiden.",
      },
    ],
  },
  {
    title: "3. Pension, Steuern und Vorsorge",
    items: [
      {
        t: "Ruhegehaltfähige Dienst- und Vordienstzeiten erfasst?",
        warum: "Je nach Fall können Zeiten wie Wehr- oder Zivildienst oder Tätigkeiten im öffentlichen Dienst anerkannt werden. Je Dienstjahr steigt der Ruhegehaltssatz um etwa 1,8 Prozentpunkte, höchstens auf 71,75 %.",
        empf: "Eine Auskunft bei der zuständigen Versorgungsstelle anfordern.",
      },
      {
        t: "Besteuerung der Pension nach § 19 EStG eingeplant?",
        warum: "Die Pension ist kein Nettobetrag. Als Versorgungsbezug wird sie besteuert, der Versorgungsfreibetrag wird für spätere Jahrgänge abgeschmolzen. Dazu kommt der PKV-Beitrag.",
        empf: "Das voraussichtliche Netto nach Steuern und Krankenversicherung berechnen.",
      },
      {
        t: "Zusätzliche Vorsorge gestartet, Basisrente geprüft?",
        warum: "Beamte zahlen nicht in die gesetzliche Rentenversicherung ein. Beiträge zu einer Basisrente können nach § 10 EStG absetzbar sein, für Beamte mit gekürztem Höchstbetrag. Die Basisrente kann auch fondsgebunden, zum Beispiel auf ETF-Basis, geführt werden. Die spätere Rente wird nachgelagert besteuert.",
        empf: "Steuerliche Wirkung und passende Bausteine für die eigene Situation prüfen lassen.",
      },
    ],
  },
  {
    title: "4. Diensthaftpflicht und Familie",
    items: [
      {
        t: "Diensthaftpflicht vorhanden?",
        warum: "Bei Vorsatz oder grober Fahrlässigkeit im Dienst, etwa beim Verlust von Dienst- oder Schulschlüsseln oder bei Aufsichtspflichtverletzungen, kann der Dienstherr Regress nehmen.",
        empf: "Die private Haftpflicht um eine Diensthaftpflicht ergänzen, soweit nicht enthalten.",
      },
      {
        t: "Hinterbliebenenversorgung berücksichtigt?",
        warum: "Das Witwen- oder Witwergeld beträgt in der Regel 55 % des Ruhegehalts. Bei Kindern oder laufenden Krediten kann das knapp werden.",
        empf: "Prüfen, ob eine Risikolebensversicherung sinnvoll ergänzt.",
      },
    ],
  },
];

const SZ = 8.3;
const LEAD = 10.8;

/** Bricht Text um, die erste Zeile ist um `first` Punkte kürzer (für ein vorangestelltes Label). */
function wrapFirst(font: PDFFont, t: string, size: number, maxW: number, first: number): string[] {
  const words = clean(t).split(" ");
  const out: string[] = [];
  let line = "";
  let limit = maxW - first;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > limit && line) {
      out.push(line);
      line = w;
      limit = maxW;
    } else line = test;
  }
  out.push(line);
  return out;
}

function box(p: PDFPage, x: number, yTop: number, size = 11) {
  p.drawRectangle({ x, y: yTop - size, width: size, height: size, borderColor: BLUE, borderWidth: 1.3, color: WHITE });
}

export async function buildChecklistPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const ctx: Ctx = { doc, reg: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) };
  const TOTAL = 2;
  const RIGHT = "Versorgungs-Check 2026";
  let nr = 1;
  let p = page(ctx, nr, RIGHT, TOTAL);
  let y = H - 92;

  text(p, ctx, "Die 360°-Beamten-Versorgungs-Checkliste 2026", M, y, 20, { bold: true, color: TITLE });
  y -= 20;
  text(p, ctx, "Selbstanalyse zu Beihilfe, Dienstunfähigkeit, Pension und Vorsorge", M, y, 10.5, { bold: true, color: BLUE });
  y -= 16;

  // Angaben
  roundRect(p, M, y, CW, 32, 6, GREY, LINE);
  text(p, ctx, "Name / Datum:", M + 14, y - 20, 9, { bold: true, color: TITLE });
  p.drawLine({ start: { x: M + 88, y: y - 22 }, end: { x: M + 176, y: y - 22 }, thickness: 0.8, color: BLUE });
  text(p, ctx, "Status:", M + 186, y - 20, 9, { bold: true, color: TITLE });
  let bx = M + 224;
  for (const s of ["BaW", "BaP", "BaL"]) {
    box(p, bx, y - 11, 9);
    text(p, ctx, s, bx + 13, y - 20, 9, { color: TEXT });
    bx += 40;
  }
  text(p, ctx, "Dienstherr:", M + 350, y - 20, 9, { bold: true, color: TITLE });
  bx = M + 404;
  for (const s of ["Bund", "Land"]) {
    box(p, bx, y - 11, 9);
    text(p, ctx, s, bx + 13, y - 20, 9, { color: TEXT });
    bx += 42;
  }
  y -= 32 + 10;

  const newPage = () => {
    nr += 1;
    p = page(ctx, nr, RIGHT, TOTAL);
    y = H - 84;
  };

  const IX = M + 8;
  const IW = CW - 16;
  const TX = IX + 26;
  const TW = IW - 36;

  for (const s of SECTIONS) {
    if (y - 24 - 70 < 60) newPage();
    roundRect(p, M, y, CW, 20, 4, BLUE);
    text(p, ctx, s.title, M + 12, y - 14, 11, { bold: true, color: WHITE });
    y -= 20 + 5;
    for (const it of s.items) {
      const label = "Warum wichtig? ";
      const lw = ctx.bold.widthOfTextAtSize(label, SZ);
      const wl = wrapFirst(ctx.reg, it.warum, SZ, TW, lw);
      const el = wrap(ctx.bold, `» Empfehlung: ${it.empf}`, SZ, TW);
      const h = 12 + 13 + wl.length * LEAD + 1 + el.length * LEAD + 5;
      if (y - h < 58) newPage();
      roundRect(p, IX, y, IW, h, 5, GREY, LINE);
      box(p, IX + 10, y - 6);
      text(p, ctx, it.t, TX, y - 14, 9.6, { bold: true, color: TITLE });
      let ty = y - 27;
      p.drawText(clean(label), { x: TX, y: ty, size: SZ, font: ctx.bold, color: BLUE });
      wl.forEach((l, i) => p.drawText(l, { x: i === 0 ? TX + lw : TX, y: ty - i * LEAD, size: SZ, font: ctx.reg, color: TEXT }));
      ty -= wl.length * LEAD + 1;
      el.forEach((l, i) => p.drawText(l, { x: TX, y: ty - i * LEAD, size: SZ, font: ctx.bold, color: BLUE }));
      y -= h + 4;
    }
    y -= 4;
  }

  // Auswertungs-Schlüssel
  const rows: [string, string, string][] = [
    [EMOJI_OK, "10 bis 12 Haken:", "Gut vorbereitet. Ihre Versorgung steht auf einem soliden Fundament."],
    [EMOJI_WARN, "7 bis 9 Haken:", "Gute Basis, aber einige Stellschrauben sind noch offen."],
    [EMOJI_STOP, "Unter 7 Haken:", "Ein genauer Blick lohnt sich, besonders bei PKV, Dienstunfähigkeit und Pension."],
  ];
  const keyH = 22 + rows.length * 14 + 6;
  if (y - keyH - 92 - 80 < 52) newPage();
  roundRect(p, M, y, CW, keyH, 6, SOFT, SOFT_BORDER);
  text(p, ctx, "Ihr Auswertungs-Schlüssel", M + 14, y - 17, 10.5, { bold: true, color: BLUE });
  const imgs = await Promise.all(rows.map(([e]) => doc.embedPng(Buffer.from(e, "base64"))));
  rows.forEach(([, a, b], i) => {
    const ry = y - 34 - i * 14;
    p.drawImage(imgs[i], { x: M + 14, y: ry - 2, width: 11, height: 11 });
    p.drawText(a, { x: M + 30, y: ry, size: 9, font: ctx.bold, color: BLUE });
    p.drawText(clean(b), { x: M + 30 + ctx.bold.widthOfTextAtSize(a, 9) + 6, y: ry, size: 9, font: ctx.reg, color: TEXT });
  });
  y -= keyH + 12;

  // Gespräch
  const gh = 92;
  roundRect(p, M, y, CW, gh, 8, WHITE, BLUE, 1.6);
  const c = (t: string, size: number, yy: number, bold = false, color = TEXT) => {
    const f = bold ? ctx.bold : ctx.reg;
    p.drawText(clean(t), { x: M + (CW - f.widthOfTextAtSize(clean(t), size)) / 2, y: yy, size, font: f, color });
  };
  c("Nächster Schritt: Ihr kostenfreies 15-Minuten-Erstgespräch", 12.5, y - 24, true, TITLE);
  c("Offene Punkte oder Unsicherheiten? Wir gehen sie kostenfrei per Video oder Telefon gemeinsam durch.", 8.8, y - 40);
  const label = "Termin buchen: cal.com/mein-beamtenportal/kostenfreie-erstberatung";
  const bw = ctx.bold.widthOfTextAtSize(label, 9.5) + 32;
  roundRect(p, M + (CW - bw) / 2, y - 50, bw, 22, 5, BLUE);
  p.drawText(label, { x: M + (CW - bw) / 2 + 16, y: y - 64, size: 9.5, font: ctx.bold, color: WHITE });
  c("100 % unabhängig  ·  Spezialisiert auf Beamte  ·  Unverbindlich und digital", 8.5, y - 82, true, BLUE);
  y -= gh + 12;

  text(p, ctx, "Impressum und Registerangaben:", M, y, 8, { bold: true, color: MUTED });
  y -= 11;
  [
    "Mein Beamtenportal, Inhaber: Albert Sibert · Gämsenbergstraße 22 · 71640 Ludwigsburg · kontakt@albert-sibert.de · www.mein-beamtenportal.de",
    "Unabhängiger Finanzberater und Versicherungsvertreter mit Erlaubnis nach § 34d Abs. 1 GewO (Reg.-Nr. D-4EHE-G249E-13) und Finanzanlagenvermittler nach § 34f Abs. 1 GewO · Aufsicht: IHK Region Stuttgart · Schlichtung: Versicherungsombudsmann e.V.",
    "Diese Checkliste dient der allgemeinen Information und ersetzt keine individuelle Beratung. Regelungen können je nach Dienstherr abweichen.",
  ].forEach((l) => {
    y = text(p, ctx, l, M, y, 7.5, { maxW: CW, color: MUTED, lead: 10 });
  });

  return doc.save();
}
