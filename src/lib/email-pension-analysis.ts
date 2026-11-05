import { BOOKING_LINK } from "@/lib/content";

// Persönliches Anschreiben nach der Pensionsberechnung (Sie-Form), responsiv (max. 600 px).
// Wird von /api/lead-capture mit angehängter PDF-Auswertung (src/lib/pension-pdf.ts) versendet.

export interface PensionAnalysisMailVars {
  anrede?: "Herr" | "Frau" | "";
  nachname?: string;
  besoldungsgruppe?: string; // z. B. "A13"
  terminLink?: string;
  /** true nur, wenn der Mail wirklich ein PDF angehängt wird. */
  anhang?: boolean;
  /** Ergebnis aus dem Rechner (gerundete Richtwerte), falls vorhanden. */
  ergebnis?: { nettoPension: number; luecke: number; steuervorteilJahr: number };
}

const NAVY = "#0F172A";
const GOLD = "#1E5FA8"; // Akzentblau (Name aus der ersten Version beibehalten)
const MUTED = "#64748B";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;

function greeting(v: PensionAnalysisMailVars) {
  const name = (v.nachname ?? "").trim();
  return v.anrede && name ? `Guten Tag ${v.anrede} ${name},` : "Guten Tag,";
}

export function pensionAnalysisSubject(v: PensionAnalysisMailVars = {}) {
  return `Ihre Pensionsanalyse ${v.besoldungsgruppe || "A13"} & der 3-Töpfe-Fahrplan`;
}

const POINTS = [
  {
    title: "Besteuerung der Pension",
    text: "Beamtenpensionen werden als Versorgungsbezüge nach § 19 EStG besteuert. Der Versorgungsfreibetrag mindert die Steuer, wird aber für spätere Pensionsjahrgänge schrittweise abgeschmolzen. Dazu entfallen Zulagen, die nicht ruhegehaltfähig sind. So entsteht eine spürbare Lücke zum letzten Nettoeinkommen.",
  },
  {
    title: "Die PKV bleibt lebenslang bestehen",
    text: "Der Beihilfesatz steigt im Ruhestand in der Regel auf 70 %. Für den verbleibenden Teil der Krankheitskosten bleibt Ihre private Krankenversicherung bestehen, ihr Beitrag wird lebenslang aus den Versorgungsbezügen bezahlt.",
  },
  {
    title: "Der steuerliche Hebel",
    text: "Als Beamter zahlen Sie keine Pflichtbeiträge zur gesetzlichen Rentenversicherung. Beiträge zu einer Basisrente sind nach § 10 EStG steuerlich absetzbar, wobei der Höchstbetrag für Beamte gekürzt wird. Eine Basisrente kann fondsgebunden, zum Beispiel auf ETF-Basis, geführt werden. Die spätere Rente wird nachgelagert besteuert.",
  },
];

export const LEGAL_FOOTER_LINES = [
  "Mein Beamtenportal, Inhaber: Albert Sibert, Gämsenbergstraße 22, 71640 Ludwigsburg",
  "Zulassung als Versicherungsvertreter nach § 34d Abs. 1 GewO (Reg.-Nr. D-4EHE-G249E-13) und Finanzanlagenvermittler nach § 34f Abs. 1 GewO",
  "Zuständige Aufsichtsbehörde: IHK Region Stuttgart, Jägerstraße 30, 70174 Stuttgart",
  "Schlichtungsstelle: Versicherungsombudsmann e.V., Postfach 08 06 32, 10006 Berlin",
];

const FOOTER_LINES = [
  ...LEGAL_FOOTER_LINES,
  "Sie erhalten diese Nachricht, weil Sie auf mein-beamtenportal.de eine Auswertung angefordert haben.",
];

export function pensionAnalysisText(v: PensionAnalysisMailVars = {}) {
  const gruppe = v.besoldungsgruppe || "A13";
  const link = v.terminLink || BOOKING_LINK;
  const ergebnis = v.ergebnis
    ? `\nIhre Werte aus dem Rechner (Richtwerte, heutige Kaufkraft):\n- Voraussichtliche Netto-Pension: ${eur(v.ergebnis.nettoPension)} pro Monat\n- Lücke zum heutigen Netto: ${eur(v.ergebnis.luecke)} pro Monat\n- Möglicher Steuervorteil (Schätzung, bis ca.) bei Ihrem Beispiel-Beitrag: ${eur(v.ergebnis.steuervorteilJahr)} pro Jahr\n`
    : "";
  return `${greeting(v)}

hier erhalten Sie Ihre angeforderte Auswertung zur Pensionsberechnung bei Besoldungsgruppe ${gruppe}.
${ergebnis}
Drei Punkte, die im Ruhestand häufig unterschätzt werden:

${POINTS.map((p, i) => `${i + 1}. ${p.title}: ${p.text}`).join("\n\n")}
${v.anhang ? "\nIhre detaillierte PDF-Auswertung ist dieser Nachricht beigefügt.\n" : ""}
Wenn Sie Ihre individuellen Dienstjahre, Vordienstzeiten und das konkrete Steuer-Einsparpotenzial einmal exakt berechnen lassen möchten, können Sie sich hier einen kurzen Termin reservieren:
Termin vereinbaren: ${link}

Mit freundlichen Grüßen
Mein Beamtenportal

--
Mein Beamtenportal
Unabhängiger Finanzberater & Versicherungsvertreter (§ 34d Abs. 1 GewO)
Spezialist für Beamte & den öffentlichen Dienst
Gämsenbergstraße 22, 71640 Ludwigsburg
Web: www.mein-beamtenportal.de | E-Mail: kontakt@albert-sibert.de

${FOOTER_LINES.join("\n")}
Impressum: https://www.mein-beamtenportal.de/impressum | Datenschutz: https://www.mein-beamtenportal.de/datenschutz`;
}

