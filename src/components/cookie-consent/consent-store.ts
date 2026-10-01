import { GOOGLE_ADS_ENABLED } from "@/lib/google-ads";

export interface CookieConsent {
  necessary: true;
  functional: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "cookie-consent";

export function readStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    // Aeltere Einwilligung ohne Marketing-Entscheidung: sobald Google Ads aktiv
    // ist, muss neu gefragt werden - die alte Zustimmung deckt Marketing nicht ab.
    if (GOOGLE_ADS_ENABLED && typeof parsed.marketing !== "boolean") return null;
    return { necessary: true, functional: parsed.functional === true, marketing: parsed.marketing === true };
  } catch {
    return null;
  }
}

export function writeStoredConsent(consent: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Storage nicht verfuegbar (z.B. privater Modus) - Consent gilt dann nur fuer diese Sitzung.
  }
}
