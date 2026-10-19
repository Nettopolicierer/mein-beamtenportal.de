import { NextRequest } from "next/server";
import { addContactToList, findOrCreateList } from "@/lib/mailjet";
import { INVITE_LIST_NAME } from "@/lib/webinar-lists";
import { verifyOptinToken } from "@/lib/optin-token";

export const dynamic = "force-dynamic";

const page = (title: string, text: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.5rem;color:#002855"><h1 style="font-size:1.4rem">${title}</h1><p style="color:#6d7d8b;line-height:1.6">${text}</p><p><a href="https://www.mein-beamtenportal.de/" style="color:#002855">Zur Startseite</a></p></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } }
  );

// Double-Opt-in: erst mit dem Klick auf den Link in der Bestätigungs-E-Mail kommt die Adresse
// in die Einladungsliste (Webinare und Themen für Beamte).
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const email = verifyOptinToken(token);
  if (!email) {
    return page("Link ungültig oder abgelaufen", "Dieser Bestätigungslink ist ungültig oder abgelaufen. Sie können sich einfach erneut zum Webinar anmelden.", 400);
  }
  try {
    const list = await findOrCreateList(INVITE_LIST_NAME);
    await addContactToList(list.ID, email);
  } catch (err) {
    console.error("Webinar-Opt-in fehlgeschlagen", err);
    return page("Das hat leider nicht geklappt", "Bitte versuchen Sie es später noch einmal oder schreiben Sie an kontakt@mein-beamtenportal.de.", 502);
  }
  return page(
    "Danke, Ihre Bestätigung ist angekommen",
    "Sie erhalten künftig Einladungen zu weiteren Webinaren und Themen für Beamte. Jede dieser E-Mails enthält einen Abmeldelink."
  );
}
