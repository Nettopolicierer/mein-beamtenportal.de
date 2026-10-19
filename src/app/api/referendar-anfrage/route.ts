import { NextRequest, NextResponse } from "next/server";
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT, SIGNATURE_INLINED_ATTACHMENTS } from "@/lib/email-signature";
import { tooMany } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clean = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Anfrage von Referendar-Interessenten mit Vorerkrankungen (Landingpage /referendar-bw).
// Es werden bewusst KEINE Einzelheiten zur Gesundheit abgefragt, nur die Angabe, dass
// Vorerkrankungen bestehen - dafuer holt das Formular eine ausdrueckliche Einwilligung ein.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (clean(body.website)) return NextResponse.json({ success: true }); // Honeypot

  const email = clean(body.email);
  const name = clean(body.name, 80);
  const profil = {
    Schulform: clean(body.schulform),
    Start: clean(body.start),
    Jahrgang: clean(body.jahrgang, 4),
  };

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(`ra-ip:${ip}`, 5, 60 * 60 * 1000) || tooMany(`ra-mail:${email.toLowerCase()}`, 2, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }, { status: 429 });
  }

  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL;
  if (!apiKey || !secretKey || !senderEmail) {
    return NextResponse.json(
      { error: "Der Versand ist aktuell nicht konfiguriert. Bitte versuchen Sie es später erneut." },
      { status: 500 }
    );
  }

  const profilText = Object.entries(profil)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const safeName = escapeHtml(name || "");

  const messages = [
    {
      From: { Email: senderEmail, Name: "Mein Beamtenportal Website" },
      To: [{ Email: senderEmail }],
      ReplyTo: { Email: email, Name: name || undefined },
      Subject: "Neue Anfrage Referendar BW: Einordnung gewünscht",
      TextPart: `Neue Anfrage über /referendar-bw\n\n${name ? `Name: ${name}\n` : ""}E-Mail: ${email}\n${profilText}\n\nDie Person hat im Check angegeben, dass Vorerkrankungen oder laufende Behandlungen bestehen, und ausdrücklich eingewilligt, dass diese Angabe verarbeitet wird (Art. 9 Abs. 2 lit. a DSGVO). Einzelheiten wurden nicht abgefragt.`,
    },
    {
      From: { Email: senderEmail, Name: "Albert vom Beamtenportal" },
      To: [{ Email: email, Name: name || undefined }],
      Subject: "Deine Anfrage: PKV für dein Referendariat",
      TextPart: `Hallo${name ? ` ${name}` : ""},\n\nvielen Dank für deine Anfrage. Ich melde mich persönlich bei dir und wir klären gemeinsam, welcher Weg für dich passt.\n\n${EMAIL_SIGNATURE_TEXT}`,
      HTMLPart: `<p>Hallo${safeName ? ` ${safeName}` : ""},</p><p>vielen Dank für deine Anfrage. Ich melde mich persönlich bei dir und wir klären gemeinsam, welcher Weg für dich passt.</p>${EMAIL_SIGNATURE_HTML}`,
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
    console.error("Mailjet referendar-anfrage send failed", response.status, await response.text().catch(() => ""));
    return NextResponse.json({ error: "Der Versand ist fehlgeschlagen. Bitte versuchen Sie es erneut." }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
