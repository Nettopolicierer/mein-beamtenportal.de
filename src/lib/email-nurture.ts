import { BOOKING_LINK } from "@/lib/content";
import { LEGAL_FOOTER_LINES } from "@/lib/email-pension-analysis";

// Folgemails 1–3 nach der Pensions-PDF (Sie-Form). Jede Mail enthält den Abmelde-Link.

export interface NurtureMailVars {
  gruppe: string;
  luecke: number;
  nettoPension: number;
  unsubscribeUrl: string;
}

const NAVY = "#0F172A";
const ACCENT = "#1E5FA8";
const MUTED = "#64748B";
const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;
const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Mail {
  subject: string;
  paragraphs: string[];
  list?: string[];
  closing?: string[];
  cta?: { label: string; url: string };
}

function mail(stage: number, v: NurtureMailVars): Mail {
  if (stage === 0) {
    return {
      subject: "Ihre Versorgungslücke: 3 Stellschrauben, die Sie sofort nutzen können",
      paragraphs: [
        "Guten Tag,",
        `vor zwei Tagen haben Sie Ihre Pensionsauswertung für ${v.gruppe} erhalten. Ist die PDF bei Ihnen gut angekommen? Die Richtwerte lagen bei einer Netto-Pension von rund ${eur(v.nettoPension)} und einer Lücke von rund ${eur(v.luecke)} pro Monat zum heutigen Netto.`,
        "Die gute Nachricht: Diese Lücke ist keine feste Größe. Viele Beamte wissen nicht, wie stark ihre spätere Pension von Entscheidungen abhängt, die sie heute treffen. Auf diese drei Stellschrauben haben Sie schon jetzt Einfluss:",
      ],
      list: [
        "Teilzeit: Teilzeitjahre zählen beim Ruhegehalt nur anteilig. Wer zum Beispiel fünf Jahre mit halber Stelle arbeitet, erwirbt in dieser Zeit auch nur etwa die Hälfte der ruhegehaltfähigen Dienstzeit. Das wirkt wie ein dauerhafter Abschlag auf die Pension. Wer in Teilzeit geht, sollte die Auswirkung vorher kennen und gegebenenfalls gezielt ausgleichen.",
        "Dienstjahre und Vordienstzeiten: Je nach Fall können Zeiten wie Wehr- oder Zivildienst oder frühere Tätigkeiten im öffentlichen Dienst anerkannt werden. Das wird oft nie beantragt oder nie geprüft. Ein Blick in den Bescheid Ihrer Versorgungsstelle zeigt, welche Zeiten bereits berücksichtigt sind.",
        "Zeitpunkt des Ruhestands: Bei vorzeitigem Ruhestand kann ein Versorgungsabschlag von bis zu 3,6 % je Jahr anfallen, höchstens 10,8 %. Dieser Abschlag gilt lebenslang. Ein Jahr länger zu arbeiten, kann sich deshalb mehr lohnen, als es zunächst aussieht.",
      ],
      closing: [
        "Welche dieser drei Punkte bei Ihnen am meisten ins Gewicht fällt, hängt von Ihrer Dienstzeit und Ihren Plänen ab. Ein erster Schritt, der nichts kostet: Fordern Sie bei Ihrer Versorgungsstelle eine Auskunft über Ihre bisher anerkannten ruhegehaltfähigen Dienstzeiten an. Damit wird jede Berechnung deutlich genauer.",
        "In zwei Tagen schreibe ich Ihnen zum häufigsten Fehler bei der Pensionsplanung.",
      ],
    };
  }
  if (stage === 1) {
    return {
      subject: "Der häufigste Fehler bei der Pensionsplanung von Beamten",
      paragraphs: [
        "Guten Tag,",
        "in Gesprächen mit Beamten begegnet mir ein Fehler immer wieder: Die Pension wird mit dem heutigen Bruttogehalt verglichen oder mit dem Bruttobetrag auf dem Pensionsbescheid. Entscheidend ist aber, was nach Steuern und Krankenversicherung tatsächlich auf dem Konto bleibt.",
        "Drei Dinge werden dabei regelmäßig unterschätzt:",
      ],
      list: [
        "Steuern: Beamtenpensionen werden als Versorgungsbezüge nach § 19 EStG besteuert. Der Versorgungsfreibetrag mindert die Steuer, wird aber für spätere Pensionsjahrgänge schrittweise abgeschmolzen. Wer erst in einigen Jahren in Pension geht, hat weniger davon als heutige Ruheständler.",
        "Krankenversicherung: Die private Krankenversicherung läuft lebenslang weiter. Die Beihilfe steigt im Ruhestand in der Regel auf 70 %, den Rest und den Beitrag zahlen Sie aber aus den Versorgungsbezügen. Das ist ein fester Posten, der sich im Alter nicht verkleinert.",
        "Kaufkraft: Eine Pension, die heute ausreicht, ist in 25 oder 30 Jahren deutlich weniger wert. Anpassungen der Versorgung gleichen die Inflation nur teilweise aus, und die Lebenshaltungskosten steigen im Alter durch Gesundheit und Pflege eher.",
      ],
      closing: [
        `Bei Ihrem Beispiel (${v.gruppe}) lag die Lücke bei rund ${eur(v.luecke)} pro Monat. Wer diese Zahl erst kurz vor dem Ruhestand erfährt, hat kaum noch Zeit, sie zu schließen. Jedes Jahr früher hilft, weil der Zeitraum für den Vermögensaufbau länger ist und Beiträge zu einer Basisrente in der Ansparphase steuerlich absetzbar sein können.`,
        "Welche Schritte für Ihre Situation sinnvoll sind, hängt von Dienstzeit, Familienstand, Krankenversicherung und Steuersatz ab. Darüber schreibe ich Ihnen in der nächsten Mail noch einmal.",
      ],
    };
  }
  return {
    subject: "Individuelle Berechnung: Passt Ihr 3-Töpfe-Plan?",
    paragraphs: [
      "Guten Tag,",
      `in der PDF habe ich Ihnen den 3-Töpfe-Fahrplan vorgestellt. Ob er für Sie passt, hängt von Ihren echten Zahlen ab. Der Rechner liefert nur Richtwerte (bei Ihnen zuletzt: Lücke rund ${eur(v.luecke)} pro Monat), die Realität kann nach oben oder unten abweichen.`,
      "Gern rechne ich das in einem kostenlosen, unverbindlichen Gespräch individuell für Sie durch. Das Gespräch dauert etwa 30 Minuten. Dabei besprechen wir:",
    ],
    list: [
      "Ihre tatsächliche Pension auf Basis Ihrer Dienstjahre, Vordienstzeiten und Ihrer Besoldung, soweit Sie die Daten zur Hand haben.",
      "Wie hoch Ihre Lücke nach Steuern und Krankenversicherung wirklich ist, und welchen Teil davon welcher Topf abdecken kann.",
      "Welcher Beitrag zu Ihrer Situation passt, und welche Auswirkungen er steuerlich haben kann. Eine Steuerberatung ersetzt das nicht.",
    ],
    closing: [
      "Hilfreich wäre ein aktueller Bescheid Ihrer Versorgungsstelle, falls vorhanden, und Ihre letzte Besoldungsmitteilung. Es geht aber auch ohne, dann arbeiten wir mit Richtwerten.",
      "Sie wählen den Termin selbst im Kalender:",
    ],
    cta: { label: "Termin wählen", url: BOOKING_LINK },
  };
}

