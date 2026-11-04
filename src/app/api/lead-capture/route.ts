import { NextRequest, NextResponse } from "next/server";
import { pensionAnalysisHtml, pensionAnalysisSubject, pensionAnalysisText } from "@/lib/email-pension-analysis";
import { GRUPPEN, calcPension, type Gruppe } from "@/lib/pension-calc";
import { buildPensionPdf } from "@/lib/pension-pdf";
import { tooMany } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown, min: number, max: number) => {
  const n = typeof v === "number" ? v : Number.NaN;
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : null;
};

// Lead aus dem Pensions-Lückenrechner (Artikel zur Pension bei A13). Es werden keine
// Gesundheitsdaten abgefragt; Rechtsgrundlage ist die Einwilligung im Formular.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (clean(body.website)) return NextResponse.json({ success: true }); // Honeypot

  const email = clean(body.email);
  const gruppe = (GRUPPEN as string[]).includes(body.besoldungsgruppe) ? (body.besoldungsgruppe as Gruppe) : null;
  const alter = num(body.alter, 18, 70);
  const pensionsalter = num(body.pensionsalter, 60, 70);
  const dienstjahre = num(body.dienstjahre, 1, 45);
  const sparrate = num(body.sparrate, 0, 5000);
  const eigenesBrutto = num(body.eigenesBrutto, 1500, 15000) ?? undefined;

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
  }
  if (!gruppe || alter === null || pensionsalter === null || dienstjahre === null || sparrate === null) {
    return NextResponse.json({ error: "Die Angaben aus dem Rechner sind unvollständig." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Bitte stimme der Verarbeitung deiner Angaben zu." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(`lc-ip:${ip}`, 5, 60 * 60 * 1000) || tooMany(`lc-mail:${email.toLowerCase()}`, 2, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte versuche es später erneut." }, { status: 429 });
  }

  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL;
  if (!apiKey || !secretKey || !senderEmail) {
    return NextResponse.json(
      { error: "Der Versand ist aktuell nicht konfiguriert. Bitte versuche es später erneut." },
      { status: 500 }
    );
  }

  const c = calcPension({ gruppe, alter, pensionsalter, dienstjahre, sparrate, eigenesBrutto });
  const ergebnis = {
    nettoPension: Math.round(c.pensionNetto),
    luecke: Math.round(c.luecke),
    steuervorteilJahr: Math.round(c.steuervorteilJahr),
  };

  let pdfBase64 = "";
  try {
    const pdf = await buildPensionPdf({ gruppe, alter, pensionsalter, dienstjahre, sparrate, eigenesBrutto });
    pdfBase64 = Buffer.from(pdf).toString("base64");
  } catch (err) {
    console.error("PDF-Erzeugung fehlgeschlagen", err);
    return NextResponse.json({ error: "Die Auswertung konnte nicht erstellt werden. Bitte versuchen Sie es erneut." }, { status: 500 });
  }

  const zeilen = [
    `E-Mail: ${email}`,
    `Besoldungsgruppe: ${gruppe}${eigenesBrutto ? ` (eigene Bezüge: ${eigenesBrutto} € brutto)` : ""}`,
    `Alter heute: ${alter}`,
    `Geplantes Pensionsalter: ${pensionsalter}`,
    `Dienstjahre: ${dienstjahre}`,
    `Beispiel-Beitrag: ${sparrate} € / Monat`,
    `Netto-Pension (Richtwert): ${ergebnis.nettoPension} € / Monat`,
    `Lücke (Richtwert): ${ergebnis.luecke} € / Monat`,
    `Steuervorteil (Richtwert): ${ergebnis.steuervorteilJahr} € / Jahr`,
  ];

  const mailVars = { besoldungsgruppe: gruppe, anhang: true, ergebnis };
  const messages = [
    {
      From: { Email: senderEmail, Name: "Mein Beamtenportal Website" },
      To: [{ Email: senderEmail }],
      ReplyTo: { Email: email },
      Subject: `Neue Anfrage Pensions-Lückenrechner: ${gruppe}`,
      TextPart: `Neue Anfrage über den Pensions-Lückenrechner\n\n${zeilen.join("\n")}\n\nEinwilligung zur Kontaktaufnahme im Formular erteilt (Art. 6 Abs. 1 lit. a DSGVO). Die PDF-Auswertung wurde an die Person gesendet.`,
    },
    {
      From: { Email: senderEmail, Name: "Mein Beamtenportal" },
      To: [{ Email: email }],
      Subject: pensionAnalysisSubject(mailVars),
      TextPart: pensionAnalysisText(mailVars),
      HTMLPart: pensionAnalysisHtml(mailVars),
      Attachments: [{ ContentType: "application/pdf", Filename: `Pensionsanalyse-${gruppe}.pdf`, Base64Content: pdfBase64 }],
    },
  ];

  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`,
    },
    body: JSON.stringify({ Messages: messages }),
  });
  if (!response.ok) {
    console.error("Mailjet lead-capture send failed", response.status, await response.text().catch(() => ""));
    return NextResponse.json({ error: "Der Versand ist fehlgeschlagen. Bitte versuche es erneut." }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
