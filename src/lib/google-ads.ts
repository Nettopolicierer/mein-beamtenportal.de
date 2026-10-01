// Google Ads ist erst aktiv, wenn NEXT_PUBLIC_GOOGLE_ADS_ID (z. B. "AW-123456789")
// gesetzt ist. Ohne die ID bleibt Banner und Seite exakt wie ohne Google Ads.
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
// Conversion-Label der Lead-Conversion (aus Google Ads), z. B. "AbCdEfGhIjK".
export const GOOGLE_ADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL ?? "";
export const GOOGLE_ADS_ENABLED = GOOGLE_ADS_ID !== "";
