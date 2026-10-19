// Kleine Mailjet-Hilfsfunktionen fuer Kontaktlisten (Webinar). Alle Funktionen werfen bei
// HTTP-Fehlern, damit Aufrufer entscheiden koennen, was nicht blockierend ist.
const API = "https://api.mailjet.com";

function authHeader() {
  const key = process.env.MAILJET_API_KEY;
  const secret = process.env.MAILJET_SECRET_KEY;
  if (!key || !secret) throw new Error("Mailjet nicht konfiguriert");
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

async function mj(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: authHeader(), ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Mailjet ${init.method ?? "GET"} ${path} -> ${res.status} ${body.slice(0, 200)}`);
  }
  return res;
}

export interface MjList {
  ID: number;
  Name: string;
}

export async function getAllLists(): Promise<MjList[]> {
  const res = await mj("/v3/REST/contactslist?Limit=1000&IsDeleted=false");
  const data = await res.json();
  return (data.Data ?? []) as MjList[];
}

export async function findList(name: string): Promise<MjList | null> {
  return (await getAllLists()).find((l) => l.Name === name) ?? null;
}

export async function findOrCreateList(name: string): Promise<MjList> {
  const existing = await findList(name);
  if (existing) return existing;
  const res = await mj("/v3/REST/contactslist", { method: "POST", body: JSON.stringify({ Name: name }) });
  const data = await res.json();
  const created = data.Data?.[0] as MjList | undefined;
  if (!created) throw new Error("Mailjet: Liste konnte nicht angelegt werden");
  return created;
}

export async function addContactToList(listId: number, email: string, name?: string) {
  await mj(`/v3/REST/contactslist/${listId}/managecontact`, {
    method: "POST",
    body: JSON.stringify({ Email: email, Name: name, Action: "addforce" }),
  });
}

export async function listRecipients(listId: number): Promise<{ ContactID: number; Email: string }[]> {
  const out: { ContactID: number; Email: string }[] = [];
  const limit = 200;
  for (let offset = 0; ; offset += limit) {
    const res = await mj(`/v3/REST/listrecipient?ContactsList=${listId}&Limit=${limit}&Offset=${offset}`);
    const data = await res.json();
    const items: { ContactID: number; Email?: string; ContactAlt?: string }[] = data.Data ?? [];
    for (const i of items) {
      const email = i.Email || i.ContactAlt;
      if (email) out.push({ ContactID: i.ContactID, Email: email });
    }
    if (items.length < limit) break;
  }
  return out;
}

export async function deleteList(listId: number) {
  await mj(`/v3/REST/contactslist/${listId}`, { method: "DELETE" });
}

// DSGVO-Loeschung eines Kontakts samt Daten (Mailjet API v4).
export async function deleteContact(contactId: number) {
  await mj(`/v4/contacts/${contactId}`, { method: "DELETE" });
}
