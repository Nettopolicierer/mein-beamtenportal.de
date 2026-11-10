import { PDFDocument, StandardFonts } from "pdf-lib";
import { BLUE, CW, GREY, H, LINE, M, MUTED, SOFT, SOFT_BORDER, TEXT, TITLE, WHITE, W, page, roundRect, text, wrap, type Ctx } from "@/lib/pension-pdf";

// Beamten-Versorgungs-Checkliste (A4, 3 Seiten, Sie-Form). Allgemeine Information, keine individuelle Beratung.

interface Section {
  title: string;
  intro: string;
  items: { t: string; why: string }[];
}

const SECTIONS: Section[] = [
  {
    title: "1. Krankenversicherung und Beihilfe",
    intro: "Beihilfe zahlt nur einen Teil der Krankheitskosten. Den Rest decken Sie über eine private Krankenversicherung ab.",
    items: [
      { t: "Beihilfesatz bekannt?", why: "Meist 50 %, bei mehreren berücksichtigungsfähigen Kindern und im Ruhestand häufig 70 %. Die Regeln unterscheiden sich je nach Dienstherr." },
      { t: "Restkosten-Tarif passend zum Beihilfesatz?", why: "Der private Tarif sollte den Rest zu 100 % abdecken, ohne Lücken bei Leistungen, die die Beihilfe nicht erstattet." },
      { t: "Verbeamtung geplant? Öffnungsaktion prüfen", why: "Bei Erstverbeamtung gibt es zeitlich begrenzt die Möglichkeit, ohne Gesundheitsprüfung aufgenommen zu werden, meist mit einem begrenzten Risikozuschlag. Die Frist ist kurz." },
      { t: "Anwartschaft im Referendariat oder Studium?", why: "Sie kann Gesundheitsstand und Eintrittsalter sichern, solange eine Verbeamtung noch bevorsteht." },
      { t: "Beitragsentwicklung und Altersrückstellungen im Blick?", why: "Im Ruhestand zahlen Sie den Beitrag weiter, aus den Versorgungsbezügen." },
      { t: "Pflegeversicherung geregelt?", why: "Auch hier gilt für Beamte eine Pflicht zur Absicherung, meist ergänzend zur Beihilfe." },
    ],
  },
  {
    title: "2. Dienstunfähigkeit",
    intro: "Wer dienstunfähig wird, erhält nur bei erfüllten Voraussetzungen ein Ruhegehalt, und das fällt oft deutlich niedriger aus als das Gehalt.",
    items: [
      { t: "Dienstunfähigkeitsklausel in der Absicherung?", why: "Sie sorgt dafür, dass die Leistung bei Dienstunfähigkeit im beamtenrechtlichen Sinne auch dann gezahlt wird, wenn die Bedingungen der Versicherung sonst strenger wären." },
      { t: "Status beachtet: Widerruf, Probe, Lebenszeit?", why: "In den ersten Dienstjahren sind die Ansprüche bei Dienstunfähigkeit oft nur gering oder es droht eine Entlassung. Dann zählt die Nachversicherung in der gesetzlichen Rentenversicherung." },
      { t: "Wartezeit von fünf Dienstjahren für das Ruhegehalt bekannt?", why: "Ohne sie besteht bei Dienstunfähigkeit ohne Dienstunfall in der Regel kein Ruhegehaltsanspruch." },
      { t: "Laufzeit und Höhe der Absicherung passend?", why: "Die Laufzeit sollte bis zum Pensionsalter reichen, die Höhe der Lücke zwischen Gehalt und späterer Versorgung entsprechen." },
      { t: "Gesundheitsfragen ehrlich und vollständig beantwortet?", why: "Fehler bei Vorerkrankungen können den Versicherungsschutz gefährden. Vor dem Antrag lieber fachlich prüfen lassen." },
    ],
  },
  {
    title: "3. Pension und Steuern",
    intro: "Die Pension liegt meist deutlich unter dem letzten Netto. Wie groß die Lücke ist, hängt von Ihren Dienstjahren und Ihrem Ruhestandszeitpunkt ab.",
    items: [
      { t: "Anerkannte Dienstzeiten bei der Versorgungsstelle erfragt?", why: "Zeiten wie Wehr- oder Zivildienst oder frühere Tätigkeiten im öffentlichen Dienst können je nach Fall anerkannt werden." },
      { t: "Teilzeit und Beurlaubungen berücksichtigt?", why: "Teilzeitjahre zählen beim Ruhegehalt nur anteilig." },
      { t: "Versorgungsabschlag bei vorzeitigem Ruhestand kalkuliert?", why: "Er beträgt in der Regel 3,6 % je Jahr, höchstens 10,8 %, und gilt lebenslang." },
      { t: "Besteuerung der Pension eingeplant?", why: "Versorgungsbezüge werden nach § 19 EStG besteuert. Der Versorgungsfreibetrag wird für spätere Jahrgänge abgeschmolzen." },
      { t: "Zusätzliche Vorsorge gestartet?", why: "Je früher, desto länger der Zeitraum für den Aufbau. Beiträge zu einer Basisrente können nach § 10 EStG steuerlich absetzbar sein, für Beamte mit gekürztem Höchstbetrag." },
    ],
  },
  {
    title: "4. Familie und Absicherung",
    intro: "Auch außerhalb von Pension und Krankheit gibt es Punkte, die Sie einmal geprüft haben sollten.",
    items: [
      { t: "Hinterbliebenenversorgung geklärt?", why: "Das Witwen- oder Witwergeld liegt bei 55 % des Ruhegehalts. Bei Kindern oder Kredit lohnt ein Blick auf eine Risikoabsicherung." },
      { t: "Privat- und Diensthaftpflicht vorhanden?", why: "Besonders für Lehrkräfte und Personen mit Aufsichtspflicht kann eine Diensthaftpflicht wichtig sein." },
      { t: "Bestehende Verträge im Überblick?", why: "Ein jährlicher Check deckt Doppelungen, veraltete Tarife und Lücken auf." },
    ],
  },
];

