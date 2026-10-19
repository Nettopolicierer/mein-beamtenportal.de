import { createHmac, timingSafeEqual } from "crypto";

// Signiertes, zeitlich begrenztes Token fuer die Double-Opt-in-Bestaetigung (kein Datenbank-Speicher noetig).
function secret() {
  const s = process.env.WEBINAR_OPTIN_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error("Kein Secret fuer Opt-in-Token konfiguriert");
  return s;
}

const b64 = (v: string) => Buffer.from(v, "utf-8").toString("base64url");

export function createOptinToken(email: string, ttlMs = 7 * 24 * 60 * 60 * 1000) {
  const payload = b64(JSON.stringify({ e: email.toLowerCase(), x: Date.now() + ttlMs }));
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyOptinToken(token: string): string | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as { e: string; x: number };
    if (!data.e || data.x < Date.now()) return null;
    return data.e;
  } catch {
    return null;
  }
}
