export const WEBINAR_TITLE = "Verbeamtung richtig absichern: Beihilfe, PKV & Dienstunfähigkeit";

// Wiederkehrender Teams-Link (Serientermin), gilt für jeden Monatstermin.
export const WEBINAR_TEAMS_LINK = "https://teams.microsoft.com/meet/338390673586942?p=A6BBApCPMLVmYfJamu";

// Mailjet-Kontaktliste "Webinar_Beamtenportal_2026", befüllt automatisch
// über die API bei jeder Anmeldung (siehe api/webinar-register/route.ts).
export const WEBINAR_CONTACT_LIST_ID = 10635470;

const WEBINAR_DURATION_MIN = 45;

// Kommende Webinar-Termine als ISO-String mit korrektem CET/CEST-Offset.
// Monatlicher Rhythmus (jeden ersten Mittwoch, 18 Uhr): neue Termine unten
// anhängen, vergangene können stehen bleiben. getNextWebinar() nimmt
// automatisch den nächsten in der Zukunft.
export const WEBINAR_DATES_ISO = [
  "2026-10-21T18:00:00+02:00",
  "2026-11-04T18:00:00+01:00",
  "2026-12-02T18:00:00+01:00",
  "2027-01-06T18:00:00+01:00",
];

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const TIME_FMT = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export interface NextWebinar {
  startIso: string;
  endIso: string;
  start: Date;
  end: Date;
  dateDisplay: string;
  timeDisplay: string;
}

/**
 * Nächster Webinar-Termin, der noch in der Zukunft liegt. Fällt auf den letzten
 * gelisteten Termin zurück, wenn alle vorbei sind (dann bitte neue Termine
 * ergänzen). Zur Laufzeit aufrufen, nicht auf Modulebene cachen.
 */
export function getNextWebinar(now: number = Date.now()): NextWebinar {
  const startIso =
    WEBINAR_DATES_ISO.find((iso) => new Date(iso).getTime() > now) ??
    WEBINAR_DATES_ISO[WEBINAR_DATES_ISO.length - 1];

  const start = new Date(startIso);
  const end = new Date(start.getTime() + WEBINAR_DURATION_MIN * 60 * 1000);

  return {
    startIso,
    endIso: end.toISOString(),
    start,
    end,
    dateDisplay: DATE_FMT.format(start),
    timeDisplay: `${TIME_FMT.format(start)} Uhr`,
  };
}

// Erinnerungsstufen als fester zeitlicher Abstand vor Webinarbeginn.
// Reihenfolge ist relevant für currentDueStage() in api/webinar-reminder/route.ts.
export const REMINDER_STAGES = ["1w", "3d", "1d", "6h", "1h"] as const;
export type ReminderStage = (typeof REMINDER_STAGES)[number];

const HOUR_MS = 60 * 60 * 1000;

export const REMINDER_OFFSET_HOURS: Record<ReminderStage, number> = {
  "1w": 7 * 24,
  "3d": 3 * 24,
  "1d": 24,
  "6h": 6,
  "1h": 1,
};

export function reminderFireTime(stage: ReminderStage, start: Date): Date {
  return new Date(start.getTime() - REMINDER_OFFSET_HOURS[stage] * HOUR_MS);
}
