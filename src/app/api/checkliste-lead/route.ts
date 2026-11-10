import { NextRequest, NextResponse } from "next/server";
import { buildChecklistPdf } from "@/lib/checklist-pdf";
import { checklisteDeliveryHtml, checklisteDeliverySubject, checklisteDeliveryText } from "@/lib/email-nurture";
import { nurtureAdd } from "@/lib/nurture";
import { tooMany } from "@/lib/rate-limit";
import { redisConfigured } from "@/lib/redis";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Lead aus der Checkliste. Keine Gesundheitsdaten; Rechtsgrundlage ist die Einwilligung im Formular.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (clean(body.website)) return NextResponse.json({ success: true }); // Honeypot

  const email = clean(body.email);
  const vorname = clean(body.vorname, 40).replace(/[^\p{L}\s'-]/gu, "").trim();
  if (!EMAIL_REGEX.test(email)) return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }, { status: 400 });
  if (!vorname) return NextResponse.json({ error: "Bitte geben Sie Ihren Vornamen an." }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu." }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(`cl-ip:${ip}`, 5, 60 * 60 * 1000) || tooMany(`cl-mail:${email.toLowerCase()}`, 2, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }, { status: 429 });
  }

  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL;
  if (!apiKey || !secretKey || !senderEmail) {
    return NextResponse.json({ error: "Der Versand ist aktuell nicht konfiguriert. Bitte versuchen Sie es später erneut." }, { status: 500 });
  }

  let pdfBase64 = "";
  try {
    pdfBase64 = Buffer.from(await buildChecklistPdf()).toString("base64");
  } catch (err) {
    console.error("Checklisten-PDF fehlgeschlagen", err);
    return NextResponse.json({ error: "Die Checkliste konnte nicht erstellt werden. Bitte versuchen Sie es erneut." }, { status: 500 });
  }

  const vars = { vorname, quelle: "checkliste" as const, unsubscribeUrl: "" };
  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`,
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: senderEmail, Name: "Mein Beamtenportal Website" },
          To: [{ Email: senderEmail }],
          ReplyTo: { Email: email },
          Subject: "Neue Anfrage: Beamten-Versorgungs-Checkliste",
          TextPart: `Neue Anfrage über die Checkliste\n\nVorname: ${vorname}\nE-Mail: ${email}\nFolgemails: ${body.nurtureConsent === true ? "ja" : "nein"}\n\nEinwilligung im Formular erteilt (Art. 6 Abs. 1 lit. a DSGVO). Die Checkliste wurde an die Person gesendet.`,
        },
        {
          From: { Email: senderEmail, Name: "Mein Beamtenportal" },
          To: [{ Email: email }],
          Subject: checklisteDeliverySubject(vars),
          TextPart: checklisteDeliveryText(vars),
          HTMLPart: checklisteDeliveryHtml(vars),
          Attachments: [{ ContentType: "application/pdf", Filename: "Beamten-Versorgungs-Checkliste-2026.pdf", Base64Content: pdfBase64 }],
        },
      ],
    }),
  });
  if (!response.ok) {
    console.error("Mailjet checkliste send failed", response.status, await response.text().catch(() => ""));
    return NextResponse.json({ error: "Der Versand ist fehlgeschlagen. Bitte versuchen Sie es erneut." }, { status: 502 });
  }

  if (body.nurtureConsent === true && redisConfigured()) {
    try {
      await nurtureAdd({ email, vorname, quelle: "checkliste" });
    } catch (err) {
      console.error("Nurture-Eintrag fehlgeschlagen", err);
    }
  }
  return NextResponse.json({ success: true });
}
