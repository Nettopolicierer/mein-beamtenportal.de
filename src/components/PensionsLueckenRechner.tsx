"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText } from "lucide-react";
import { track } from "@/lib/track";
import { BESOLDUNG, GRUPPEN, MODELL_RENDITE, calcPension, type Gruppe } from "@/lib/pension-calc";

const PRIMARY = "#002855";
const ACCENT = "#1E5FA8";

function pct(v: number, min: number, max: number) {
  return `${((v - min) / (max - min)) * 100}%`;
}

const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;

const fieldClass =
  "h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-base outline-none placeholder:text-[#64748B] focus-visible:border-[#1E5FA8]";

export function PensionsLueckenRechner({ defaultGruppe = "A13", gated = false }: { defaultGruppe?: Gruppe; gated?: boolean }) {
  const [gruppe, setGruppe] = useState<Gruppe>(defaultGruppe);
  const [eigenes, setEigenes] = useState("");
  const [alter, setAlter] = useState(35);
  const [pensionsalter, setPensionsalter] = useState(67);
  const [dienstjahre, setDienstjahre] = useState(40);
  const [sparrate, setSparrate] = useState(250);

  const [vorname, setVorname] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [nurtureConsent, setNurtureConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const eigenesBrutto = Number(eigenes.replace(/\./g, "").replace(",", ".")) || 0;
  const eigenesOk = eigenesBrutto >= 1500 && eigenesBrutto <= 15000;
  const c = calcPension({ gruppe, alter, pensionsalter, dienstjahre, sparrate, eigenesBrutto: eigenesOk ? eigenesBrutto : undefined });

  // Erste Bedienung des Rechners melden (einmal pro Seitenaufruf), ohne die eingegebenen Werte.
  const started = useRef(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!started.current) {
      started.current = true;
      track("rechner_start", { gated });
    }
  }, [gruppe, alter, pensionsalter, dienstjahre, sparrate, gated]);

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
          eigenesBrutto: eigenesOk ? eigenesBrutto : undefined,
          alter,
          pensionsalter,
          dienstjahre,
          sparrate,
          vorname: vorname.trim() || undefined,
          email,
          consent,
          nurtureConsent,
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
      track("rechner_lead", { gated, folgemails: nurtureConsent }, "lead");
    } catch {
      setError("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
      setState("error");
    }
  }

  return (
    <section
      id="pl-rechner"
      style={{ scrollMarginTop: 96 }}
      aria-labelledby="pl-title"
      className="not-prose my-12 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white text-[#002855] shadow-sm"
    >
      <div className="p-5 sm:p-8">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: ACCENT }}>
          Pensions-Lückenrechner
        </p>
        <h2 id="pl-title" className="font-heading mt-1 text-2xl font-bold sm:text-3xl" style={{ color: PRIMARY }}>
          Wie groß ist Ihre Lücke im Ruhestand?
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Bewegen Sie die Regler. Alle Werte sind Richtwerte in heutiger Kaufkraft, monatlich.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Besoldungsgruppe
            <select
              value={gruppe}
              onChange={(e) => setGruppe(e.target.value as Gruppe)}
              className={fieldClass}
              style={{ color: PRIMARY, backgroundColor: "#FFFFFF" }}
            >
              {GRUPPEN.map((g) => (
                <option key={g} value={g} style={{ color: PRIMARY }}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span>
              Eigene Dienstbezüge brutto <span className="font-normal text-[#64748B]">(optional, pro Monat)</span>
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder={`z. B. ${BESOLDUNG[gruppe].brutto.toLocaleString("de-DE")}`}
              value={eigenes}
              onChange={(e) => setEigenes(e.target.value)}
              className={fieldClass}
              style={{ color: PRIMARY }}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span>
              Ihr Alter heute: <span className="font-bold" style={{ color: ACCENT }}>{alter} Jahre</span>
            </span>
            <input type="range" style={{ ["--pct" as string]: pct(alter, 22, 60) }} min={22} max={60} value={alter} onChange={(e) => setAlter(Number(e.target.value))} className="pl-range" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span>
              Geplantes Pensionsalter: <span className="font-bold" style={{ color: ACCENT }}>{pensionsalter} Jahre</span>
            </span>
            <input type="range" style={{ ["--pct" as string]: pct(pensionsalter, 63, 67) }} min={63} max={67} value={pensionsalter} onChange={(e) => setPensionsalter(Number(e.target.value))} className="pl-range" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
            <span>
              Voraussichtliche Dienstjahre: <span className="font-bold" style={{ color: ACCENT }}>{dienstjahre}</span>
            </span>
            <input type="range" style={{ ["--pct" as string]: pct(dienstjahre, 10, 40) }} min={10} max={40} value={dienstjahre} onChange={(e) => setDienstjahre(Number(e.target.value))} className="pl-range" />
            <span className="text-xs font-normal text-[#64748B]">
              Inkl. anerkannter Vordienstzeiten ab dem {Math.max(pensionsalter - dienstjahre, 16)}. Lebensjahr
            </span>
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1.25fr_1fr]">
          <div className="rounded-xl border border-[#C9DCF0] bg-[#EAF2FB] p-5">
            <p className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">Ihre Kaufkraft-Lücke im Ruhestand</p>
            <p className="font-heading mt-1 text-4xl font-extrabold sm:text-5xl" style={{ color: PRIMARY }}>{eur(c.luecke)}</p>
            <p className="mt-1 text-xs text-[#64748B]">
              pro Monat · {c.lueckeProzent.toFixed(0)} % weniger als Ihr heutiges Netto von ca. {eur(c.nettoAktiv)}
            </p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] p-5">
            <p className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">Voraussichtliche Netto-Pension</p>
            <p className="font-heading mt-1 text-3xl font-bold" style={{ color: PRIMARY }}>{eur(c.pensionNetto)}</p>
            <p className="mt-1 text-xs text-[#64748B]">
              {eur(c.pensionBrutto)} brutto abzüglich Steuern, Pflege &amp; PKV (ca. {eur(c.pensionBrutto - c.pensionNetto)})
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-[#64748B]">
          Ruhegehaltssatz {c.satz.toFixed(2).replace(".", ",")} %
          {c.abschlag > 0 ? `, Versorgungsabschlag ${(c.abschlag * 100).toFixed(1).replace(".", ",")} %` : ""}
        </p>

        <a
          href="#pl-auswertung"
          className="mt-5 flex flex-col items-center justify-center gap-0.5 rounded-xl px-6 py-5 text-center shadow-md"
          style={{ backgroundColor: ACCENT, color: "#FFFFFF" }}
        >
          <span className="text-lg leading-snug font-bold sm:text-xl">
            <FileText className="mr-2 inline size-5 align-[-3px]" />
            Meine Auswertung als PDF anfordern
          </span>
          <span className="text-xs text-white/85">
            Kostenlos · 4 Seiten<span className="hidden sm:inline"> mit Rechenweg und 3-Töpfe-Fahrplan</span> · per E-Mail
          </span>
        </a>

        <div className="mt-6 rounded-xl border border-[#E2E8F0] p-5">
          <p className="text-sm font-semibold">So könnten Sie die Lücke verkleinern (Beispiel mit Basisrente, § 10 EStG)</p>
          <label className="mt-3 flex flex-col gap-1.5 text-sm text-[#64748B]">
            <span>
              Monatlicher Beitrag: <span className="font-bold" style={{ color: ACCENT }}>{eur(sparrate)}</span>
            </span>
            <input type="range" style={{ ["--pct" as string]: pct(sparrate, 50, 500) }} min={50} max={500} step={25} value={sparrate} onChange={(e) => setSparrate(Number(e.target.value))} className="pl-range" />
          </label>
          {!gated && (
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-[#F8FAFC] p-3">
              <p className="text-xs text-[#64748B]">Steuervorteil pro Jahr (bis ca.)</p>
              <p className="font-heading text-xl font-bold" style={{ color: ACCENT }}>{eur(c.steuervorteilJahr)}</p>
              <p className="text-xs text-[#64748B]">Schätzung, netto kostet der Beitrag dann etwa {eur(c.nettoKostenMonat)} im Monat</p>
            </div>
            <div className="rounded-lg bg-[#F8FAFC] p-3">
              <p className="text-xs text-[#64748B]">Kapital bei Pensionsbeginn</p>
              <p className="font-heading text-xl font-bold" style={{ color: PRIMARY }}>{eur(c.sparKapital)}</p>
              <p className="text-xs text-[#64748B]">in {c.jahreBisPension} Jahren bei {Math.round(MODELL_RENDITE * 100)} % Modellrendite</p>
            </div>
            <div className="rounded-lg bg-[#F8FAFC] p-3">
              <p className="text-xs text-[#64748B]">Zusatzrente pro Monat</p>
              <p className="font-heading text-xl font-bold" style={{ color: PRIMARY }}>{eur(c.zusatzRente)}</p>
              <p className="text-xs text-[#64748B]">in heutiger Kaufkraft · deckt {c.lueckeGeschlossenProzent.toFixed(0)} % Ihrer Lücke</p>
            </div>
          </div>
          )}
          <p className="mt-3 text-xs text-[#64748B]">
            Alle Werte sind Richtwerte einer vereinfachten Modellrechnung, keine Prognose und keine Zusage. Der Steuervorteil
            ist eine Schätzung und hängt von Ihrem persönlichen Steuersatz sowie vom für Beamte gekürzten Höchstbetrag ab.
            Die spätere Rente wird nachgelagert besteuert. Die Basisrente ist nicht vererbbar, nicht beleihbar und zahlt nur
            als lebenslange Rente aus. Kosten und Steuern auf Erträge sind nicht berücksichtigt. Dies ist keine Steuer- oder
            Rechtsberatung; für Ihre persönliche Situation fragen Sie bitte Ihren Steuerberater.
          </p>
          {gated && (
          <div
            aria-hidden={state !== "success"}
            className={`mt-4 flex flex-col gap-3 text-sm transition ${state === "success" ? "" : "pointer-events-none select-none"}`}
            style={state === "success" ? undefined : { filter: "blur(6px)" }}
          >
            <div className="rounded-lg bg-[#F8FAFC] p-4">
              <p className="font-semibold" style={{ color: PRIMARY }}>Topf 1: Basisrente (Schicht 1), Steuerhebel nach § 10 EStG</p>
              <p className="mt-1 text-[#334155]">
                Beispiel-Beitrag {eur(sparrate)} pro Monat: Steuervorteil bis ca. {eur(c.steuervorteilJahr)} pro Jahr (Schätzung), netto etwa {eur(c.nettoKostenMonat)} im
                Monat. Kapital bei Pensionsbeginn rund {eur(c.sparKapital)}, Zusatzrente rund {eur(c.zusatzRente)} pro Monat in heutiger Kaufkraft
                (deckt {c.lueckeGeschlossenProzent.toFixed(0)} % Ihrer Lücke).
              </p>
            </div>
            <div className="rounded-lg bg-[#F8FAFC] p-4">
              <p className="font-semibold" style={{ color: PRIMARY }}>Topf 2: Altersvorsorgedepot (Schicht 2)</p>
              <p className="mt-1 text-[#334155]">
                Ein kostengünstiges, breit gestreutes Depot kann die Basisrente ergänzen. Ob und in welcher Höhe eine staatliche Förderung für Sie gilt,
                hängt von den dann geltenden gesetzlichen Regeln und Ihrer persönlichen Situation ab und sollte vor einer Entscheidung geprüft werden.
                Hier rechnen wir bewusst keinen Betrag.
              </p>
            </div>
            <div className="rounded-lg bg-[#F8FAFC] p-4">
              <p className="font-semibold" style={{ color: PRIMARY }}>Topf 3: Freies Depot (flexibler Puffer)</p>
              <p className="mt-1 text-[#334155]">
                Jederzeit verfügbar, zum Beispiel für einen früheren Ruhestand oder unerwartete Ausgaben. Erträge unterliegen der Kapitalertragsteuer,
                der Wert kann schwanken und auch fallen. Eine Verteilung auf die drei Töpfe richtet sich nach Ihrer Lage und Ihren Zielen.
                Hier rechnen wir bewusst keinen Betrag.
              </p>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Lead-Bereich: bewusst groß und farbig abgesetzt */}
      <div id="pl-auswertung" className={`scroll-mt-24 px-5 py-8 sm:px-8 ${gated && state !== "success" ? "relative z-10 mx-3 -mt-40 rounded-2xl shadow-2xl sm:mx-8" : ""}`} style={{ background: `linear-gradient(135deg, ${PRIMARY}, #0B4A8F)` }}>
        {state === "success" ? (
          <div className="flex items-start gap-3 text-white">
            <CheckCircle2 className="mt-0.5 size-7 shrink-0" />
            <div>
              <p className="font-heading text-xl font-bold">Danke, Ihre Auswertung ist unterwegs.</p>
              <p className="mt-1 text-sm text-white/85">
                Sie erhalten Ihre persönliche Pensionsanalyse als PDF per E-Mail. Falls nichts ankommt, schauen Sie bitte
                auch im Spam-Ordner nach.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mx-auto flex max-w-xl flex-col gap-4 text-white">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/70">Kostenlos · als PDF per E-Mail</p>
            <h3 className="font-heading text-2xl font-bold sm:text-3xl">
              {gated ? "Gesamte Auswertung & Fahrplan freischalten" : "Ihre Werte als Auswertung: 3-Töpfe-Fahrplan & Steueroptimierung für Beamte"}
            </h3>
            {gated && (
              <p className="text-sm text-white/90">Erhalten Sie Ihre 4-seitige PDF-Analyse mit Ihrer persönlichen Verteilung per E-Mail.</p>
            )}
            <ul className={`flex flex-col gap-2 text-sm text-white/90 ${gated ? "hidden" : ""}`}>
              {[
                "Ihre persönliche Netto-Pension und Lücke, Schritt für Schritt erklärt",
                "3-Töpfe-Fahrplan: Basisrente, flexibler Kapitalaufbau, Sicherheitsreserve",
                "Welche Sparrate Ihre Lücke schließt, bei drei Renditeszenarien",
                "Checkliste für Ihre nächsten Schritte",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-white" />
                  {t}
                </li>
              ))}
            </ul>
            {gated && (
              <input
                type="text"
                required
                autoComplete="given-name"
                maxLength={40}
                aria-label="Vorname"
                placeholder="Ihr Vorname"
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
                className="h-14 w-full rounded-xl border-0 bg-white px-4 text-base outline-none placeholder:text-[#64748B]"
                style={{ color: PRIMARY }}
              />
            )}
            <input
              type="email"
              required
              autoComplete="email"
              aria-label="E-Mail-Adresse"
              placeholder="Ihre E-Mail-Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 w-full rounded-xl border-0 bg-white px-4 text-base outline-none placeholder:text-[#64748B]"
              style={{ color: PRIMARY }}
            />
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <button
              type="submit"
              disabled={state === "loading"}
              style={{ backgroundColor: "#FFFFFF", color: PRIMARY }}
              className="rounded-xl px-6 py-4 text-center text-lg font-bold shadow-lg transition hover:opacity-90 disabled:opacity-60"
            >
              {state === "loading" ? "Wird gesendet…" : gated ? "Auswertung jetzt freischalten" : "Auswertung kostenlos anfordern"}
            </button>
            <label className="flex items-start gap-2 text-xs text-white/80">
              <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0" />
              <span>
                Ich willige ein, dass Mein Beamtenportal mich per E-Mail kontaktiert und meine Angaben dafür verarbeitet
                (Art. 6 Abs. 1 lit. a DSGVO). Widerruf jederzeit möglich, siehe{" "}
                <Link href="/datenschutz" className="underline">
                  Datenschutzerklärung
                </Link>
                .
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs text-white/80">
              <input type="checkbox" checked={nurtureConsent} onChange={(e) => setNurtureConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0" />
              <span>
                Optional: Ich möchte in den nächsten Tagen bis zu drei weitere Informationsmails zur Pensionsplanung von Mein
                Beamtenportal erhalten (Art. 6 Abs. 1 lit. a DSGVO). Abmeldung jederzeit über den Link in jeder Mail.
              </span>
            </label>
            {state === "error" && (
              <p role="alert" className="rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white">
                {error}
              </p>
            )}
            <p className="text-xs text-white/80">Über 80 Bewertungen mit durchschnittlich 4,9 von 5 Sternen.</p>
          </form>
        )}
      </div>

      <p className="px-5 py-4 text-xs text-[#64748B] sm:px-8">
        Grobe Näherung mit gerundeten Endgrundgehältern (z. B. A9 {eur(BESOLDUNG.A9.brutto)}, A13 {eur(BESOLDUNG.A13.brutto)}, A15 {eur(BESOLDUNG.A15.brutto)} brutto),
        pauschalen Netto-Faktoren und ohne Familienzuschläge. Die Besoldung steigt in der Regel mit den Preisen, deshalb sind alle Werte
        in heutiger Kaufkraft angegeben. Die amtliche Zahl erhalten Sie ausschließlich von Ihrer Bezügestelle.
      </p>
    </section>
  );
}