export const nurtureSubject = (stage: number, v: NurtureMailVars) => mail(stage, v).subject;

export function nurtureText(stage: number, v: NurtureMailVars) {
  const m = mail(stage, v);
  return `${m.paragraphs.join("\n\n")}
${m.list ? "\n" + m.list.map((l, i) => `${i + 1}. ${l}`).join("\n\n") + "\n" : ""}${m.closing ? "\n" + m.closing.join("\n\n") + "\n" : ""}${m.cta ? `\n${m.cta.label}: ${m.cta.url}\n` : ""}
Mit freundlichen Grüßen
Mein Beamtenportal
Unabhängiger Finanzberater & Versicherungsvertreter (§ 34d Abs. 1 GewO)

--
${LEGAL_FOOTER_LINES.join("\n")}
Sie erhalten diese Nachricht, weil Sie bei der Auswertungsanforderung den Folgemails zugestimmt haben.
Abmelden: ${v.unsubscribeUrl}
Impressum: https://www.mein-beamtenportal.de/impressum | Datenschutz: https://www.mein-beamtenportal.de/datenschutz`;
}

export function nurtureHtml(stage: number, v: NurtureMailVars) {
  const m = mail(stage, v);
  const p = (t: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${NAVY};">${esc(t)}</p>`;
  const list = m.list
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${m.list
        .map(
          (l, i) => `<tr><td valign="top" width="28" style="padding:0 0 14px;font-size:16px;line-height:1.6;color:${ACCENT};font-weight:700;">${i + 1}.</td><td valign="top" style="padding:0 0 14px;font-size:16px;line-height:1.6;color:${NAVY};">${esc(l)}</td></tr>`
        )
        .join("")}</table>`
    : "";
  const cta = m.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr><td style="background:${ACCENT};border-radius:6px;"><a href="${esc(m.cta.url)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">${esc(m.cta.label)}</a></td></tr></table>`
    : "";
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="color-scheme" content="light"/><title>${esc(m.subject)}</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;"><tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:8px;font-family:Arial,Helvetica,sans-serif;">
    <tr><td style="height:4px;background:${ACCENT};font-size:0;line-height:0;border-radius:8px 8px 0 0;">&nbsp;</td></tr>
    <tr><td style="padding:32px 32px 8px;">
      ${m.paragraphs.map(p).join("")}
      ${list}
      ${(m.closing ?? []).map(p).join("")}
      ${cta}
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${NAVY};">Mit freundlichen Grüßen<br/>Mein Beamtenportal</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #E2E8F0;padding:16px 0 8px;font-size:13px;line-height:1.6;color:${NAVY};">
        <strong>Mein Beamtenportal</strong><br/>Unabhängiger Finanzberater &amp; Versicherungsvertreter (§ 34d Abs. 1 GewO)<br/>Spezialist für Beamte &amp; den öffentlichen Dienst<br/>Gämsenbergstraße 22, 71640 Ludwigsburg
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:16px 32px 28px;border-top:1px solid #E2E8F0;font-size:11px;line-height:1.6;color:${MUTED};">
      ${LEGAL_FOOTER_LINES.map(esc).join("<br/>")}<br/>
      Sie erhalten diese Nachricht, weil Sie bei der Auswertungsanforderung den Folgemails zugestimmt haben.<br/>
      <a href="${esc(v.unsubscribeUrl)}" style="color:${MUTED};">Abmelden</a> | <a href="https://www.mein-beamtenportal.de/impressum" style="color:${MUTED};">Impressum</a> | <a href="https://www.mein-beamtenportal.de/datenschutz" style="color:${MUTED};">Datenschutz</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}
