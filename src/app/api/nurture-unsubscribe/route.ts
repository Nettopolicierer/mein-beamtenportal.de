import { NextRequest, NextResponse } from "next/server";
import { nurtureRemove, validUnsubscribeToken } from "@/lib/nurture";
import { redisConfigured } from "@/lib/redis";

// Abmeldung von den Folgemails: POST von der Seite /abmelden und als One-Click-POST (List-Unsubscribe-Post).
export async function POST(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  let email = params.get("e") ?? "";
  let token = params.get("t") ?? "";
  if (!email) {
    const body = await request.json().catch(() => ({}));
    email = typeof body.e === "string" ? body.e : "";
    token = typeof body.t === "string" ? body.t : "";
  }
  if (!email || !validUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: "Ungültiger Link." }, { status: 400 });
  }
  if (redisConfigured()) await nurtureRemove(email);
  return NextResponse.json({ success: true });
}
