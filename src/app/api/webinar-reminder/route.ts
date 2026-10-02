import { NextRequest, NextResponse } from "next/server";
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "@/lib/email-signature";
import {
  WEBINAR_TITLE,
  WEBINAR_TEAMS_LINK,
  WEBINAR_CONTACT_LIST_ID,
  REMINDER_STAGES,
  ReminderStage,
  reminderFireTime,
  getNextWebinar,
} from "@/lib/webinar-config";

export const dynamic = "force-dynamic";

const STAGE_SUBJECT: Record<ReminderStage, string> = {
  "1w": `In einer Woche: Webinar "${WEBINAR_TITLE}"`,
  "3d": `In 3 Tagen: Webinar "${WEBINAR_TITLE}"`,
  "1d": `Morgen: Webinar "${WEBINAR_TITLE}"`,
  "6h": `Heute Abend: Webinar "${WEBINAR_TITLE}"`,
  "1h": `In 1 Stunde: Webinar "${WEBINAR_TITLE}"`,
};

function stageIntro(stage: ReminderStage, dateDisplay: string, timeDisplay: string): string {
  switch (stage) {
    case "1w":
      return `kurze Erinnerung: In einer Woche, am ${dateDisplay} um ${timeDisplay}, ist es so weit.`;
    case "3d":
      return `kurze Erinnerung: In 3 Tagen, am ${dateDisplay} um ${timeDisplay}, ist es so weit.`;
    case "1d":
      return "kurze Erinnerung: Morgen ist es so weit.";
    case "6h":
      return "kurze Erinnerung: Heute Abend ist es so weit.";
    case "1h":
      return "in einer Stunde geht es los.";
  }
}

// Ausgelöst von .github/workflows/webinar-reminders.yml (und optional von einem
// externen Cron-Dienst, siehe Kommentar dort). GitHub startet geplante Läufe
// unregelmäßig und teils erst nach mehreren Stunden. Darum gilt jede Stufe nicht
// nur für ein enges Zeitfenster, sondern ab ihrem Sendezeitpunkt bis zu einer
// Toleranz danach (nie nach Webinarbeginn). Doppelversand verhindert die
// Mailjet-CustomID-Prüfung in alreadySent().
const MIN = 60 * 1000;
const HOUR = 60 * MIN;

const STAGE_TOLERANCE_MS: Record<ReminderStage, number> = {
  "1w": 12 * HOUR,
  "3d": 12 * HOUR,
  "1d": 6 * HOUR,
  "6h": 3 * HOUR,
  "1h": 30 * MIN,
};

function currentDueStage(now: number, start: Date): ReminderStage | null {
  for (const stage of REMINDER_STAGES) {
    const windowStart = reminderFireTime(stage, start).getTime();
    const windowEnd = Math.min(windowStart + STAGE_TOLERANCE_MS[stage], start.getTime() - 5 * MIN);
    if (now >= windowStart && now < windowEnd) {
      return stage;
    }
  }
  return null;
}

function customIdFor(stage: ReminderStage, start: Date) {
  return `webinar-reminder-${start.getTime()}-${stage}`;
}

// Prüft bei Mailjet, ob für diese Stufe und diesen Termin schon Mails mit der
// CustomID verschickt wurden. Schlägt die Abfrage fehl, wird NICHT gesendet
// (lieber ein sichtbarer Fehlerlauf als doppelte Mails an alle Teilnehmer).
async function alreadySent(stage: ReminderStage, start: Date): Promise<boolean> {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const res = await fetch(
    `https://api.mailjet.com/v3/REST/message?CustomID=${encodeURIComponent(customIdFor(stage, start))}&Limit=1`,
    { headers: { Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}` } }
  );
  if (!res.ok) throw new Error(`Mailjet message lookup failed: ${res.status}`);
  const data = (await res.json()) as { Data?: { CustomID?: string }[] };
  const customId = customIdFor(stage, start);
  // Zaehlt nur Treffer, deren CustomID wirklich passt (falls die Abfrage den
  // Filter einmal ignorieren sollte, darf das nicht jede Stufe blockieren).
  return (data.Data ?? []).some((m) => m.CustomID === undefined || m.CustomID === customId);
}

interface MailjetContact {
  Email: string;
}

async function fetchListContacts(apiKey: string, secretKey: string): Promise<MailjetContact[]> {
  const auth = `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`;
  const contacts: MailjetContact[] = [];
  let offset = 0;
  const limit = 200;

  for (;;) {
    const res = await fetch(
      `https://api.mailjet.com/v3/REST/listrecipient?ContactsList=${WEBINAR_CONTACT_LIST_ID}&Limit=${limit}&Offset=${offset}`,
      { headers: { Authorization: auth } }
    );
    if (!res.ok) break;
    const data = await res.json();
    const items: { ContactID: number; Email?: string; ContactAlt?: string }[] = data.Data ?? [];
    if (items.length === 0) break;

    for (const item of items) {
      const email = item.Email || item.ContactAlt;
      if (email) contacts.push({ Email: email });
    }
    if (items.length < limit) break;
    offset += limit;
  }

  return contacts;
}

