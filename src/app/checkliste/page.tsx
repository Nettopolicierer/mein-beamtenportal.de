import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { ChecklisteFormular } from "./ChecklisteFormular";

export const metadata: Metadata = {
  title: "360°-Beamten-Versorgungs-Checkliste 2026 kostenlos als PDF",
  description: "Beihilfe, PKV, Dienstunfähigkeit, Pension und Steuern: Die Checkliste für Beamte, Referendare und Anwärter. Kostenlos als PDF.",
  alternates: { canonical: "/checkliste" },
};

const INHALT = [
  "Krankenversicherung und Beihilfe: Beihilfesatz, Restkosten-Tarif, Öffnungsaktion, Anwartschaft",
  "Dienstunfähigkeit: Klausel, Status, Wartezeit, Laufzeit und Höhe der Absicherung",
  "Pension und Steuern: Dienstzeiten, Teilzeit, Abschlag, Besteuerung, zusätzliche Vorsorge",
  "Familie und Absicherung: Hinterbliebenenversorgung, Haftpflicht, Vertragsüberblick",
];

export default function ChecklistePage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-widest text-[#1E5FA8] uppercase">Kostenlos · PDF · 2 Seiten</p>
        <h1 className="font-heading mb-4 text-3xl font-bold text-primary sm:text-4xl">360°-Beamten-Versorgungs-Checkliste 2026</h1>
        <p className="mb-6 text-lg text-mediumdark">
          Was sollten Beamte, Referendare und Anwärter geklärt haben? Haken Sie ab, was bei Ihnen schon passt, und sehen Sie, was offen ist.
        </p>
        <ul className="flex flex-col gap-3 text-mediumdark">
          {INHALT.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#1E5FA8]" />
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-mediumdark">
          Die Checkliste dient der allgemeinen Information und ersetzt keine individuelle Beratung. Regelungen können je nach Dienstherr abweichen.
        </p>
      </div>
      <ChecklisteFormular />
    </main>
  );
}
