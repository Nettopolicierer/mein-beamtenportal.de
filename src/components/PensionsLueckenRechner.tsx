"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

// Richtwerte zur groben Einordnung (rund gerundete Endgrundgehälter, Netto-Faktoren und
// Grenzsteuersätze). Keine verbindliche Berechnung: Die amtliche Zahl kommt von der
// Bezügestelle, die steuerliche Wirkung vom Finanzamt bzw. Steuerberater.
const BESOLDUNG = {
  A12: { label: "A12", brutto: 5600, grenzsteuersatz: 0.35 },
  A13: { label: "A13", brutto: 6100, grenzsteuersatz: 0.38 },
  A14: { label: "A14", brutto: 6900, grenzsteuersatz: 0.4 },
  A15: { label: "A15", brutto: 7700, grenzsteuersatz: 0.42 },
} as const;
type Gruppe = keyof typeof BESOLDUNG;

const PROZENT_PRO_DIENSTJAHR = 1.79375;
const HOECHSTSATZ = 71.75;
const REGELALTERSGRENZE = 67;
const ABSCHLAG_PRO_JAHR = 0.036; // Versorgungsabschlag je Jahr vor der Regelaltersgrenze
const MAX_ABSCHLAG = 0.108;
const NETTO_FAKTOR_AKTIV = 0.78; // grob: Netto-Anteil der Besoldung im aktiven Dienst (nach Steuern und PKV)
const NETTO_FAKTOR_PENSION = 0.75; // grob: Netto-Anteil der Pension (nach Steuern, PKV und Pflege)

const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;

const inputClass =
  "h-12 w-full rounded-xl border border-[#cbd5e1]/20 bg-[#0a1128] px-4 text-base text-white outline-none focus-visible:border-[#eab308]";

