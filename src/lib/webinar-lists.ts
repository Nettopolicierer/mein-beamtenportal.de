import { getNextWebinar } from "@/lib/webinar-config";
import { deleteContact, deleteList, getAllLists, listRecipients } from "@/lib/mailjet";

export const INVITE_LIST_NAME = "Webinar-Einladungen (Opt-in)";

const BERLIN_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }); // YYYY-MM-DD

export function berlinDate(d: Date) {
  return BERLIN_DATE.format(d);
}

// Pro Webinar-Termin eine eigene Liste: Erinnerungen gehen nur an dessen Angemeldete.
export function eventListName(start: Date = getNextWebinar().start) {
  return `Webinar-Termin ${berlinDate(start)}`;
}

/**
 * Loescht Listen vergangener Termine samt Kontakten. Kontakte, die zusaetzlich in der
 * Einladungsliste (Opt-in) stehen, bleiben erhalten. Idempotent, darf bei jedem Lauf laufen.
 */
export async function cleanupPastEventLists(now: Date = new Date()) {
  const today = berlinDate(now);
  const lists = await getAllLists();
  const invite = lists.find((l) => l.Name === INVITE_LIST_NAME);
  const keep = new Set<string>();
  if (invite) for (const r of await listRecipients(invite.ID)) keep.add(r.Email.toLowerCase());

  const results: { list: string; deletedContacts: number; failed: number }[] = [];
  for (const l of lists) {
    const m = /^Webinar-Termin (\d{4}-\d{2}-\d{2})$/.exec(l.Name);
    if (!m || m[1] >= today) continue;
    let deletedContacts = 0;
    let failed = 0;
    for (const r of await listRecipients(l.ID)) {
      if (keep.has(r.Email.toLowerCase())) continue;
      try {
        await deleteContact(r.ContactID);
        deletedContacts++;
      } catch (err) {
        failed++;
        console.error("Webinar-Cleanup: Kontakt konnte nicht geloescht werden", err);
      }
    }
    try {
      await deleteList(l.ID);
    } catch (err) {
      console.error("Webinar-Cleanup: Liste konnte nicht geloescht werden", err);
    }
    results.push({ list: l.Name, deletedContacts, failed });
  }
  return results;
}
