import { NextRequest, NextResponse } from "next/server";
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT, SIGNATURE_INLINED_ATTACHMENTS } from "@/lib/email-signature";
import { tooMany } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clean = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const THEMEN = ["Dienstunfähigkeit / BU", "PKV und Beihilfe", "Altersvorsorge", "Vertragscheck"];
const ZEITEN = ["Vormittags (bis 12 Uhr)", "Mittags (12–14 Uhr)", "Nachmittags (14–17 Uhr)", "Abends (ab 17 Uhr)"];
const STATUS = ["Anwärter / Referendar", "Beamter auf Probe", "Beamter auf Lebenszeit", "Sonstiges"];

// Anfrage über die Instagram-Landingpage /anfrage. Es werden keine Gesundheitsdaten abgefragt;
// Rechtsgrundlage ist die Einwilligung im Formular (Art. 6 Abs. 1 lit. a DSGVO).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (clean(body.website)) return NextResponse.json({ success: true }); // Honeypot

  const email = clean(body.email);
  const name = clean(body.name, 80);
  const telefon = clean(body.telefon, 40);
  const nachricht = clean(body.nachricht, 1000);
  const status = STATUS.includes(body.status) ? body.status : "";
  const zeit = ZEITEN.includes(body.zeit) ? body.zeit : "";
  const themen: string[] = Array.isArray(body.themen) ? body.themen.filter((t: unknown) => THEMEN.includes(t as string)) : [];

  if (!name) return NextResponse.json({ error: "Bitte gib deinen Vornamen an." }, { status: 400 });
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
  }
  if (themen.length === 0) {
    return NextResponse.json({ error: "Bitte wähle mindestens ein Thema aus." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Bitte stimme der Verarbeitung deiner Angaben zu." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(`an-ip:${ip}`, 5, 60 * 60 * 1000) || tooMany(`an-mail:${email.toLowerCase()}`, 2, 24 * 60 * 60 * 1000)) {
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
    `Name: ${name}`,
    `E-Mail: ${email}`,
    telefon && `Telefon: ${telefon}`,
    status && `Status: ${status}`,
    `Themen: ${themen.join(", ")}`,
    zeit && `Rückruf am liebsten: ${zeit}`,
    nachricht && `Nachricht:\n${nachricht}`,
  ].filter(Boolean) as string[];
  const safeName = escapeHtml(name);

  const messages = [
    {
      From: { Email: senderEmail, Name: "Mein Beamtenportal Website" },
      To: [{ Email: senderEmail }],
      ReplyTo: { Email: email, Name: name },
      Subject: `Neue Anfrage über /anfrage: ${themen.join(", ")}`,
      TextPart: `Neue Anfrage über /anfrage (Instagram)\n\n${zeilen.join("\n")}\n\nEinwilligung zur Kontaktaufnahme im Formular erteilt (Art. 6 Abs. 1 lit. a DSGVO).`,
    },
    {
      From: { Email: senderEmail, Name: "Albert vom Beamtenportal" },
      To: [{ Email: email, Name: name }],
      Subject: "Deine Anfrage bei Mein Beamtenportal",
      TextPart: `Hallo ${name},\n\nvielen Dank für deine Anfrage zu: ${themen.join(", ")}. Ich melde mich in der Regel innerhalb von 24 Stunden persönlich bei dir.\n\n${EMAIL_SIGNATURE_TEXT}`,
      HTMLPart: `<p>Hallo ${safeName},</p><p>vielen Dank für deine Anfrage zu: ${escapeHtml(themen.join(", "))}. Ich melde mich in der Regel innerhalb von 24 Stunden persönlich bei dir.</p>${EMAIL_SIGNATURE_HTML}`,
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
    console.error("Mailjet anfrage send failed", response.status, await response.text().catch(() => ""));
    return NextResponse.json({ error: "Der Versand ist fehlgeschlagen. Bitte versuche es erneut." }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
