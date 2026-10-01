import { NextRequest, NextResponse } from "next/server";
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "@/lib/email-signature";
import {
  WEBINAR_TITLE,
  WEBINAR_TEAMS_LINK,
  WEBINAR_CONTACT_LIST_ID,
  getNextWebinar,
} from "@/lib/webinar-config";
import { buildWebinarIcs } from "@/lib/ics";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { name, email } = await request.json();

  const {
    start: webinarStart,
    end: webinarEnd,
    dateDisplay,
    timeDisplay,
  } = getNextWebinar();
  const webinarDateDisplay = `${dateDisplay}, ${timeDisplay} (ca. 60 Minuten)`;

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

  const icsContent = buildWebinarIcs({
    uid: `webinar-${webinarStart.getTime()}-${email}@mein-beamtenportal.de`,
    title: WEBINAR_TITLE,
    description: `Kostenfreies Live-Webinar mit Albert Sibert. Alle Details unter https://mein-beamtenportal.de/webinar`,
    start: webinarStart,
    end: webinarEnd,
    meetingLink: WEBINAR_TEAMS_LINK,
  });

  const messages = [
    {
      From: { Email: senderEmail, Name: "Albert vom Beamtenportal" },
      To: [{ Email: email, Name: name }],
      Subject: `Ihre Anmeldung: Webinar "${WEBINAR_TITLE}"`,
      TextPart: `Hallo ${name},\n\nschön, dass Sie sich die Zeit nehmen, Ihre Absicherung als Beamter oder angehender Beamter frühzeitig in die Hand zu nehmen. Vielen Dank für Ihre Anmeldung zum Webinar "${WEBINAR_TITLE}".\n\nTermin: ${webinarDateDisplay}\nTeams-Link: ${WEBINAR_TEAMS_LINK}\n\nDen Termin finden Sie als Anhang dieser E-Mail direkt zum Eintragen in Ihren Kalender. Kurz vor dem Termin erhalten Sie von mir noch mehrere Erinnerungen. Falls Sie live nicht dabei sein können, melden Sie sich gerne bei mir – dann vereinbaren wir stattdessen ein kurzes persönliches Gespräch zu Ihren Fragen.\n\n${EMAIL_SIGNATURE_TEXT}`,
      HTMLPart: `<p>Hallo ${name},</p><p>schön, dass Sie sich die Zeit nehmen, Ihre Absicherung als Beamter oder angehender Beamter frühzeitig in die Hand zu nehmen. Vielen Dank für Ihre Anmeldung zum Webinar &bdquo;${WEBINAR_TITLE}&ldquo;.</p><p><strong>Termin:</strong> ${webinarDateDisplay}<br/><strong>Teams-Link:</strong> <a href="${WEBINAR_TEAMS_LINK}">${WEBINAR_TEAMS_LINK}</a></p><p>Den Termin finden Sie als Anhang dieser E-Mail direkt zum Eintragen in Ihren Kalender. Kurz vor dem Termin erhalten Sie von mir noch mehrere Erinnerungen. Falls Sie live nicht dabei sein können, melden Sie sich gerne bei mir – dann vereinbaren wir stattdessen ein kurzes persönliches Gespräch zu Ihren Fragen.</p>${EMAIL_SIGNATURE_HTML}`,
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
      TextPart: `Neue Vormerkung für das Webinar "${WEBINAR_TITLE}" von: ${name} (${email})`,
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

  // Zur Kontaktliste hinzufügen, damit spätere Erinnerungsmails alle Teilnehmer erreichen.
  // Nicht blockierend: schlägt das fehl, hat der Nutzer trotzdem seine Bestätigung erhalten.
  // fetch() wirft bei einer Fehlerantwort (4xx/5xx) KEINEN Error - response.ok muss explizit
  // geprüft werden, sonst bleibt ein Mailjet-Fehler (z.B. falsche Listen-ID) unsichtbar.
  try {
    const listResponse = await fetch(
      `https://api.mailjet.com/v3/REST/contactslist/${WEBINAR_CONTACT_LIST_ID}/managecontact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`,
        },
        body: JSON.stringify({ Email: email, Name: name, Action: "addforce" }),
      }
    );
    if (!listResponse.ok) {
      const listErrorBody = await listResponse.text().catch(() => "");
      console.error("Mailjet webinar contact list add failed", listResponse.status, listErrorBody);
    }
  } catch (err) {
    console.error("Mailjet webinar contact list add failed", err);
  }

  return NextResponse.json({ success: true });
}
