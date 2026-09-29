export interface CookieConsent {
  necessary: true;
  functional: boolean;
}

const STORAGE_KEY = "cookie-consent";

export function readStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
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