async function sendStage(stage: ReminderStage) {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL;

  if (!apiKey || !secretKey || !senderEmail) {
    return { ok: false as const, status: 500, body: { error: "Der Versand ist aktuell nicht konfiguriert." } };
  }

  const contacts = await fetchListContacts(apiKey, secretKey);
  if (contacts.length === 0) {
    return { ok: true as const, status: 200, body: { success: true, sent: 0, note: "Keine Kontakte in der Liste gefunden." } };
  }

  const { dateDisplay, timeDisplay, start } = getNextWebinar();
  const intro = stageIntro(stage, dateDisplay, timeDisplay);
  const textPart = `Hallo,\n\n${intro}\n\nWebinar: "${WEBINAR_TITLE}"\nTeams-Link: ${WEBINAR_TEAMS_LINK}\n\nFalls Sie live nicht dabei sein können, melden Sie sich gerne bei mir – dann vereinbaren wir stattdessen ein kurzes persönliches Gespräch zu Ihren Fragen.\n\n${EMAIL_SIGNATURE_TEXT}`;
  const htmlPart = `<p>Hallo,</p><p>${intro}</p><p><strong>Webinar:</strong> &bdquo;${WEBINAR_TITLE}&ldquo;<br/><strong>Teams-Link:</strong> <a href="${WEBINAR_TEAMS_LINK}">${WEBINAR_TEAMS_LINK}</a></p><p>Falls Sie live nicht dabei sein können, melden Sie sich gerne bei mir – dann vereinbaren wir stattdessen ein kurzes persönliches Gespräch zu Ihren Fragen.</p>${EMAIL_SIGNATURE_HTML}`;

  const messages = contacts.map((contact) => ({
    From: { Email: senderEmail, Name: "Albert vom Beamtenportal" },
    To: [{ Email: contact.Email }],
    Subject: STAGE_SUBJECT[stage],
    CustomID: customIdFor(stage, start),
    TextPart: textPart,
    HTMLPart: htmlPart,
  }));

  // Mailjet v3.1/send erlaubt bis zu 50 Nachrichten pro Aufruf.
  const batchSize = 50;
  let sent = 0;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`,
      },
      body: JSON.stringify({ Messages: batch }),
    });
    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error("Mailjet webinar-reminder send failed", response.status, errorBody);
      continue;
    }
    sent += batch.length;
  }

  return { ok: true as const, status: 200, body: { success: true, sent, total: contacts.length } };
}

// Manueller Trigger (z.B. zum Testen einer Stage), abgesichert über WEBINAR_REMINDER_SECRET.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webinar-secret");
  if (!secret || secret !== process.env.WEBINAR_REMINDER_SECRET) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const { stage } = (await request.json().catch(() => ({}))) as { stage?: ReminderStage };
  if (!stage || !REMINDER_STAGES.includes(stage)) {
    return NextResponse.json(
      { error: `Ungültige stage. Erwartet: ${REMINDER_STAGES.join(" | ")}.` },
      { status: 400 }
    );
  }

  const result = await sendStage(stage);
  return NextResponse.json(result.body, { status: result.status });
}

// Aufgerufen von .github/workflows/webinar-reminders.yml (stündlich, siehe
// Kommentar dort). Aufrufer muss "Authorization: Bearer $CRON_SECRET" senden.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const { start } = getNextWebinar();
  const stage = currentDueStage(Date.now(), start);
  if (!stage) {
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    if (await alreadySent(stage, start)) {
      return NextResponse.json({ success: true, skipped: true, stage, note: "Stufe bereits versendet." });
    }
  } catch (err) {
    console.error("Webinar-reminder dedupe check failed", err);
    return NextResponse.json(
      { error: "Prüfung auf bereits versendete Erinnerung fehlgeschlagen, es wurde nichts gesendet." },
      { status: 502 }
    );
  }

  const result = await sendStage(stage);
  return NextResponse.json({ stage, ...result.body }, { status: result.status });
}
