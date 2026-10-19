import { NextRequest, NextResponse } from "next/server";
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT, SIGNATURE_INLINED_ATTACHMENTS } from "@/lib/email-signature";
import {
  WEBINAR_TITLE,
  WEBINAR_TEAMS_LINK,
  getNextWebinar,
} from "@/lib/webinar-config";
import { addContactToList, findOrCreateList } from "@/lib/mailjet";
import { eventListName } from "@/lib/webinar-lists";
import { createOptinToken } from "@/lib/optin-token";
import { buildWebinarIcs } from "@/lib/ics";

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { name, email, optin } = await request.json();

  const {
    start: webinarStart,
    end: webinarEnd,
    dateDisplay,
    timeDisplay,
  } = getNextWebinar();
  const webinarDateDisplay = `${dateDisplay}, ${timeDisplay} (ca. 45 Minuten)`;

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Bitte geben Sie Ihren Namen ein." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }, { status: 400 });
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

  // Eintrag in die Liste DIESES Termins (pro Termin eine eigene Liste, wird nach dem Webinar gelöscht).
  // Nicht blockierend: Die Bestätigung geht auch dann raus, Albert bekommt dann einen Hinweis.
  let listNote = "";
  try {
    const list = await findOrCreateList(eventListName(webinarStart));
    await addContactToList(list.ID, email, name);
  } catch (err) {
    console.error("Webinar-Liste: Eintrag fehlgeschlagen", err);
    listNote = "\n\nACHTUNG: Der Eintrag in die Mailjet-Liste für die Erinnerungen ist fehlgeschlagen. Bitte manuell nachtragen.";
  }

  // Optional: Einladungen zu weiteren Webinaren (Double-Opt-in per Bestätigungslink).
  let optinUrl = "";
  if (optin === true) {
    try {
      optinUrl = `https://www.mein-beamtenportal.de/api/webinar-optin?t=${createOptinToken(email)}`;
    } catch (err) {
      console.error("Webinar-Opt-in: Token konnte nicht erstellt werden", err);
    }
  }
  const optinText = optinUrl
    ? `\n\nSie möchten auch zu weiteren Webinaren und Themen für Beamte per E-Mail eingeladen werden? Bitte bestätigen Sie das mit einem Klick: ${optinUrl}\nWenn Sie das nicht angefordert haben, ignorieren Sie diesen Hinweis einfach, dann passiert nichts.`
    : "";
  const optinHtml = optinUrl
    ? `<p>Sie möchten auch zu weiteren Webinaren und Themen für Beamte per E-Mail eingeladen werden? Bitte <a href="${optinUrl}">bestätigen Sie das mit einem Klick</a>. Wenn Sie das nicht angefordert haben, ignorieren Sie diesen Hinweis einfach, dann passiert nichts.</p>`
    : "";

  const icsContent = buildWebinarIcs({
    uid: `webinar-${webinarStart.getTime()}-${email}@mein-beamtenportal.de`,
    title: WEBINAR_TITLE,
    description: `Kostenfreies Live-Webinar mit Albert Sibert. Alle Details unter https://www.mein-beamtenportal.de/webinar`,
    start: webinarStart,
    end: webinarEnd,
    meetingLink: WEBINAR_TEAMS_LINK,
  });

  const messages = [
    {
      From: { Email: senderEmail, Name: "Albert vom Beamtenportal" },
      To: [{ Email: email, Name: name }],
      Subject: `Ihre Anmeldung: Webinar "${WEBINAR_TITLE}"`,
      TextPart: `Hallo ${name},\n\nschön, dass Sie sich die Zeit nehmen, Ihre Absicherung als Beamter oder angehender Beamter frühzeitig in die Hand zu nehmen. Vielen Dank für Ihre Anmeldung zum Webinar "${WEBINAR_TITLE}".\n\nTermin: ${webinarDateDisplay}\nTeams-Link: ${WEBINAR_TEAMS_LINK}\n\nDen Termin finden Sie als Anhang dieser E-Mail direkt zum Eintragen in Ihren Kalender. Kurz vor dem Termin erhalten Sie von mir noch mehrere Erinnerungen. Falls Sie live nicht dabei sein können, melden Sie sich gerne bei mir – dann vereinbaren wir stattdessen ein kurzes persönliches Gespräch zu Ihren Fragen.${optinText}\n\n${EMAIL_SIGNATURE_TEXT}`,
      HTMLPart: `<p>Hallo ${escapeHtml(name)},</p><p>schön, dass Sie sich die Zeit nehmen, Ihre Absicherung als Beamter oder angehender Beamter frühzeitig in die Hand zu nehmen. Vielen Dank für Ihre Anmeldung zum Webinar &bdquo;${WEBINAR_TITLE}&ldquo;.</p><p><strong>Termin:</strong> ${webinarDateDisplay}<br/><strong>Teams-Link:</strong> <a href="${WEBINAR_TEAMS_LINK}">${WEBINAR_TEAMS_LINK}</a></p><p>Den Termin finden Sie als Anhang dieser E-Mail direkt zum Eintragen in Ihren Kalender. Kurz vor dem Termin erhalten Sie von mir noch mehrere Erinnerungen. Falls Sie live nicht dabei sein können, melden Sie sich gerne bei mir – dann vereinbaren wir stattdessen ein kurzes persönliches Gespräch zu Ihren Fragen.</p>${optinHtml}${EMAIL_SIGNATURE_HTML}`,
      InlinedAttachments: SIGNATURE_INLINED_ATTACHMENTS,
      Attachments: [
        {
          ContentType: "text/calendar",
          Filename: "webinar-termin.ics",
          Base64Content: Buffer.from(icsContent, "utf-8").toString("base64"),
        },
      ],
    },
    {
      From: { Email: senderEmail, Name: "Mein Beamtenportal Website" },
      To: [{ Email: senderEmail }],
      Subject: "Neue Webinar-Vormerkung über die Website",
      TextPart: `Neue Vormerkung für das Webinar "${WEBINAR_TITLE}" von: ${name} (${email})\nEinladungen zu weiteren Webinaren: ${optinUrl ? "angefordert (Bestätigung per Klick steht aus)" : "nein"}${listNote}`,
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
    console.error("Mailjet webinar-register send failed", response.status, errorBody);
    return NextResponse.json({ error: "Der Versand ist fehlgeschlagen. Bitte versuchen Sie es erneut." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
