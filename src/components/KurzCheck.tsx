"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

type Item = { href: string; title: string; text: string };

const STATUS = [
  { id: "ref", label: "Referendar / Anwärter" },
  { id: "probe", label: "Beamter auf Probe" },
  { id: "leben", label: "Beamter auf Lebenszeit" },
  { id: "student", label: "Lehramtsstudent" },
] as const;

const LAGE = [
  { id: "allein", label: "Ich bin allein" },
  { id: "partner", label: "Ich habe Partner:in" },
  { id: "kinder", label: "Ich habe Kinder" },
  { id: "immo", label: "Ich plane Immobilie" },
] as const;

const ANLIEGEN = [
  { id: "pkv", label: "Krankenversicherung" },
  { id: "du", label: "Dienstunfähigkeit" },
  { id: "pension", label: "Pension & Altersvorsorge" },
  { id: "ueberblick", label: "Gesamtüberblick" },
] as const;

type S = (typeof STATUS)[number]["id"];
type L = (typeof LAGE)[number]["id"];
type A = (typeof ANLIEGEN)[number]["id"];

const BY_ANLIEGEN: Record<A, Item> = {
  pkv: { href: "/pkv-fuer-beamte", title: "Krankenversicherung & Beihilfe", text: "Beihilfe zahlt nur einen Teil. Die PKV schließt den Rest. Worauf es bei Tarif und Gesundheitsfragen ankommt." },
  du: { href: "/dienstunfaehigkeitsversicherung", title: "Dienstunfähigkeit absichern", text: "Wer dienstunfähig wird, hat oft nur wenig oder keine Versorgung. Eine Absicherung sollte früh und gesund abgeschlossen werden." },
  pension: { href: "/ruhegehalt-beamte", title: "Pension und Lücke verstehen", text: "Die Pension ist solide, aber meist deutlich niedriger als das heutige Netto. So sehen Sie, was fehlt." },
  ueberblick: { href: "/welche-versicherungen-als-referendar", title: "Überblick über die wichtigen Versicherungen", text: "Welche Absicherungen für Ihren Status wirklich nötig sind und welche Sie sich sparen können." },
};

function build(s: S, l: L, a: A): Item[] {
  const out: Item[] = [BY_ANLIEGEN[a]];
  const add = (i: Item) => {
    if (out.length < 3 && !out.some((o) => o.href === i.href)) out.push(i);
  };
  if (s === "ref")
    add({ href: "/anwartschaft-im-referendariat", title: "Anwartschaft in der PKV", text: "Sichert Ihnen die Gesundheitsprüfung und den Einstieg in die PKV, bevor die Verbeamtung kommt." });
  if (s === "student")
    add({ href: "/dienstunfaehigkeitsversicherung-lehramtsstudenten", title: "Früh gesund absichern", text: "Je früher Sie die Dienstunfähigkeit absichern, desto eher gelten Sie noch als gesund." });
  if (s === "probe")
    add({ href: "/verbeamtung-auf-probe-finanzfehler", title: "Typische Fehler auf Probe", text: "Die häufigsten Finanzfehler beim Start ins Beamtenverhältnis und wie Sie sie vermeiden." });
  if (s === "probe")
    add({ href: "/nachversicherung-beamte-auf-probe", title: "Nachversicherung klären", text: "Was bei einem Ausscheiden aus dem Beamtenverhältnis mit Ihren Ansprüchen passiert." });
  if (s === "leben")
    add({ href: "/pensionsrechner", title: "Pensionslücke nachrechnen", text: "Rechnen Sie in wenigen Angaben nach, was von Ihrem Netto im Ruhestand bleibt." });
  if (l === "kinder")
    add({ href: "/private-krankenversicherung-fuer-kinder-beamte", title: "Kinder absichern", text: "Beihilfe und PKV für Kinder von Beamten: Was gilt, und was kostet es." });
  if (l === "immo")
    add({ href: "/immobilienkauf-beamte", title: "Immobilie als Beamter", text: "Finanzierung, Absicherung und Rücklagen, bevor Sie sich langfristig binden." });
  if (l === "partner")
    add({ href: "/dienstunfaehigkeitsversicherung", title: "Auch den Partner mitdenken", text: "Wer fällt finanziell wie stark aus, wenn ein Einkommen wegbricht?" });
  add({ href: "/diensthaftpflichtversicherung-fuer-beamte", title: "Diensthaftpflicht prüfen", text: "Schützt, wenn im Dienst ein Schaden entsteht, den der Dienstherr zurückfordert." });
  add(BY_ANLIEGEN.ueberblick);
  return out;
}

function Options<T extends { id: string; label: string }>({
  items,
  onPick,
}: {
  items: readonly T[];
  onPick: (id: T["id"]) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((i) => (
        <button
          key={i.id}
          type="button"
          onClick={() => onPick(i.id)}
          className="rounded-xl border border-mediumlight/60 bg-white px-5 py-4 text-left text-base font-medium text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

export function KurzCheck({ bookingLink }: { bookingLink: string }) {
  const [s, setS] = useState<S | null>(null);
  const [l, setL] = useState<L | null>(null);
  const [a, setA] = useState<A | null>(null);
  const step = s === null ? 1 : l === null ? 2 : a === null ? 3 : 4;
  const reset = () => {
    setS(null);
    setL(null);
    setA(null);
  };

  return (
    <div className="rounded-3xl bg-base p-6 sm:p-10">
      <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Kurzcheck · 20 Sekunden</p>
      <h2 className="font-heading max-w-2xl text-2xl font-bold text-primary sm:text-3xl">Wo stehe ich?</h2>
      <span className="mt-3 mb-8 block h-1 w-12 rounded-full bg-primary" />

      {step < 4 && (
        <div>
          <p className="mb-4 text-sm font-semibold text-mediumdark">
            Frage {step} von 3:{" "}
            {step === 1 ? "Was trifft auf Sie zu?" : step === 2 ? "Wie sieht Ihre Lage aus?" : "Was beschäftigt Sie am meisten?"}
          </p>
          {step === 1 && <Options items={STATUS} onPick={setS} />}
          {step === 2 && <Options items={LAGE} onPick={setL} />}
          {step === 3 && <Options items={ANLIEGEN} onPick={setA} />}
          {step > 1 && (
            <button
              type="button"
              onClick={() => (step === 2 ? setS(null) : setL(null))}
              className="mt-5 text-sm text-mediumdark underline"
            >
              Zurück
            </button>
          )}
        </div>
      )}

      {step === 4 && s && l && a && (
        <div>
          <p className="mb-5 text-base font-semibold text-primary">Ihre drei wichtigsten Punkte:</p>
          <ol className="grid gap-4 sm:grid-cols-3">
            {build(s, l, a).map((i, n) => (
              <li key={i.href} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-mediumlight/30">
                <span className="font-heading mb-3 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {n + 1}
                </span>
                <p className="font-heading mb-2 text-base font-semibold text-primary">{i.title}</p>
                <p className="mb-4 text-sm text-mediumdark">{i.text}</p>
                <Link href={i.href} prefetch={false} className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Mehr dazu <ArrowRight className="size-4" />
                </Link>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              In 20 Minuten persönlich klären
            </a>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-mediumdark underline">
              <RotateCcw className="size-4" /> Neu starten
            </button>
          </div>
          <p className="mt-5 text-xs text-mediumdark">
            Allgemeine Orientierung, keine Beratung. Ihre Antworten werden nicht gespeichert.
          </p>
        </div>
      )}
    </div>
  );
}
