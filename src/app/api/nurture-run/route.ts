import { NextRequest, NextResponse } from "next/server";
import { nurtureHtml, nurtureSubject, nurtureText } from "@/lib/email-nurture";
import { NURTURE_DAYS, nurtureAdvance, nurtureAll, nurtureGet, nurtureRemove, unsubscribeUrl } from "@/lib/nurture";
import { redisConfigured } from "@/lib/redis";

export const dynamic = "force-dynamic";
const DAY = 24 * 60 * 60 * 1000;

// Täglicher Aufruf (Vercel Cron, siehe vercel.json). Pro Kontakt und Lauf höchstens eine Mail.
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL;
  if (!apiKey || !secretKey || !senderEmail) return NextResponse.json({ error: "Mailjet nicht konfiguriert" }, { status: 500 });

  // Testmodus: ?test=<adresse> schickt alle drei Mails mit Beispielwerten an diese Adresse (ohne Redis).
  const testTo = request.nextUrl.searchParams.get("test");
  if (testTo) {
    const vars = { gruppe: "A13", luecke: 1475, nettoPension: 3283, unsubscribeUrl: unsubscribeUrl(testTo) };
    const messages = NURTURE_DAYS.map((_, i) => ({
      From: { Email: senderEmail, Name: "Mein Beamtenportal" },
      To: [{ Email: testTo }],
      Subject: `[TEST ${i + 1}/3] ${nurtureSubject(i, vars)}`,
      TextPart: nurtureText(i, vars),
      HTMLPart: nurtureHtml(i, vars),
    }));
    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`,
      },
      body: JSON.stringify({ Messages: messages }),
    });
    return NextResponse.json({ test: res.ok, status: res.status }, { status: res.ok ? 200 : 502 });
  }

  if (!redisConfigured()) return NextResponse.json({ skipped: "redis not configured" });

  let sent = 0;
  let failed = 0;
  for (const email of await nurtureAll()) {
    const lead = await nurtureGet(email);
    if (!lead) {
      await nurtureRemove(email); // abgelaufen oder gelöscht
      continue;
    }
    if (Date.now() - lead.createdAt < NURTURE_DAYS[lead.next] * DAY) continue;

    const url = unsubscribeUrl(lead.email);
    const vars = { gruppe: lead.gruppe, luecke: lead.luecke, nettoPension: lead.nettoPension, unsubscribeUrl: url };
    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: senderEmail, Name: "Mein Beamtenportal" },
            To: [{ Email: lead.email }],
            Subject: nurtureSubject(lead.next, vars),
            TextPart: nurtureText(lead.next, vars),
            HTMLPart: nurtureHtml(lead.next, vars),
            Headers: { "List-Unsubscribe": `<${url}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
          },
        ],
      }),
    });
    if (res.ok) {
      await nurtureAdvance(lead);
      sent++;
    } else {
      failed++;
      console.error("Nurture-Mail fehlgeschlagen", res.status, await res.text().catch(() => ""));
    }
  }
  return NextResponse.json({ sent, failed });
}