export function PensionsLueckenRechner() {
  const [gruppe, setGruppe] = useState<Gruppe>("A13");
  const [alter, setAlter] = useState(35);
  const [pensionsalter, setPensionsalter] = useState(67);
  const [dienstjahre, setDienstjahre] = useState(40);
  const [sparrate, setSparrate] = useState(250);

  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const b = BESOLDUNG[gruppe];
  const satz = Math.min(dienstjahre * PROZENT_PRO_DIENSTJAHR, HOECHSTSATZ);
  const abschlag = Math.min(Math.max(REGELALTERSGRENZE - pensionsalter, 0) * ABSCHLAG_PRO_JAHR, MAX_ABSCHLAG);
  const pensionBrutto = (b.brutto * satz) / 100 * (1 - abschlag);
  const pensionNetto = pensionBrutto * NETTO_FAKTOR_PENSION;
  const nettoAktiv = b.brutto * NETTO_FAKTOR_AKTIV;
  const luecke = Math.max(nettoAktiv - pensionNetto, 0);
  const lueckeProzent = nettoAktiv > 0 ? (luecke / nettoAktiv) * 100 : 0;
  const jahreBisPension = Math.max(pensionsalter - alter, 0);

  const sparJahr = sparrate * 12;
  const steuervorteilJahr = sparJahr * b.grenzsteuersatz;
  const nettoKostenMonat = sparrate - steuervorteilJahr / 12;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          besoldungsgruppe: gruppe,
          alter,
          pensionsalter,
          dienstjahre,
          sparrate,
          nettoPension: Math.round(pensionNetto),
          luecke: Math.round(luecke),
          steuervorteilJahr: Math.round(steuervorteilJahr),
          email,
          consent,
          website,
        }),
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

  return (
    <section
      aria-labelledby="pl-title"
      className="not-prose my-12 hyphens-manual overflow-hidden rounded-2xl border border-[#cbd5e1]/20 bg-gradient-to-b from-[#0a1128] to-[#0f172a] p-5 text-white sm:p-8"
    >
      <p className="text-xs font-semibold tracking-widest text-[#eab308] uppercase">Pensions-Lückenrechner</p>
      <h2 id="pl-title" className="font-heading mt-1 text-2xl font-bold text-white sm:text-3xl">
        Wie groß ist deine Lücke im Ruhestand?
      </h2>
      <p className="mt-2 text-sm text-[#cbd5e1]">
        Bewege die Regler. Alle Werte sind Richtwerte in heutiger Kaufkraft, monatlich.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
          Besoldungsgruppe
          <select value={gruppe} onChange={(e) => setGruppe(e.target.value as Gruppe)} className={inputClass}>
            {(Object.keys(BESOLDUNG) as Gruppe[]).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
          Dein Alter heute: {alter} Jahre
          <input type="range" min={22} max={60} value={alter} onChange={(e) => setAlter(Number(e.target.value))} className="h-12 w-full accent-[#eab308]" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
          Geplantes Eintrittsalter in die Pension: {pensionsalter} Jahre
          <input type="range" min={63} max={67} value={pensionsalter} onChange={(e) => setPensionsalter(Number(e.target.value))} className="h-12 w-full accent-[#eab308]" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
          Voraussichtliche Dienstjahre: {dienstjahre}
          <input type="range" min={20} max={40} value={dienstjahre} onChange={(e) => setDienstjahre(Number(e.target.value))} className="h-12 w-full accent-[#eab308]" />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#cbd5e1]/20 bg-[#0f172a] p-5">
          <p className="text-sm text-[#cbd5e1]">Voraussichtliche Netto-Pension</p>
          <p className="font-heading mt-1 text-3xl font-bold text-white">{eur(pensionNetto)}</p>
          <p className="mt-1 text-xs text-[#cbd5e1]">
            Ruhegehaltssatz {satz.toFixed(1).replace(".", ",")} %
            {abschlag > 0 ? `, Versorgungsabschlag ${(abschlag * 100).toFixed(1).replace(".", ",")} %` : ""}
          </p>
        </div>
        <div className="rounded-xl border border-[#eab308]/60 bg-[#0f172a] p-5">
          <p className="text-sm text-[#cbd5e1]">Reale Kaufkraft-Lücke im Ruhestand</p>
          <p className="font-heading mt-1 text-3xl font-bold text-[#eab308]">{eur(luecke)} / Monat</p>
          <p className="mt-1 text-xs text-[#cbd5e1]">
            {lueckeProzent.toFixed(0)} % weniger als dein heutiges Netto von ca. {eur(nettoAktiv)}
            {jahreBisPension > 0 ? `, in ${jahreBisPension} Jahren` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#cbd5e1]/20 bg-[#0f172a] p-5">
        <p className="text-sm font-semibold text-white">Der Hebel: Steuervorteil durch eine Basisrente (§ 10 EStG)</p>
        <label className="mt-3 flex flex-col gap-1.5 text-sm text-[#cbd5e1]">
          Monatlicher Beitrag: {eur(sparrate)}
          <input type="range" min={50} max={500} step={25} value={sparrate} onChange={(e) => setSparrate(Number(e.target.value))} className="h-10 w-full accent-[#eab308]" />
        </label>
        <p className="mt-2 text-sm text-[#cbd5e1]">
          Möglicher Steuervorteil pro Jahr:{" "}
          <span className="font-heading text-xl font-bold text-[#eab308]">{eur(steuervorteilJahr)}</span>
          <span className="block text-xs">
            Dein Beitrag kostet dich netto dadurch nur etwa {eur(nettoKostenMonat)} im Monat (bei einem geschätzten
            Grenzsteuersatz von {Math.round(b.grenzsteuersatz * 100)} %).
          </span>
        </p>
        <p className="mt-3 text-xs text-[#cbd5e1]">
          Beiträge sind steuerlich absetzbar, die spätere Rente wird dafür nachgelagert besteuert. Die Basisrente ist
          nicht vererbbar, nicht beleihbar und zahlt nur als lebenslange Rente aus. Für Beamte wird der Höchstbetrag
          gekürzt, bei den hier einstellbaren Beiträgen ist er in der Regel nicht ausgeschöpft. Das Ergebnis ist eine
          Orientierung, keine Steuerberatung.
        </p>
      </div>

      {state === "success" ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#eab308]/60 bg-[#0f172a] p-5">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[#eab308]" />
          <div>
            <p className="font-heading text-lg font-bold text-white">Danke, deine Anfrage ist da.</p>
            <p className="mt-1 text-sm text-[#cbd5e1]">
              Ich melde mich persönlich bei dir per E-Mail. Eine Bestätigung ist schon unterwegs.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 rounded-xl border border-[#cbd5e1]/20 bg-[#0f172a] p-5">
          <p className="font-heading text-lg font-bold text-white">
            3-Töpfe-Fahrplan &amp; Steueroptimierung für Beamte: Auswertung für deine Besoldungsgruppe anfordern
          </p>
          <input
            type="email"
            required
            autoComplete="email"
            aria-label="E-Mail-Adresse"
            placeholder="Deine E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <label className="flex items-start gap-2 text-xs text-[#cbd5e1]">
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#eab308]" />
            <span>
              Ich willige ein, dass Albert Sibert mich per E-Mail kontaktiert und meine Angaben aus dem Rechner dafür
              verarbeitet (Art. 6 Abs. 1 lit. a DSGVO). Die Einwilligung kann ich jederzeit widerrufen. Details in der{" "}
              <Link href="/datenschutz" className="underline">
                Datenschutzerklärung
              </Link>
              .
            </span>
          </label>
          <button
            type="submit"
            disabled={state === "loading"}
            style={{ color: "#0a1128" }}
            className="rounded-xl bg-[#eab308] px-6 py-4 text-center text-base font-semibold transition hover:bg-[#ca8a04] disabled:opacity-60"
          >
            {state === "loading" ? "Wird gesendet…" : "Auswertung kostenlos anfordern"}
          </button>
          {state === "error" && (
            <p role="alert" className="text-sm font-medium text-[#eab308]">
              {error}
            </p>
          )}
          <p className="text-xs text-[#cbd5e1]">Über 80 Bewertungen mit durchschnittlich 4,9 von 5 Sternen.</p>
        </form>
      )}

      <p className="mt-4 text-xs text-[#cbd5e1]/80">
        Grobe Näherung mit gerundeten Endgrundgehältern (A12 {eur(BESOLDUNG.A12.brutto)}, A13 {eur(BESOLDUNG.A13.brutto)}, A14 {eur(BESOLDUNG.A14.brutto)}, A15 {eur(BESOLDUNG.A15.brutto)} brutto),
        pauschalen Netto-Faktoren und ohne Familienzuschläge. Die Besoldung steigt in der Regel mit den Preisen, deshalb sind alle Werte
        in heutiger Kaufkraft angegeben. Die amtliche Zahl erhältst du ausschließlich von deiner Bezügestelle.
      </p>
    </section>
  );
}
