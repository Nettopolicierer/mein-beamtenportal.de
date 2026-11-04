import { NextRequest, NextResponse } from "next/server";
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT, SIGNATURE_INLINED_ATTACHMENTS } from "@/lib/email-signature";
import { tooMany } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GRUPPEN = ["A12", "A13", "A14", "A15"];

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
  const gruppe = GRUPPEN.includes(body.besoldungsgruppe) ? (body.besoldungsgruppe as string) : "";
  const alter = num(body.alter, 18, 70);
  const pensionsalter = num(body.pensionsalter, 60, 70);
  const dienstjahre = num(body.dienstjahre, 1, 45);
  const sparrate = num(body.sparrate, 0, 5000);
  const nettoPension = num(body.nettoPension, 0, 20000);
  const luecke = num(body.luecke, 0, 20000);
  const steuervorteil = num(body.steuervorteilJahr, 0, 100000);

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
  }
  if (!gruppe || alter === null || pensionsalter === null || dienstjahre === null) {
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

  const zeilen = [
    `E-Mail: ${email}`,
    `Besoldungsgruppe: ${gruppe}`,
    `Alter heute: ${alter}`,
    `Geplantes Pensionsalter: ${pensionsalter}`,
    `Dienstjahre: ${dienstjahre}`,
    sparrate !== null && `Beispiel-Beitrag Basisrente: ${sparrate} € / Monat`,
    nettoPension !== null && `Netto-Pension (Richtwert): ${nettoPension} € / Monat`,
    luecke !== null && `Lücke (Richtwert): ${luecke} € / Monat`,
    steuervorteil !== null && `Steuervorteil (Richtwert): ${steuervorteil} € / Jahr`,
  ].filter(Boolean) as string[];

  const messages = [
    {
      From: { Email: senderEmail, Name: "Mein Beamtenportal Website" },
      To: [{ Email: senderEmail }],
      ReplyTo: { Email: email },
      Subject: `Neue Anfrage Pensions-Lückenrechner: ${gruppe}`,
      TextPart: `Neue Anfrage über den Pensions-Lückenrechner\n\n${zeilen.join("\n")}\n\nEinwilligung zur Kontaktaufnahme im Formular erteilt (Art. 6 Abs. 1 lit. a DSGVO).`,
    },
    {
      From: { Email: senderEmail, Name: "Albert vom Beamtenportal" },
      To: [{ Email: email }],
      Subject: "Deine Anfrage zur Pensionsberechnung",
      TextPart: `Hallo,\n\nvielen Dank für deine Anfrage zur Pension bei ${gruppe}. Ich schaue mir deine Angaben an und melde mich persönlich bei dir.\n\n${EMAIL_SIGNATURE_TEXT}`,
      HTMLPart: `<p>Hallo,</p><p>vielen Dank für deine Anfrage zur Pension bei ${gruppe}. Ich schaue mir deine Angaben an und melde mich persönlich bei dir.</p>${EMAIL_SIGNATURE_HTML}`,
      InlinedAttachments: SIGNATURE_INLINED_ATTACHMENTS,
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
