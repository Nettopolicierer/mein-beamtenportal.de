"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { BOOKING_LINK } from "@/lib/content";
import {
  BEITRAG_BEREICHE,
  RENTE_BEREICHE,
  calculate,
  eur,
  triAmpel,
  worst,
  type Ampel,
  type CalcResult,
  type Status,
  type TriState,
} from "./calc";

const STATUS_OPTIONS: { label: string; value: Status }[] = [
  { label: "Student/in (Lehramt o. ä.)", value: "student" },
  { label: "Referendar/in oder Anwärter/in", value: "widerruf" },
  { label: "Beamter/Beamtin auf Probe", value: "probe" },
  { label: "Beamter/Beamtin auf Lebenszeit", value: "lebenszeit" },
];
const BERUF_OPTIONS = ["Lehramt", "Polizei", "Feuerwehr / Justiz", "Verwaltung / Finanzamt", "Etwas anderes"];
const VERTRAG_OPTIONS = ["Nein, noch nicht", "Ja, ich habe einen Vertrag", "Weiß ich nicht"];

const TRI_ITEMS: { key: "klausel" | "laufzeit" | "nachversicherung"; label: string }[] = [
  { key: "klausel", label: "Dienstunfähigkeitsklausel enthalten?" },
  { key: "laufzeit", label: "Läuft bis zum Pensionsalter (mind. 65)?" },
  { key: "nachversicherung", label: "Nachversicherungsgarantie vorhanden?" },
];
const TRI_LABEL: Record<TriState, string> = { ja: "Ja", nein: "Nein", unklar: "Weiß nicht" };

const AMPEL_STYLE: Record<Ampel, { dot: string; hoehe: string; vertrag: string }> = {
  gruen: { dot: "bg-green-500", hoehe: "Höhe der Absicherung: passt zu Ihrem Ziel", vertrag: "Vertragsbedingungen: wirken solide" },
  gelb: { dot: "bg-amber-400", hoehe: "Höhe der Absicherung: teilweise Lücke", vertrag: "Vertragsbedingungen: teilweise unklar" },
  rot: { dot: "bg-red-500", hoehe: "Höhe der Absicherung: deutliche Lücke", vertrag: "Vertragsbedingungen: Schwachstellen möglich" },
};

type StepId = "status" | "vertrag" | "beruf" | "alter" | "netto" | "dienstjahre" | "details" | "ergebnis";

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

function track(event: string, params: Record<string, unknown> = {}) {
  try {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
  } catch {
    // Tracking darf den Funnel nie blockieren.
  }
}

const inputClass =
  "h-12 w-full rounded-lg border border-mediumlight bg-white px-4 text-base outline-none focus-visible:border-primary";

