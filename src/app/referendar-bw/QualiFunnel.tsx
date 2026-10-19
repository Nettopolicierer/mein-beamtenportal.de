"use client";

import { useState } from "react";
import { ArrowLeft, CalendarCheck, Mail } from "lucide-react";
import { BOOKING_LINK } from "@/lib/content";
import { GOOGLE_ADS_BOOKING_LABEL, GOOGLE_ADS_ID } from "@/lib/google-ads";

const SCHULFORMEN = ["Gymnasium", "Grundschule", "Sekundarstufe I", "Berufsschule"];
const STARTTERMINE = ["Januar 2027", "Februar 2027", "Später"];

type DataLayerWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
};

// Wichtig: Die Antwort zur Gesundheit wird bewusst NICHT an Tracking-Dienste gesendet.
// Gemeldet werden nur neutrale Schritte (1, 2) und der Klick auf die Terminbuchung.
function track(event: string, params: Record<string, unknown> = {}) {
  try {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
    if (event === "lp_booking_click" && w.gtag && GOOGLE_ADS_ID && GOOGLE_ADS_BOOKING_LABEL) {
      w.gtag("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_BOOKING_LABEL}` });
    }
  } catch {
    // Tracking darf den Funnel nie blockieren.
  }
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left text-base font-medium transition ${
        active ? "border-primary bg-primary text-white" : "border-mediumlight bg-white text-primary hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}

export function QualiFunnel() {
  const [step, setStep] = useState(1);
  const [schulform, setSchulform] = useState("");
  const [start, setStart] = useState("");
  const [gesund, setGesund] = useState<boolean | null>(null);

  function goNext(to: number) {
    track("lp_step", { step: step });
    setStep(to);
  }

  return (
    <div id="check" className="scroll-mt-4 rounded-2xl border border-mediumlight/60 bg-white p-5 shadow-xl shadow-primary/5 sm:p-8">
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-mediumdark">
        <span>Schritt {step} von 3</span>
        <span>ca. 60 Sekunden</span>
      </div>
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-base">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">Wo und wann startest du?</h2>
          <div>
            <p className="mb-2 text-sm font-semibold text-primary">Schulform</p>
            <div className="grid grid-cols-2 gap-2.5">
              {SCHULFORMEN.map((s) => (
                <Chip key={s} active={schulform === s} onClick={() => setSchulform(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-primary">Start des Referendariats</p>
            <div className="grid grid-cols-3 gap-2.5">
              {STARTTERMINE.map((s) => (
                <Chip key={s} active={start === s} onClick={() => setStart(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>
          <button
            type="button"
            disabled={!schulform || !start}
            onClick={() => goNext(2)}
            className="rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-40"
          >
            Weiter
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">Wie steht es um deine Gesundheit?</h2>
          <p className="text-sm text-mediumdark">
            Bei der privaten Krankenversicherung zählt der Gesundheitszustand beim Abschluss. Deine Antwort hilft mir,
            den passenden Weg für dich zu wählen.
          </p>
          <div className="flex flex-col gap-2.5">
            <Chip
              onClick={() => {
                setGesund(true);
                goNext(3);
              }}
            >
              Keine bekannten Erkrankungen, ich bin topfit
            </Chip>
            <Chip
              onClick={() => {
                setGesund(false);
                goNext(3);
              }}
            >
              Ich habe bestehende chronische Erkrankungen
            </Chip>
          </div>
          <p className="text-xs text-mediumdark">
            Deine Antwort wird nur in deinem Browser ausgewertet. Sie wird weder gespeichert noch an uns oder an
            Werbedienste übermittelt.
          </p>
          <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 self-start text-sm text-mediumdark hover:text-primary">
            <ArrowLeft className="size-4" /> Zurück
          </button>
        </div>
      )}

      {step === 3 && gesund === true && (
        <div className="flex flex-col gap-4">
          <CalendarCheck className="size-9 text-primary" />
          <h2 className="font-heading text-xl font-bold text-primary">Gut, dann passt der nächste Schritt.</h2>
          <p className="text-sm text-mediumdark">
            Dein Profil: {schulform}, Start {start}. Such dir jetzt einen Termin für das kostenfreie Erstgespräch aus.
            Ich vergleiche vorher die Beihilfetarife, die zu deiner Situation passen, und bespreche sie mit dir.
          </p>
          <a
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("lp_booking_click")}
            className="rounded-lg bg-primary px-6 py-4 text-center text-base font-semibold text-white hover:bg-primary/90"
          >
            Termin im Kalender wählen
          </a>
          <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 self-start text-sm text-mediumdark hover:text-primary">
            <ArrowLeft className="size-4" /> Zurück
          </button>
        </div>
      )}

      {step === 3 && gesund === false && (
        <div className="flex flex-col gap-4">
          <Mail className="size-9 text-primary" />
          <h2 className="font-heading text-xl font-bold text-primary">Dann lohnt sich eine persönliche Einordnung.</h2>
          <p className="text-sm text-mediumdark">
            Mit Vorerkrankungen ist die Aufnahme in die private Krankenversicherung oft schwieriger, aber nicht
            ausgeschlossen. Für Beamtenanwärter gibt es in der Regel besondere Aufnahmeregeln (Öffnungsaktion) mit
            festen Fristen. Welche Möglichkeiten und Fristen für dich gelten, ordne ich gern persönlich für dich ein.
            Schreib mir dazu eine kurze E-Mail, ohne Details zu deiner Gesundheit, die klären wir im Gespräch.
          </p>
          <a
            href="mailto:kontakt@mein-beamtenportal.de?subject=Referendariat%20BW%3A%20pers%C3%B6nliche%20Einordnung%20PKV"
            className="rounded-lg bg-primary px-6 py-4 text-center text-base font-semibold text-white hover:bg-primary/90"
          >
            E-Mail an Albert Sibert
          </a>
          <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 self-start text-sm text-mediumdark hover:text-primary">
            <ArrowLeft className="size-4" /> Zurück
          </button>
        </div>
      )}
    </div>
  );
}