export function pensionAnalysisHtml(v: PensionAnalysisMailVars = {}) {
  const gruppe = esc(v.besoldungsgruppe || "A13");
  const link = esc(v.terminLink || BOOKING_LINK);
  const p = (inner: string, extra = "") => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${NAVY};${extra}">${inner}</p>`;

  const ergebnis = v.ergebnis
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border:1px solid #E2E8F0;border-radius:6px;">
        <tr><td style="padding:14px 16px;font-size:14px;line-height:1.7;color:${NAVY};">
          <strong>Ihre Werte aus dem Rechner</strong> <span style="color:${MUTED};">(Richtwerte, heutige Kaufkraft)</span><br/>
          Voraussichtliche Netto-Pension: <strong>${eur(v.ergebnis.nettoPension)}</strong> pro Monat<br/>
          Lücke zum heutigen Netto: <strong>${eur(v.ergebnis.luecke)}</strong> pro Monat<br/>
          Möglicher Steuervorteil (Schätzung, bis ca.) bei Ihrem Beispiel-Beitrag: <strong>${eur(v.ergebnis.steuervorteilJahr)}</strong> pro Jahr
        </td></tr></table>`
    : "";

  const points = POINTS.map(
    (pt, i) => `<tr>
      <td valign="top" width="28" style="padding:0 0 14px;font-size:16px;line-height:1.6;color:${GOLD};font-weight:700;">${i + 1}.</td>
      <td valign="top" style="padding:0 0 14px;font-size:16px;line-height:1.6;color:${NAVY};"><strong>${pt.title}:</strong> ${esc(pt.text)}</td>
    </tr>`
  ).join("");

  return `<!doctype html>
<html lang="de"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>${esc(pensionAnalysisSubject(v))}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:8px;font-family:Arial,Helvetica,sans-serif;">
    <tr><td style="height:4px;background:${GOLD};font-size:0;line-height:0;border-radius:8px 8px 0 0;">&nbsp;</td></tr>
    <tr><td style="padding:32px 32px 8px;">
      ${p(esc(greeting(v)))}
      ${p(`hier erhalten Sie Ihre angeforderte Auswertung zur Pensionsberechnung bei Besoldungsgruppe ${gruppe}.`)}
      ${ergebnis}
      ${p("Drei Punkte, die im Ruhestand häufig unterschätzt werden:", "margin-bottom:12px;")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${points}</table>
      ${v.anhang ? p("Ihre detaillierte PDF-Auswertung ist dieser Nachricht beigefügt.") : ""}
      ${p("Wenn Sie Ihre individuellen Dienstjahre, Vordienstzeiten und das konkrete Steuer-Einsparpotenzial einmal exakt berechnen lassen möchten, können Sie sich hier einen kurzen Termin reservieren:")}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr>
        <td style="background:${GOLD};border-radius:6px;">
          <a href="${link}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">Termin vereinbaren</a>
        </td>
      </tr></table>
      ${p("Mit freundlichen Grüßen<br/>Mein Beamtenportal", "margin-bottom:24px;")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #E2E8F0;padding:16px 0 8px;font-size:13px;line-height:1.6;color:${NAVY};">
        <strong>Mein Beamtenportal</strong><br/>
        Unabhängiger Finanzberater &amp; Versicherungsvertreter (§ 34d Abs. 1 GewO)<br/>
        Spezialist für Beamte &amp; den öffentlichen Dienst<br/>
        Gämsenbergstraße 22, 71640 Ludwigsburg<br/>
        Web: <a href="https://www.mein-beamtenportal.de" style="color:${NAVY};">www.mein-beamtenportal.de</a> | E-Mail: <a href="mailto:kontakt@albert-sibert.de" style="color:${NAVY};">kontakt@albert-sibert.de</a>
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:16px 32px 28px;border-top:1px solid #E2E8F0;font-size:11px;line-height:1.6;color:${MUTED};">
      ${FOOTER_LINES.map(esc).join("<br/>")}<br/>
      <a href="https://www.mein-beamtenportal.de/impressum" style="color:${MUTED};">Impressum</a> | <a href="https://www.mein-beamtenportal.de/datenschutz" style="color:${MUTED};">Datenschutz</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}
