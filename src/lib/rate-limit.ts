// Einfache Missbrauchsbremse im Speicher (pro Server-Instanz). Hilft gegen Skripte und
// Mehrfach-Klicks, ersetzt aber kein verteiltes Rate-Limit.
const hits = new Map<string, number[]>();

export function tooMany(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}