export async function buildChecklistPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const ctx: Ctx = { doc, reg: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) };
  const TOTAL = 3;
  let nr = 1;
  let p = page(ctx, nr, "Beamten-Versorgungs-Checkliste 2026", TOTAL);
  let y = H - 90;

  text(p, ctx, "Ihre Versorgungs-Checkliste für Beamte", M, y, 20, { bold: true, color: TITLE });
  y -= 22;
  y = text(p, ctx, "Haken Sie ab, was bei Ihnen schon geklärt ist. Was offen bleibt, lohnt sich zuerst anzuschauen.", M, y, 10.5, { maxW: CW, color: TEXT });
  y -= 14;

  const newPage = () => {
    nr += 1;
    p = page(ctx, nr, "Beamten-Versorgungs-Checkliste 2026", TOTAL);
    y = H - 90;
  };

  for (const s of SECTIONS) {
    const headH = 20 + wrap(ctx.reg, s.intro, 9.5, CW).length * 14 + 10;
    if (y - headH - 50 < 70) newPage();
    text(p, ctx, s.title, M, y, 13.5, { bold: true, color: BLUE });
    y -= 17;
    y = text(p, ctx, s.intro, M, y, 9.5, { maxW: CW, color: MUTED, lead: 13.5 }) - 6;
    for (const it of s.items) {
      const whyLines = wrap(ctx.reg, it.why, 9, CW - 40);
      const h = 18 + whyLines.length * 12.5 + 10;
      if (y - h < 70) newPage();
      roundRect(p, M, y, CW, h, 6, GREY, LINE);
      p.drawRectangle({ x: M + 12, y: y - 22, width: 12, height: 12, borderColor: BLUE, borderWidth: 1.4, color: WHITE });
      text(p, ctx, it.t, M + 34, y - 20, 10.5, { bold: true, color: TITLE });
      whyLines.forEach((l, i) => p.drawText(l, { x: M + 34, y: y - 34 - i * 12.5, size: 9, font: ctx.reg, color: TEXT }));
      y -= h + 6;
    }
    y -= 10;
  }

  // Abschluss: Hinweis + Gespräch
  const boxH = 118;
  if (y - boxH < 60) newPage();
  roundRect(p, M, y, CW, boxH, 8, SOFT, SOFT_BORDER, 1);
  text(p, ctx, "Und jetzt?", M + 16, y - 24, 13, { bold: true, color: TITLE });
  text(
    p,
    ctx,
    "Alles, was Sie nicht abhaken konnten, prüfen wir gern gemeinsam in einem kostenfreien Gespräch von etwa 30 Minuten. Sie erhalten eine konkrete Einschätzung zu Ihrer Situation, ohne Verpflichtung.",
    M + 16,
    y - 42,
    9.5,
    { maxW: CW - 32, color: TEXT, lead: 13.5 }
  );
  text(p, ctx, "Termin buchen: cal.com/mein-beamtenportal/kostenfreie-erstberatung", M + 16, y - 92, 10, { bold: true, color: BLUE });
  y -= boxH + 16;

  text(p, ctx, "Mein Beamtenportal · Unabhängiger Finanzberater & Versicherungsvertreter (§ 34d Abs. 1 GewO)", M, y, 8.5, { bold: true, color: MUTED });
  y -= 12;
  [
    "Inhaber: Albert Sibert · Gämsenbergstraße 22 · 71640 Ludwigsburg · kontakt@albert-sibert.de",
    "Erlaubnis nach § 34d Abs. 1 GewO (Reg.-Nr. D-4EHE-G249E-13) und § 34f Abs. 1 GewO · Aufsicht: IHK Region Stuttgart · Schlichtung: Versicherungsombudsmann e.V.",
    "Diese Checkliste dient der allgemeinen Information und ersetzt keine individuelle Beratung. Regelungen können je nach Dienstherr abweichen.",
  ].forEach((l) => {
    y = text(p, ctx, l, M, y, 7.8, { maxW: CW, color: MUTED, lead: 10.5 });
  });

  return doc.save();
}
