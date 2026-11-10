import { BOOKING_LINK } from "@/lib/content";
import { LEGAL_FOOTER_LINES } from "@/lib/email-pension-analysis";

// Folgemails 1–3 nach der Pensions-PDF (Sie-Form). Jede Mail enthält den Abmelde-Link.

export interface NurtureMailVars {
  vorname?: string;
  quelle?: "checkliste";
  gruppe?: string;
  luecke?: number;
  nettoPension?: number;
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

const greet = (v: NurtureMailVars) => (v.vorname ? `Guten Tag ${v.vorname},` : "Guten Tag,");

function mail(stage: number, v: NurtureMailVars): Mail {
  if (v.quelle === "checkliste") return checklisteMail(stage, v);
  const gruppe = v.gruppe ?? "A13";
  const luecke = v.luecke ?? 0;
  const nettoPension = v.nettoPension ?? 0;
  const abschlagMonat = eur(nettoPension * 0.036);
  if (stage === 0) {
    return {
      subject: "Ihre Pensionslücke: Was 3 Stellschrauben in Euro ausmachen",
      paragraphs: [
        greet(v),
        `vor zwei Tagen haben Sie Ihre Pensionsauswertung für ${gruppe} erhalten: Netto-Pension rund ${eur(nettoPension)}, Lücke rund ${eur(luecke)} pro Monat. Ist die PDF gut angekommen?`,
        "Das Entscheidende: Diese Lücke steht nicht fest. Viele Beamte erfahren erst kurz vor dem Ruhestand, wie stark ihre Pension von Entscheidungen abhängt, die Jahre vorher fallen. Drei Beispiele, was dahintersteckt:",
      ],
      list: [
        `Zeitpunkt des Ruhestands: Bei vorzeitigem Ruhestand kann ein Versorgungsabschlag von 3,6 % je Jahr anfallen (höchstens 10,8 %), und zwar lebenslang. Bei Ihrer Netto-Pension von ${eur(nettoPension)} wären 3,6 % etwa ${abschlagMonat} weniger pro Monat, für jedes Jahr früher.`,
        "Teilzeit: Teilzeitjahre zählen nur anteilig. Fünf Jahre mit halber Stelle bedeuten rund 2,5 Dienstjahre weniger und damit knapp 4,5 Prozentpunkte beim Ruhegehaltssatz. Das merkt man jeden Monat bis ans Lebensende.",
        "Vordienstzeiten: Je nach Fall können Wehr- oder Zivildienst oder frühere Tätigkeiten im öffentlichen Dienst anerkannt werden. Jedes anerkannte Jahr erhöht den Ruhegehaltssatz um etwa 1,8 Prozentpunkte. Genau das wird oft nie geprüft.",
      ],
      closing: [
        "Ein erster Schritt, der nichts kostet: Fragen Sie bei Ihrer Versorgungsstelle nach Ihren bisher anerkannten ruhegehaltfähigen Dienstzeiten.",
        "Wenn Sie wissen möchten, welche der drei Punkte bei Ihnen am meisten ausmachen, schauen wir gemeinsam darauf, kostenlos und unverbindlich:",
      ],
      cta: { label: "Kurz besprechen", url: BOOKING_LINK },
    };
  }
  if (stage === 1) {
    return {
      subject: "Der häufigste Fehler bei der Pensionsplanung von Beamten",
      paragraphs: [
        greet(v),
        "in Gesprächen mit Beamten begegnet mir ein Fehler immer wieder: Die Pension wird mit dem Brutto verglichen. Auf dem Bescheid steht eine Zahl, die gut aussieht. Entscheidend ist aber, was nach Steuern und Krankenversicherung auf dem Konto bleibt.",
        "Drei Dinge werden dabei regelmäßig unterschätzt:",
      ],
      list: [
        "Steuern: Pensionen werden als Versorgungsbezüge nach § 19 EStG besteuert. Der Versorgungsfreibetrag schmilzt für spätere Pensionsjahrgänge Schritt für Schritt ab. Wer später in Pension geht, behält davon weniger als die heutigen Ruheständler.",
        "Krankenversicherung: Die PKV läuft lebenslang weiter. Die Beihilfe steigt meist auf 70 %, den Rest und den Beitrag zahlen Sie aus der Pension, ein fester Posten, der sich nicht verkleinert.",
        "Kaufkraft: Eine Pension, die heute reicht, ist in 25 bis 30 Jahren deutlich weniger wert. Die Lebenshaltungskosten steigen im Alter durch Gesundheit und Pflege eher.",
      ],
      closing: [
        `Bei Ihrem Beispiel (${gruppe}) lag die Lücke bei rund ${eur(luecke)} pro Monat. Je früher sie bekannt ist, desto leichter lässt sie sich schließen, denn jedes Jahr früher bedeutet mehr Zeit für den Vermögensaufbau und steuerlich geförderte Beiträge.`,
        "Wie groß die Lücke bei Ihnen wirklich ist, hängt von Dienstzeit, Familienstand, Krankenversicherung und Steuersatz ab. Das lässt sich in einem kurzen Gespräch klären:",
      ],
      cta: { label: "Meine Lücke klären", url: BOOKING_LINK },
    };
  }
  return {
    subject: "Individuelle Berechnung: Passt Ihr 3-Töpfe-Plan?",
    paragraphs: [
      greet(v),
      `in der PDF habe ich Ihnen den 3-Töpfe-Fahrplan vorgestellt. Ob er für Sie passt, hängt von Ihren echten Zahlen ab. Der Rechner liefert nur Richtwerte (bei Ihnen zuletzt: Lücke rund ${eur(luecke)} pro Monat). Mit Ihren tatsächlichen Daten wird daraus eine belastbare Zahl.`,
      "Dafür biete ich Ihnen ein kostenloses, unverbindliches Gespräch an (etwa 15 Minuten). Sie gehen danach mit diesen Antworten raus:",
    ],
    list: [
      "Wie hoch Ihre Pension auf Basis von Dienstjahren, Vordienstzeiten und Besoldung tatsächlich ausfällt, und wie groß Ihre Lücke nach Steuern und Krankenversicherung wirklich ist.",
      "Welche Stellschrauben (Ruhestandszeitpunkt, Teilzeit, Vordienstzeiten) bei Ihnen den größten Unterschied machen.",
      "Welche Töpfe und welcher Beitrag zu Ihrer Situation passen, mit einem konkreten Vorschlag, den Sie in Ruhe prüfen können (keine Steuerberatung).",
    ],
    closing: [
      "Es gibt keine Verpflichtung. Hilfreich, aber nicht nötig: Ihr letzter Bescheid der Versorgungsstelle und Ihre Besoldungsmitteilung. Den Termin wählen Sie selbst:",
    ],
    cta: { label: "Termin wählen", url: BOOKING_LINK },
  };
}

const greetC = greet;

function checklisteMail(stage: number, v: NurtureMailVars): Mail {
  if (stage === 0) {
    return {
      subject: "Welche Punkte der Checkliste sind bei Ihnen noch offen?",
      paragraphs: [
        greetC(v),
        "vor zwei Tagen haben Sie die Beamten-Versorgungs-Checkliste erhalten. Konnten Sie schon einige Punkte abhaken?",
        "Eine kurze Frage an Sie: Wo stehen Sie gerade, im Studium oder Referendariat, auf Probe oder bereits auf Lebenszeit verbeamtet? Antworten Sie einfach kurz auf diese Mail. Je nachdem sind andere Punkte besonders wichtig:",
      ],
      list: [
        "Referendariat oder Studium: Anwartschaft in der PKV und die Absicherung bei Dienstunfähigkeit, solange Sie noch gesund und jung sind.",
        "Beamte auf Probe: Öffnungsaktion der PKV prüfen, Status bei Dienstunfähigkeit klären und die Wartezeit von fünf Dienstjahren im Blick behalten.",
        "Beamte auf Lebenszeit: Pensionslücke berechnen, Vordienstzeiten prüfen lassen und die Altersvorsorge steuerlich sinnvoll aufstellen.",
      ],
      closing: ["Gerade beim letzten Punkt hilft ein Zahlenbeispiel. Dazu schreibe ich Ihnen in zwei Tagen."],
    };
  }
  if (stage === 1) {
    return {
      subject: "Rechenbeispiel: Was einem Beamten im Ruhestand netto fehlt",
      paragraphs: [
        greetC(v),
        "ein Zahlenbeispiel zur Pensionslücke (fiktiv, kein Einzelfall): Besoldungsgruppe A13, 35 Jahre alt, 40 Dienstjahre, Ruhestand mit 67.",
      ],
      list: [
        "Heutiges Netto: rund 4.758 € im Monat.",
        "Voraussichtliche Netto-Pension: rund 3.283 € im Monat, nach Steuern, Pflege und Krankenversicherung.",
        "Lücke: rund 1.475 € im Monat in heutiger Kaufkraft. Das sind etwa 31 % weniger Netto als im Dienst.",
      ],
      closing: [
        "Alle Werte sind Richtwerte einer vereinfachten Modellrechnung und keine Zusage. Wie es bei Ihnen aussieht, rechnet der Pensionsrechner in einer Minute aus. Auf Wunsch erhalten Sie die Auswertung als PDF:",
      ],
      cta: { label: "Meine Pensionslücke berechnen", url: "https://www.mein-beamtenportal.de/pensionsrechner" },
    };
  }
  return {
    subject: "Checkliste gemeinsam durchgehen: 15 Minuten, kostenlos",
    paragraphs: [
      greetC(v),
      "die Checkliste zeigt, was zu prüfen ist. Was davon für Sie wirklich wichtig ist, hängt von Ihrem Status, Ihrer Familie und Ihren Plänen ab.",
      "Gern gehe ich die offenen Punkte in einem kostenlosen, unverbindlichen Gespräch (etwa 15 Minuten) mit Ihnen durch. Danach wissen Sie, welche zwei oder drei Punkte bei Ihnen Vorrang haben und was als Nächstes sinnvoll ist. Den Termin wählen Sie selbst:",
    ],
    cta: { label: "Termin wählen", url: BOOKING_LINK },
  };
}

export const nurtureSubject = (stage: number, v: NurtureMailVars) => mail(stage, v).subject;

export const nurtureText = (stage: number, v: NurtureMailVars) => renderText(mail(stage, v), v);
export const nurtureHtml = (stage: number, v: NurtureMailVars) => renderHtml(mail(stage, v), v);

const REASON_FOLLOW = "Sie erhalten diese Nachricht, weil Sie bei Ihrer Anforderung den Folgemails zugestimmt haben.";
const REASON_DELIVERY = "Sie erhalten diese Nachricht, weil Sie auf mein-beamtenportal.de die Checkliste angefordert haben.";

function renderText(m: Mail, v: NurtureMailVars, delivery = false) {
  return `${m.paragraphs.join("\n\n")}
${m.list ? "\n" + m.list.map((l, i) => `${i + 1}. ${l}`).join("\n\n") + "\n" : ""}${m.closing ? "\n" + m.closing.join("\n\n") + "\n" : ""}${m.cta ? `\n${m.cta.label}: ${m.cta.url}\n` : ""}
Mit freundlichen Grüßen
Mein Beamtenportal
Unabhängiger Finanzberater (§ 34d / § 34f GewO)

--
${LEGAL_FOOTER_LINES.join("\n")}
${delivery ? REASON_DELIVERY : REASON_FOLLOW + "\nAbmelden: " + v.unsubscribeUrl}
Impressum: https://www.mein-beamtenportal.de/impressum | Datenschutz: https://www.mein-beamtenportal.de/datenschutz`;
}

function renderHtml(m: Mail, v: NurtureMailVars, delivery = false) {
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
        <strong>Mein Beamtenportal</strong><br/>Unabhängiger Finanzberater (§ 34d / § 34f GewO)<br/>Spezialist für Beamte &amp; den öffentlichen Dienst<br/>Gämsenbergstraße 22, 71640 Ludwigsburg
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:16px 32px 28px;border-top:1px solid #E2E8F0;font-size:11px;line-height:1.6;color:${MUTED};">
      ${LEGAL_FOOTER_LINES.map(esc).join("<br/>")}<br/>
      ${delivery ? REASON_DELIVERY : REASON_FOLLOW}<br/>
      ${delivery ? "" : `<a href="${esc(v.unsubscribeUrl)}" style="color:${MUTED};">Abmelden</a> | `}<a href="https://www.mein-beamtenportal.de/impressum" style="color:${MUTED};">Impressum</a> | <a href="https://www.mein-beamtenportal.de/datenschutz" style="color:${MUTED};">Datenschutz</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

// Mail mit der angehängten Checkliste (sofort nach der Anforderung, keine Werbung, kein Abmelde-Link nötig).
const deliveryMail = (v: NurtureMailVars): Mail => ({
  subject: "Ihre Beamten-Versorgungs-Checkliste 2026",
  paragraphs: [
    greet(v),
    "im Anhang finden Sie Ihre Beamten-Versorgungs-Checkliste als PDF. Sie führt Sie durch Krankenversicherung und Beihilfe, Dienstunfähigkeit, Pension und Steuern sowie die Absicherung der Familie.",
    "Haken Sie ab, was bei Ihnen schon geklärt ist. Was offen bleibt, schauen Sie sich zuerst an. Bei Fragen antworten Sie einfach auf diese Mail.",
  ],
});
export const checklisteDeliverySubject = (v: NurtureMailVars) => deliveryMail(v).subject;
export const checklisteDeliveryText = (v: NurtureMailVars) => renderText(deliveryMail(v), v, true);
export const checklisteDeliveryHtml = (v: NurtureMailVars) => renderHtml(deliveryMail(v), v, true);