function Slider({
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-heading text-3xl font-bold text-primary">{format(value)}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[#002855]"
      />
      <div className="flex justify-between text-xs text-mediumdark">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function Chip({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left text-base font-medium transition ${
        active ? "border-primary bg-base text-primary" : "border-mediumlight bg-white text-primary hover:border-primary hover:bg-base"
      }`}
    >
      {children}
    </button>
  );
}

export function BuCheckQuiz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [statusValue, setStatusValue] = useState<Status | null>(null);
  const [statusLabel, setStatusLabel] = useState("");
  const [vertrag, setVertrag] = useState("");
  const [beruf, setBeruf] = useState("");
  const [alter, setAlter] = useState(30);
  const [netto, setNetto] = useState(3000);
  const [dienstjahre, setDienstjahre] = useState(5);
  const [rente, setRente] = useState<(typeof RENTE_BEREICHE)[number] | null>(null);
  const [beitrag, setBeitrag] = useState("");
  const [tri, setTri] = useState<Partial<Record<"klausel" | "laufzeit" | "nachversicherung", TriState>>>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const hasContract = vertrag.startsWith("Ja");
  const needsDienstjahre = statusValue === "probe" || statusValue === "lebenszeit";

  const steps = useMemo<StepId[]>(() => {
    const s: StepId[] = ["status", "vertrag", "beruf", "alter", "netto"];
    if (needsDienstjahre) s.push("dienstjahre");
    if (hasContract) s.push("details");
    s.push("ergebnis");
    return s;
  }, [needsDienstjahre, hasContract]);

  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const questionCount = steps.length - 1;
  const progress = Math.round((stepIndex / steps.length) * 100);

  const result: CalcResult | null = useMemo(() => {
    if (!statusValue) return null;
    return calculate({
      status: statusValue,
      alter,
      netto,
      dienstjahre: needsDienstjahre ? dienstjahre : 0,
      vertragsrente: hasContract ? (rente?.mid ?? null) : null,
    });
  }, [statusValue, alter, netto, dienstjahre, needsDienstjahre, hasContract, rente]);

  const vertragsAmpel: Ampel | null = useMemo(
    () => (hasContract ? worst(...TRI_ITEMS.map((i) => triAmpel(tri[i.key]))) : null),
    [hasContract, tri],
  );

  function next() {
    if (stepIndex === 0) track("bu_check_start");
    track("bu_check_step", { step: stepIndex + 1, step_name: current });
    setStepIndex((i) => i + 1);
  }

  function leadScore() {
    if (!result) return { score: 0, label: "kalt" };
    let p = 0;
    if (!hasContract) p += 2;
    if (statusValue === "probe" || statusValue === "widerruf") p += 2;
    if (result.ziel > 0 && result.lueckeMax / result.ziel > 0.5) p += 2;
    if (phone.trim()) p += 1;
    if (alter <= 35) p += 1;
    if (beitrag === "Über 100 €") p += 1;
    return { score: p, label: p >= 5 ? "heiß" : p >= 3 ? "warm" : "kalt" };
  }

  function ergebnisText() {
    if (!result) return "";
    const luecke =
      result.lueckeMin === result.lueckeMax
        ? `ca. ${eur(result.lueckeMax)}`
        : `ca. ${eur(result.lueckeMin)} bis ${eur(result.lueckeMax)}`;
    return `Absicherungsziel ca. ${eur(result.ziel)}/Monat; geschätzte Lücke ${luecke}/Monat; Höhe: ${result.ampel}${vertragsAmpel ? `; Vertragsbedingungen: ${vertragsAmpel}` : ""}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    const { score, label } = leadScore();
    try {
      const res = await fetch("/api/bu-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusLabel,
          beruf,
          alter: String(alter),
          netto: String(netto),
          dienstjahre: needsDienstjahre ? String(dienstjahre) : "",
          vertrag,
          vertragsrente: rente?.label ?? "",
          beitrag,
          klausel: tri.klausel ? TRI_LABEL[tri.klausel] : "",
          laufzeit: tri.laufzeit ? TRI_LABEL[tri.laufzeit] : "",
          nachversicherung: tri.nachversicherung ? TRI_LABEL[tri.nachversicherung] : "",
          ergebnis: ergebnisText(),
          score: `${label} (${score} Punkte)`,
          name,
          email,
          phone,
          website,
          consent,
          source: window.location.pathname + window.location.search,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error ?? "Etwas ist schiefgelaufen.");
        setStatus("error");
        return;
      }
      track("bu_check_lead", { status: statusValue, lead_score: label });
      setStatus("success");
    } catch {
      setErrorMessage("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h3 className="font-heading text-xl font-bold text-primary">Vielen Dank, {name.split(" ")[0]}!</h3>
        <p className="text-mediumdark">
          Ich schaue mir Ihre Angaben an und melde mich persönlich. Wenn Sie nicht warten möchten, wählen Sie sich
          direkt einen Termin aus:
        </p>
        <a
          href={BOOKING_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("bu_check_booking_click")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Jetzt Erstgespräch-Termin wählen
          <ArrowRight className="size-4" />
        </a>
        <p className="text-xs text-mediumdark">Eine Bestätigung mit dem Terminlink geht zusätzlich an Ihre E-Mail.</p>
      </div>
    );
  }

  const nextButton = (
    <button
      type="button"
      onClick={next}
      className="rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-white hover:bg-primary/90"
    >
      Weiter
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-mediumdark">
          <span>{current === "ergebnis" ? "Ihr Ergebnis" : `Frage ${stepIndex + 1} von ${questionCount}`}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-base">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {current === "status" && (
        <>
          <h3 className="font-heading text-xl font-bold text-primary">Wo stehen Sie aktuell?</h3>
          <div className="flex flex-col gap-2.5">
            {STATUS_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                onClick={() => {
                  setStatusValue(o.value);
                  setStatusLabel(o.label);
                  next();
                }}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </>
      )}

      {current === "vertrag" && (
        <>
          <h3 className="font-heading text-xl font-bold text-primary">
            Haben Sie schon eine Dienstunfähigkeits- oder BU-Versicherung?
          </h3>
          <div className="flex flex-col gap-2.5">
            {VERTRAG_OPTIONS.map((o) => (
              <Chip
                key={o}
                onClick={() => {
                  setVertrag(o);
                  next();
                }}
              >
                {o}
              </Chip>
            ))}
          </div>
        </>
      )}

      {current === "beruf" && (
        <>
          <h3 className="font-heading text-xl font-bold text-primary">In welchem Bereich sind Sie tätig?</h3>
          <div className="flex flex-col gap-2.5">
            {BERUF_OPTIONS.map((o) => (
              <Chip
                key={o}
                onClick={() => {
                  setBeruf(o);
                  next();
                }}
              >
                {o}
              </Chip>
            ))}
          </div>
        </>
      )}

      {current === "alter" && (
        <>
          <h3 className="font-heading text-xl font-bold text-primary">Wie alt sind Sie?</h3>
          <Slider value={alter} onChange={setAlter} min={18} max={60} step={1} format={(v) => `${v} Jahre`} />
          {nextButton}
        </>
      )}

      {current === "netto" && (
        <>
          <h3 className="font-heading text-xl font-bold text-primary">
            Wie hoch ist Ihr monatliches Netto (ungefähr)?
          </h3>
          <p className="-mt-3 text-sm text-mediumdark">Bei Berufseinstieg: das erwartete Netto. Ein grober Wert genügt.</p>
          <Slider value={netto} onChange={setNetto} min={1000} max={6000} step={100} format={(v) => eur(v)} />
          {nextButton}
        </>
      )}

      {current === "dienstjahre" && (
        <>
          <h3 className="font-heading text-xl font-bold text-primary">Wie viele Dienstjahre haben Sie bisher?</h3>
          <Slider value={dienstjahre} onChange={setDienstjahre} min={0} max={35} step={1} format={(v) => `${v} Jahre`} />
          {nextButton}
        </>
      )}

      {current === "details" && (
        <>
          <div>
            <h3 className="font-heading text-xl font-bold text-primary">Was wissen Sie über Ihren Vertrag?</h3>
            <p className="mt-1 text-sm text-mediumdark">
              Alles optional. Was Sie nicht wissen, lassen Sie einfach offen. Unterlagen brauchen Sie dafür nicht.
            </p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-primary">Versicherte monatliche Rente</p>
            <div className="flex flex-wrap gap-2">
              {RENTE_BEREICHE.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setRente(r)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    rente?.label === r.label ? "border-primary bg-primary text-white" : "border-mediumlight text-primary hover:border-primary"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-primary">Monatlicher Beitrag</p>
            <div className="flex flex-wrap gap-2">
              {BEITRAG_BEREICHE.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBeitrag(b)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    beitrag === b ? "border-primary bg-primary text-white" : "border-mediumlight text-primary hover:border-primary"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          {TRI_ITEMS.map((item) => (
            <div key={item.key}>
              <p className="mb-2 text-sm font-semibold text-primary">{item.label}</p>
              <div className="flex gap-2">
                {(["ja", "nein", "unklar"] as TriState[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTri((t) => ({ ...t, [item.key]: v }))}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      tri[item.key] === v ? "border-primary bg-primary text-white" : "border-mediumlight text-primary hover:border-primary"
                    }`}
                  >
                    {TRI_LABEL[v]}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {nextButton}
        </>
      )}

      {current === "ergebnis" && result && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-xl bg-base p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className={`inline-block size-3 rounded-full ${AMPEL_STYLE[result.ampel].dot}`} />
              {AMPEL_STYLE[result.ampel].hoehe}
            </p>
            <p className="mt-2 font-heading text-2xl font-bold text-primary">
              {result.lueckeMax === 0
                ? "Keine nennenswerte Lücke"
                : result.lueckeMin === result.lueckeMax
                  ? `Lücke: ca. ${eur(result.lueckeMax)} im Monat`
                  : `Lücke: ca. ${eur(result.lueckeMin)} bis ${eur(result.lueckeMax)} im Monat`}
            </p>
            <p className="mt-2 text-sm text-mediumdark">
              {result.hatRuhegehalt
                ? `Bei Dienstunfähigkeit erhalten Sie nach der Wartezeit Ruhegehalt, geschätzt etwa ${eur(result.versorgungMin)} bis ${eur(result.versorgungMax)} (netto-nah). Ihr Absicherungsziel von rund 80 % des Nettos liegt bei ca. ${eur(result.ziel)}.`
                : "Ohne Anspruch auf Ruhegehalt (z. B. in Studium, Referendariat, Anwärterzeit oder Probezeit, außer bei Dienstunfall) bleibt meist nur eine geringe gesetzliche Rente. Ihr Absicherungsziel von rund 80 % des Nettos liegt bei ca. " +
                  eur(result.ziel) +
                  "."}
              {hasContract && rente?.mid ? ` Ihre bestehende Rente ist bereits eingerechnet.` : ""}
            </p>
            {hasContract && beitrag === "Über 100 €" && (
              <p className="mt-3 rounded-lg bg-white p-3 text-sm text-primary">
                Bei einem Beitrag von über 100 € im Monat lohnt sich ein Beitrags-Check: Oft lassen sich Leistung und
                Preis mit einem Vergleich verbessern, ohne dass Sie etwas verlieren.
              </p>
            )}
            {hasContract && (
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-primary">
                {vertragsAmpel && (
                  <li className="flex items-center gap-2 font-semibold">
                    <span className={`inline-block size-3 rounded-full ${AMPEL_STYLE[vertragsAmpel].dot}`} />
                    {AMPEL_STYLE[vertragsAmpel].vertrag}
                  </li>
                )}
                {TRI_ITEMS.map((item) => (
                  <li key={item.key} className="flex items-center gap-2">
                    <span className={`inline-block size-2.5 rounded-full ${AMPEL_STYLE[triAmpel(tri[item.key])].dot}`} />
                    {item.label} <span className="text-mediumdark">({tri[item.key] ? TRI_LABEL[tri[item.key]!] : "offen"})</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-mediumdark">
              Grobe Orientierung auf Basis vereinfachter Annahmen, keine Versorgungsauskunft und keine Rechts- oder
              Steuerberatung. Die tatsächliche Versorgung hängt u. a. von Bundesland, Besoldung, Zurechnungszeit und
              Abschlägen ab.
            </p>
          </div>

          <p className="text-sm font-semibold text-primary">
            Möchten Sie eine persönliche Einschätzung dazu? Dann sende ich Ihnen die Auswertung und prüfe die Zahlen
            genau, kostenfrei und unverbindlich.
          </p>
          <input type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ihr Name" className={inputClass} />
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihre@email.de" className={inputClass} />
          <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon (optional, für schnellen Rückruf)" className={inputClass} />
          {/* Honeypot gegen Spam-Bots */}
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <label className="flex items-start gap-2 text-xs text-mediumdark">
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0" />
            <span>
              Ich bin damit einverstanden, dass Albert Sibert mich zu meinen Angaben per E-Mail und, falls angegeben,
              telefonisch kontaktiert. Meine Angaben werden dafür verarbeitet; die Einwilligung kann ich jederzeit
              widerrufen. Details in der{" "}
              <Link href="/datenschutz" className="underline">
                Datenschutzerklärung
              </Link>
              .
            </span>
          </label>
          <button type="submit" disabled={status === "loading"} className="rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
            {status === "loading" ? "Wird gesendet…" : "Persönliche Einschätzung anfordern"}
          </button>
          {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
          <p className="text-xs text-mediumdark">
            Gesundheitsdaten werden hier nicht abgefragt. Die klären wir bei Bedarf im persönlichen Gespräch.
          </p>
        </form>
      )}

      {stepIndex > 0 && status !== "loading" && (
        <button type="button" onClick={() => setStepIndex((i) => i - 1)} className="inline-flex items-center gap-1.5 self-start text-sm text-mediumdark hover:text-primary">
          <ArrowLeft className="size-4" />
          Zurück
        </button>
      )}
    </div>
  );
}
