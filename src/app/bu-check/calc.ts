// Grobe Orientierungsrechnung fuer den BU-/DU-Check. Bewusst vereinfacht und
// als Spanne ausgegeben - KEINE Versorgungsauskunft. Basis (Bundes-Regeln,
// Laender weichen im Detail ab): 1,79375 % Ruhegehaltssatz je Dienstjahr,
// max. 71,75 %, Mindestruhegehalt 35 %, 5 Jahre Wartezeit; Beamte auf Probe/
// Widerruf erhalten bei Dienstunfaehigkeit (ausser Dienstunfall) kein
// Ruhegehalt, sondern werden in der gesetzlichen Rente nachversichert.

export type Status = "student" | "widerruf" | "probe" | "lebenszeit";
export type Ampel = "gruen" | "gelb" | "rot";

export const ZIEL_ANTEIL = 0.8; // Absicherungsziel: ca. 80 % des Nettos
const SATZ_PRO_JAHR = 1.79375;
const SATZ_MAX = 71.75;
const SATZ_MIN = 35;
const WARTEZEIT_JAHRE = 5;
const ZURECHNUNG_BIS_ALTER = 60;

export interface CalcInput {
  status: Status;
  alter: number;
  netto: number;
  dienstjahre: number;
  /** Monatliche Rente aus bestehendem Vertrag (Mittelwert des gewaehlten Bereichs), null = unbekannt */
  vertragsrente: number | null;
}

export interface CalcResult {
  ziel: number;
  hatRuhegehalt: boolean;
  versorgungMin: number;
  versorgungMax: number;
  lueckeMin: number;
  lueckeMax: number;
  ampel: Ampel;
}

const round50 = (v: number) => Math.round(v / 50) * 50;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function calculate(input: CalcInput): CalcResult {
  const { status, alter, netto, dienstjahre, vertragsrente } = input;
  const ziel = round50(netto * ZIEL_ANTEIL);
  const rente = vertragsrente ?? 0;

  const hatRuhegehalt = status === "lebenszeit" && dienstjahre >= WARTEZEIT_JAHRE;

  let versorgungMin = 0;
  let versorgungMax = 0;
  if (hatRuhegehalt) {
    const satzMin = clamp(SATZ_PRO_JAHR * dienstjahre, SATZ_MIN, SATZ_MAX);
    // Obergrenze: mit Zurechnungszeit (2/3 der Zeit bis zum Alter 60, Bundes-Regel)
    const zurechnung = (Math.max(0, ZURECHNUNG_BIS_ALTER - alter) * 2) / 3;
    const satzMax = clamp(SATZ_PRO_JAHR * (dienstjahre + zurechnung), SATZ_MIN, SATZ_MAX);
    versorgungMin = round50((satzMin / 100) * netto);
    versorgungMax = round50((satzMax / 100) * netto);
  }

  const lueckeMin = Math.max(0, round50(ziel - versorgungMax - rente));
  const lueckeMax = Math.max(0, round50(ziel - versorgungMin - rente));

  const anteil = ziel > 0 ? lueckeMax / ziel : 0;
  const ampel: Ampel = anteil <= 0.1 ? "gruen" : anteil <= 0.3 ? "gelb" : "rot";

  return { ziel, hatRuhegehalt, versorgungMin, versorgungMax, lueckeMin, lueckeMax, ampel };
}

export const eur = (v: number) => `${v.toLocaleString("de-DE")} €`;

export const RENTE_BEREICHE: { label: string; mid: number | null }[] = [
  { label: "Unter 500 €", mid: 250 },
  { label: "500 bis 1.000 €", mid: 750 },
  { label: "1.000 bis 1.500 €", mid: 1250 },
  { label: "1.500 bis 2.000 €", mid: 1750 },
  { label: "Über 2.000 €", mid: 2250 },
  { label: "Weiß ich nicht", mid: null },
];

export const BEITRAG_BEREICHE = [
  "Unter 30 €",
  "30 bis 60 €",
  "60 bis 100 €",
  "Über 100 €",
  "Weiß ich nicht",
];

export type TriState = "ja" | "nein" | "unklar";

export function triAmpel(v: TriState | undefined): Ampel {
  return v === "ja" ? "gruen" : v === "nein" ? "rot" : "gelb";
}

export function worst(...a: Ampel[]): Ampel {
  return a.includes("rot") ? "rot" : a.includes("gelb") ? "gelb" : "gruen";
}
