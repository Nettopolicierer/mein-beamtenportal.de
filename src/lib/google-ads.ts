// Der Google-Tag wird NICHT fest in den Header geschrieben, sondern erst nach Einwilligung in die
// Kategorie "Marketing" geladen (siehe components/GoogleAdsTag.tsx).
// Konto-ID aus Google Ads (Google-Tag). Kann per NEXT_PUBLIC_GOOGLE_ADS_ID ueberschrieben werden.
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-18335517190";
// Conversion-Label der Lead-Conversion (aus Google Ads), z. B. "AbCdEfGhIjK".
export const GOOGLE_ADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL ?? "";
export const GOOGLE_ADS_ENABLED = GOOGLE_ADS_ID !== "";
// Conversion-Label fuer die Terminbuchung ueber die Werbe-Landingpage (/referendar-bw).
export const GOOGLE_ADS_BOOKING_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL ?? "";
