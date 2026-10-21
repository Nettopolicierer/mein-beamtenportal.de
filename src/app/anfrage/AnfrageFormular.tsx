"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, MessageCircle } from "lucide-react";
import { BOOKING_LINK } from "@/lib/content";

const WHATSAPP_NUMBER = "4917692609041";
const THEMEN = ["Dienstunfähigkeit / BU", "PKV und Beihilfe", "Altersvorsorge", "Vertragscheck"];
const STATUS = ["Anwärter / Referendar", "Student", "Beamter", "Sonstiges"];
const ZEITEN = ["Vormittags (bis 12 Uhr)", "Mittags (12–14 Uhr)", "Nachmittags (14–17 Uhr)", "Abends (ab 17 Uhr)"];

const inputClass =
  "h-12 w-full rounded-lg border border-mediumlight bg-white px-4 text-base text-primary outline-none placeholder:text-mediumdark/70 focus-visible:border-primary";

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left text-[15px] leading-snug font-medium transition ${
        active ? "border-primary bg-primary text-white" : "border-mediumlight bg-white text-primary hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}

export function AnfrageFormular() {
  const [themen, setThemen] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [zeit, setZeit] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const toggle = (t: string) => setThemen((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (themen.length === 0) {
      setError("Bitte wähle mindestens ein Thema aus.");
      setState("error");
      return;
    }
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themen, status, zeit, name, email, telefon, nachricht, website, consent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Etwas ist schiefgelaufen.");
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      setState("error");
    }
  }

  if (state === "success") {
    const notes = `Anfrage über die Website. Themen: ${themen.join(", ")}`;
    const bookingHref = `${BOOKING_LINK}${BOOKING_LINK.includes("?") ? "&" : "?"}notes=${encodeURIComponent(notes)}`;
    const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi Albert, ich habe gerade die Anfrage gesendet (${themen.join(", ")}).`)}`;
    return (
      <div id="check" className="scroll-mt-4 flex flex-col gap-4 rounded-2xl border border-mediumlight/60 bg-white p-5 shadow-xl shadow-primary/5 sm:p-8">
        <div className="flex items-start gap-2 text-primary">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0" />
          <div>
            <h2 className="font-heading text-xl font-bold">Danke, {name}!</h2>
            <p className="mt-1 text-sm text-mediumdark">
              Ich melde mich in der Regel innerhalb von 24 Stunden persönlich bei dir. Eine Bestätigung ist unterwegs zu
              deiner E-Mail-Adresse.
            </p>
          </div>
        </div>
        <p className="text-sm text-mediumdark">Du hast es eilig? Such dir direkt einen Termin aus oder schreib mir.</p>
        <a
          href={bookingHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-center text-base font-semibold text-white hover:bg-primary/90"
        >
          <CalendarCheck className="size-5" />
          Termin im Kalender wählen
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-6 py-4 text-center text-base font-semibold text-primary hover:bg-base"
        >
          <MessageCircle className="size-5" />
          Per WhatsApp schreiben
        </a>
      </div>
    );
  }

  return (
    <form
      id="check"
      onSubmit={submit}
      className="scroll-mt-4 flex flex-col gap-5 rounded-2xl border border-mediumlight/60 bg-white p-5 shadow-xl shadow-primary/5 sm:p-8"
    >
      <div>
        <p className="text-xs font-semibold tracking-wide text-mediumdark uppercase">Unverbindlich &amp; kostenfrei</p>
        <h2 className="font-heading mt-1 text-2xl font-bold text-primary">Lass uns sprechen.</h2>
        <p className="mt-1 text-sm text-mediumdark">Wähle deine Themen, dann bereite ich mich vor.</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-primary">Was ist dir wichtig? (Mehrfachwahl möglich)</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {THEMEN.map((t) => (
            <Chip key={t} active={themen.includes(t)} onClick={() => toggle(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-primary">
          Wo stehst du? <span className="font-normal text-mediumdark">(optional)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2.5">
          {STATUS.map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(status === s ? "" : s)}>
              {s}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-primary">
          Wann passt es dir am besten? <span className="font-normal text-mediumdark">(optional)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2.5">
          {ZEITEN.map((z) => (
            <Chip key={z} active={zeit === z} onClick={() => setZeit(zeit === z ? "" : z)}>
              {z}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-primary">Deine Kontaktdaten</p>
        <input type="text" required autoComplete="given-name" aria-label="Vorname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vorname" className={inputClass} />
        <input type="email" required autoComplete="email" aria-label="E-Mail-Adresse" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail-Adresse" className={inputClass} />
        <input type="tel" autoComplete="tel" aria-label="Telefonnummer (optional)" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="Telefonnummer (optional)" className={inputClass} />
        <textarea
          aria-label="Deine Nachricht (optional)"
          value={nachricht}
          onChange={(e) => setNachricht(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Deine Nachricht an mich (optional)"
          className="w-full rounded-lg border border-mediumlight bg-white px-4 py-3 text-base text-primary outline-none placeholder:text-mediumdark/70 focus-visible:border-primary"
        />
        <p className="text-xs text-mediumdark">Bitte schreibe hier keine Angaben zu Erkrankungen. Die besprechen wir im Gespräch.</p>
      </div>

      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <label className="flex items-start gap-2 text-xs text-mediumdark">
        <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0" />
        <span>
          Ich willige ein, dass Albert Sibert mich zu den gewählten Themen per E-Mail oder Telefon kontaktiert und meine
          Angaben dafür verarbeitet (Art. 6 Abs. 1 lit. a DSGVO). Die Einwilligung kann ich jederzeit widerrufen. Details
          in der{" "}
          <Link href="/datenschutz" className="underline">
            Datenschutzerklärung
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-lg bg-primary px-6 py-4 text-center text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {state === "loading" ? "Wird gesendet…" : "Anfrage absenden"}
      </button>
      {state === "error" && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-mediumdark">Deine Daten werden verschlüsselt übertragen.</p>
    </form>
  );
}
