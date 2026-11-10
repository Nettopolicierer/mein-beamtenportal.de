import { GOOGLE_ADS_BOOKING_LABEL, GOOGLE_ADS_ID, GOOGLE_ADS_LEAD_LABEL } from "@/lib/google-ads";

type TrackWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
  clarity?: (...args: unknown[]) => void;
};

// Einheitliche Ereignismessung. Es werden nur neutrale Ereignisse gemeldet, keine Eingaben (kein Alter,
// keine E-Mail, keine Gesundheitsangaben). gtag und Clarity existieren nur nach Einwilligung in Marketing bzw.
// Statistik; ohne Einwilligung passiert außer dem lokalen dataLayer-Eintrag nichts.
export function track(event: string, params: Record<string, unknown> = {}, conversion?: "lead" | "booking") {
  try {
    const w = window as TrackWindow;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
    w.clarity?.("event", event);
    const label = conversion === "lead" ? GOOGLE_ADS_LEAD_LABEL : conversion === "booking" ? GOOGLE_ADS_BOOKING_LABEL : "";
    if (label && w.gtag && GOOGLE_ADS_ID) w.gtag("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${label}` });
  } catch {
    // Tracking darf nie etwas blockieren.
  }
}
