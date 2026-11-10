"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { track } from "@/lib/track";

const PRIMARY = "#002855";
const input = "h-14 w-full rounded-xl border-0 bg-white px-4 text-base outline-none placeholder:text-[#64748B]";

export function ChecklisteFormular() {
  const [vorname, setVorname] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [nurtureConsent, setNurtureConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/checkliste-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vorname: vorname.trim(), email, consent, nurtureConsent, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Etwas ist schiefgelaufen.");
        setState("error");
        return;
      }
      setState("success");
      track("checkliste_lead", { folgemails: nurtureConsent }, "lead");
    } catch {
      setError("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
      setState("error");
    }
  }

  const wrap = { background: `linear-gradient(135deg, ${PRIMARY}, #0B4A8F)` };
  if (state === "success") {
    return (
      <div className="rounded-2xl p-6 text-white sm:p-8" style={wrap}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-7 shrink-0" />
          <div>
            <p className="font-heading text-xl font-bold">Danke, Ihre Checkliste ist unterwegs.</p>
            <p className="mt-1 text-sm text-white/85">Sie erhalten die PDF per E-Mail. Falls nichts ankommt, schauen Sie bitte auch im Spam-Ordner nach.</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl p-6 text-white shadow-xl sm:p-8" style={wrap}>
      <h2 className="font-heading text-2xl font-bold">Checkliste kostenlos als PDF</h2>
      <input type="text" required autoComplete="given-name" maxLength={40} aria-label="Vorname" placeholder="Ihr Vorname" value={vorname} onChange={(e) => setVorname(e.target.value)} className={input} style={{ color: PRIMARY }} />
      <input type="email" required autoComplete="email" aria-label="E-Mail-Adresse" placeholder="Ihre E-Mail-Adresse" value={email} onChange={(e) => setEmail(e.target.value)} className={input} style={{ color: PRIMARY }} />
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <button type="submit" disabled={state === "loading"} style={{ backgroundColor: "#FFFFFF", color: PRIMARY }} className="rounded-xl px-6 py-4 text-center text-lg font-bold shadow-lg transition hover:opacity-90 disabled:opacity-60">
        {state === "loading" ? "Wird gesendet…" : "Checkliste anfordern"}
      </button>
      <label className="flex items-start gap-2 text-xs text-white/80">
        <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0" />
        <span>
          Ich willige ein, dass Mein Beamtenportal mich per E-Mail kontaktiert und meine Angaben dafür verarbeitet (Art. 6 Abs. 1 lit. a DSGVO). Widerruf jederzeit möglich, siehe{" "}
          <Link href="/datenschutz" className="underline">Datenschutzerklärung</Link>.
        </span>
      </label>
      <label className="flex items-start gap-2 text-xs text-white/80">
        <input type="checkbox" checked={nurtureConsent} onChange={(e) => setNurtureConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0" />
        <span>Optional: Ich möchte in den nächsten Tagen bis zu drei weitere Informationsmails zur Absicherung von Beamten erhalten (Art. 6 Abs. 1 lit. a DSGVO). Abmeldung jederzeit über den Link in jeder Mail.</span>
      </label>
      {state === "error" && (
        <p role="alert" className="rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white">{error}</p>
      )}
    </form>
  );
}
