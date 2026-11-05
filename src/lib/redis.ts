// Minimaler Upstash-Redis-Client über die REST-API (keine zusätzliche Abhängigkeit).
// Die Variablen setzt die Vercel-Marketplace-Integration (Upstash) automatisch.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const redisConfigured = () => Boolean(URL_ && TOKEN);

export async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  if (!URL_ || !TOKEN) throw new Error("Redis nicht konfiguriert");
  const res = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  const json = (await res.json()) as { result: T; error?: string };
  if (json.error) throw new Error(json.error);
  return json.result;
}
