function toIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// Zeilenumbrüche in ICS-Textfeldern müssen escaped werden, sonst bricht das
// Format (RFC 5545). Zeilenlänge wird bewusst nicht gefaltet (76 Zeichen) —
// alle gängigen Kalender-Clients kommen mit unfolded Text klar.
function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

interface WebinarIcsInput {
  uid: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  meetingLink: string;
}

export function buildWebinarIcs({ uid, title, description, start, end, meetingLink }: WebinarIcsInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mein Beamtenportal//Webinar//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(`${description}\n\nLink: ${meetingLink}`)}`,
    `LOCATION:${escapeIcsText(meetingLink)}`,
    `URL:${meetingLink}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
