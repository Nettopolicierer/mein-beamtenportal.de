"use client";

import { useState } from "react";
import Link from "next/link";
import { BOOKING_LINK } from "@/lib/content";

const PROZENT_PRO_DIENSTJAHR = 1.79375;
const HOECHSTSATZ = 71.75;
const DIENSTJAHRE_FUER_HOECHSTSATZ = Math.round(HOECHSTSATZ / PROZENT_PRO_DIENSTJAHR);

// Näherung für ein realistisches Endgehalt in der jeweiligen Besoldungsgruppe,
// nur zur groben Einordnung der monatlichen Pension - keine verbindliche
// Berechnung, ersetzt keine individuelle Beratung.
const BESOLDUNG_BEISPIELE = [
  { label: "A9 (z.B. Polizeimeister:in)", endgehalt: 4200 },
  { label: "A12 (z.B. Studienrat/-rätin)", endgehalt: 5600 },
  { label: "A13 (z.B. Regierungsrat/-rätin)", endgehalt: 6300 },
];

export function PensionCalculator() {
  const [dienstjahre, setDienstjahre] = useState(15);
  const [besoldungIdx, setBesoldungIdx] = useState(1);

  const ruhegehaltssatz = Math.min(dienstjahre * PROZENT_PRO_DIENSTJAHR, HOECHSTSATZ);
  const endgehalt = BESOLDUNG_BEISPIELE[besoldungIdx].endgehalt;
  const monatlichePension = Math.round((endgehalt * ruhegehaltssatz) / 100);

  return (
    <div className="rounded-3xl bg-primary p-6 text-white sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-white/60 uppercase">
            Pensions-Rechner
          </p>
          <h2 className="font-heading mb-3 text-2xl font-bold sm:text-3xl">
            Was bleibt von Ihrem Gehalt?
          </h2>
          <p className="mb-6 text-white/75">
            Jedes volle Dienstjahr bringt {PROZENT_PRO_DIENSTJAHR.toString().replace(".", ",")} %
            Ruhegehaltssatz, bis zum Höchstsatz von {HOECHSTSATZ.toString().replace(".", ",")} %
            nach {DIENSTJAHRE_FUER_HOECHSTSATZ} Dienstjahren. Bewegen Sie den Regler für eine
            grobe Einordnung Ihrer aktuellen bzw. geplanten Dienstzeit.
          </p>

          <label className="mb-1 flex items-center justify-between text-sm">
            <span className="text-white/70">Dienstjahre</span>
            <span className="font-heading font-bold">{dienstjahre}</span>
          </label>
          <input
            type="range"
            min={1}
            max={45}
            value={dienstjahre}
            onChange={(e) => setDienstjahre(Number(e.target.value))}
            className="mb-6 w-full accent-white"
          />

          <label className="mb-2 block text-sm text-white/70">Besoldungsgruppe (Beispiel)</label>
          <div className="flex flex-wrap gap-2">
            {BESOLDUNG_BEISPIELE.map((b, idx) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setBesoldungIdx(idx)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  besoldungIdx === idx
                    ? "bg-white text-primary"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 p-6 text-center sm:p-8">
          <p className="mb-1 text-sm text-white/60">Ihr Ruhegehaltssatz</p>
          <p className="font-heading mb-6 text-5xl font-bold">
            {ruhegehaltssatz.toFixed(2).replace(".", ",")} %
          </p>
          <p className="mb-1 text-sm text-white/60">Geschätzte monatliche Pension (brutto)</p>
          <p className="font-heading mb-6 text-4xl font-bold">{monatlichePension.toLocaleString("de-DE")} €</p>
          <p className="mb-6 text-xs text-white/50">
            Grobe Näherung auf Basis eines beispielhaften Endgehalts in heutiger Kaufkraft –
            Inflation bis zum Renteneintritt ist nicht eingerechnet. Keine verbindliche
            Berechnung; die amtliche Zahl erhalten Sie ausschließlich von Ihrer Bezügestelle.
          </p>
          <Link
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary hover:bg-white/90"
          >
            Versorgungslücke besprechen
          </Link>
        </div>
      </div>
    </div>
  );
}
