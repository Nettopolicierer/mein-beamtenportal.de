import { createHmac, timingSafeEqual } from "node:crypto";
import { redis } from "@/lib/redis";

// Folgemails nach der Pensions-PDF (nur mit separater, optionaler Einwilligung).
// Pro Kontakt: ein Redis-Eintrag mit Zeitpunkt der Einwilligung und nächster Stufe.
// Nach Mail 3 oder Abmeldung wird der Eintrag gelöscht.

export const NURTURE_DAYS = [2, 4, 6] as const;
const ACTIVE_SET = "nurture:active";
const TTL_SECONDS = 30 * 24 * 60 * 60;

export interface NurtureLead {
  email: string;
  vorname?: string;
  gruppe: string;
  luecke: number;
  nettoPension: number;
  createdAt: number;
  next: number; // Index der nächsten Mail (0..2)
}

const keyOf = (email: string) => `nurture:${email.toLowerCase()}`;

export async function nurtureAdd(lead: Omit<NurtureLead, "createdAt" | "next">) {
  const full: NurtureLead = { ...lead, email: lead.email.toLowerCase(), createdAt: Date.now(), next: 0 };
  await redis(["SET", keyOf(full.email), JSON.stringify(full), "EX", TTL_SECONDS]);
  await redis(["SADD", ACTIVE_SET, full.email]);
}

export async function nurtureRemove(email: string) {
  await redis(["DEL", keyOf(email)]);
  await redis(["SREM", ACTIVE_SET, email.toLowerCase()]);
}

export async function nurtureAll(): Promise<string[]> {
  return (await redis<string[]>(["SMEMBERS", ACTIVE_SET])) ?? [];
}

export async function nurtureGet(email: string): Promise<NurtureLead | null> {
  const raw = await redis<string | null>(["GET", keyOf(email)]);
  return raw ? (JSON.parse(raw) as NurtureLead) : null;
}

export async function nurtureAdvance(lead: NurtureLead) {
  const next = lead.next + 1;
  if (next >= NURTURE_DAYS.length) return nurtureRemove(lead.email);
  await redis(["SET", keyOf(lead.email), JSON.stringify({ ...lead, next }), "KEEPTTL"]);
}

const secret = () => process.env.NURTURE_SECRET || process.env.CRON_SECRET || "";

export function unsubscribeToken(email: string) {
  return createHmac("sha256", secret()).update(email.toLowerCase()).digest("hex").slice(0, 32);
}

export function validUnsubscribeToken(email: string, token: string) {
  if (!secret() || !token) return false;
  const a = Buffer.from(unsubscribeToken(email));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unsubscribeUrl(email: string) {
  const q = new URLSearchParams({ e: email.toLowerCase(), t: unsubscribeToken(email) });
  return `https://www.mein-beamtenportal.de/abmelden?${q.toString()}`;
}
