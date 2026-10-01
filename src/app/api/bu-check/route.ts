import { NextRequest, NextResponse } from "next/server";
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "@/lib/email-signature";
import { BOOKING_LINK } from "@/lib/content";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clean(value: unknown, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Honeypot: echte Nutzer lassen das unsichtbare Feld leer.
  if (clean(body.website)) return NextResponse.json({ success: true });

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const phone = clean(body.phone, 40);
  const answers = {
    "Lead-Score": clean(body.score),
    Status: clean(body.status),
    Beruf: clean(body.beruf),
    Alter: clean(body.alter),
    "Netto (Angabe)": clean(body.netto),
    Dienstjahre: clean(body.dienstjahre),
    "Bestehender Vertrag": clean(body.vertrag),
    "Versicherte Rente": clean(body.vertragsrente),
    Beitrag: clean(body.beitrag),
    Dienstunfähigkeitsklausel: clean(body.klausel),
    "Laufzeit bis Pensionsalter": clean(body.laufzeit),
    Nachversicherungsgarantie: clean(body.nachversicherung),
    "Ergebnis im Check": clean(body.ergebnis, 300),
    Quelle: clean(body.source, 200),
  };

  if (name.length < 2) {
    return NextResponse.json({ error: "Bitte geben Sie Ihren Namen ein." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Bitte stimmen Sie der Kontaktaufnahme zu." }, { status: 400 });
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

  const answerLines = Object.entries(answers)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const safeName = escapeHtml(name);

  const messages = [
    {
      From: { Email: senderEmail, Name: "Mein Beamtenportal Website" },
      To: [{ Email: senderEmail }],
      ReplyTo: { Email: email, Name: name },
      Subject: `Neuer BU-Check-Lead (${answers["Lead-Score"].split(" ")[0] || "?"}): ${name}`,
      TextPart: `Neuer Lead über /bu-check\n\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone || "-"}\n\n${answerLines}\n\nEinwilligung zur Kontaktaufnahme: ja`,
    },
    {
      From: { Email: senderEmail, Name: "Albert vom Beamtenportal" },
      To: [{ Email: email, Name: name }],
      Subject: "Ihr BU-Check: nächster Schritt",
      TextPart: `Hallo ${name},\n\nvielen Dank für Ihre Angaben zum BU-Check. Ich schaue mir Ihre Situation an und melde mich persönlich bei Ihnen.\n\nWenn Sie nicht warten möchten, können Sie sich hier direkt einen Termin für das kostenfreie Erstgespräch aussuchen:\n${BOOKING_LINK}\n\n${EMAIL_SIGNATURE_TEXT}`,
      HTMLPart: `<p>Hallo ${safeName},</p><p>vielen Dank für Ihre Angaben zum BU-Check. Ich schaue mir Ihre Situation an und melde mich persönlich bei Ihnen.</p><p>Wenn Sie nicht warten möchten, können Sie sich hier direkt einen Termin für das kostenfreie Erstgespräch aussuchen:<br/><a href="${BOOKING_LINK}">${BOOKING_LINK}</a></p>${EMAIL_SIGNATURE_HTML}`,
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
    const errorBody = await response.text().catch(() => "");
    console.error("Mailjet bu-check send failed", response.status, errorBody);
    return NextResponse.json({ error: "Der Versand ist fehlgeschlagen. Bitte versuchen Sie es erneut." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
