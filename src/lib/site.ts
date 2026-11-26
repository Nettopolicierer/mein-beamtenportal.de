// Kleine Helfer ohne Inhaltsdaten. Client-Komponenten importieren von hier, NIE aus
// "@/lib/content": Das zieht alle Beitragstexte (mehrere MB) ins Browser-JavaScript.
export const BOOKING_LINK = "https://cal.com/mein-beamtenportal/kostenfreie-erstberatung";

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));
}
