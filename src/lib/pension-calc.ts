// Gemeinsame Rechenlogik für den Pensions-Lückenrechner (Browser) und die PDF-Auswertung (Server).
// Alle Werte sind gerundete Richtwerte zur groben Einordnung, keine verbindliche Berechnung:
// Die amtliche Zahl kommt von der Bezügestelle, die steuerliche Wirkung vom Finanzamt.

// Gerundete ruhegehaltfähige Dienstbezüge (Endstufe, monatlich brutto), ohne Familienzuschläge.
// Basis ist A13 = 6.100 € (Bund/Baden-Württemberg); die übrigen Gruppen sind darauf skaliert.
export const BESOLDUNG = {
  A7: { label: "A7", brutto: 3500 },
  A8: { label: "A8", brutto: 3800 },
  A9: { label: "A9", brutto: 4150 },
  A10: { label: "A10", brutto: 4600 },
  A11: { label: "A11", brutto: 5100 },
  A12: { label: "A12", brutto: 5600 },
  A13: { label: "A13", brutto: 6100 },
  A14: { label: "A14", brutto: 6900 },
  A15: { label: "A15", brutto: 7700 },
} as const;
export type Gruppe = keyof typeof BESOLDUNG;
export const GRUPPEN = Object.keys(BESOLDUNG) as Gruppe[];

export const PROZENT_PRO_DIENSTJAHR = 1.79375;
export const HOECHSTSATZ = 71.75;
export const REGELALTERSGRENZE = 67;
const ABSCHLAG_PRO_JAHR = 0.036; // Versorgungsabschlag je Jahr vor der Regelaltersgrenze
const MAX_ABSCHLAG = 0.108;
export const NETTO_FAKTOR_AKTIV = 0.78; // grob: Netto-Anteil der Besoldung im aktiven Dienst (nach Steuern und PKV)

// Modellannahmen für den Beispiel-Sparplan (keine Prognose).
export const MODELL_RENDITE = 0.05;
export const ENTNAHMERATE = 0.04;
/** Annahme für den Kaufkraft-Abzug der Zusatzrente (keine Prognose). */
export const INFLATION = 0.02;

export interface PensionInput {
  gruppe: Gruppe;
  alter: number;
  pensionsalter: number;
  dienstjahre: number;
  sparrate: number; // Beispiel-Beitrag, € pro Monat
  /** Optional: eigene ruhegehaltfähige Dienstbezüge (brutto, monatlich) statt des Gruppenwerts. */
  eigenesBrutto?: number;
}

/** Netto-Anteil der Pension: sinkt mit der Höhe (Steuerprogression); 75 % bei 4.377 € brutto. */
export function nettoFaktorPension(pensionBrutto: number) {
  return Math.min(0.85, Math.max(0.7, 0.75 + (4377 - pensionBrutto) * 0.00004));
}

/** Grober Grenzsteuersatz aus dem Bruttogehalt (Zone 3 des Tarifs, 24 bis 42 %). */
export function grenzsteuersatz(bruttoMonat: number) {
  const zvE = bruttoMonat * 12 * 0.9 - 3000;
  return Math.min(0.42, Math.max(0.14, 0.24 + ((zvE - 17800) / 52078) * 0.18));
}

export function calcPension(i: PensionInput) {
  const brutto = i.eigenesBrutto && i.eigenesBrutto > 0 ? i.eigenesBrutto : BESOLDUNG[i.gruppe].brutto;
  const satz = Math.min(i.dienstjahre * PROZENT_PRO_DIENSTJAHR, HOECHSTSATZ);
  const abschlag = Math.min(Math.max(REGELALTERSGRENZE - i.pensionsalter, 0) * ABSCHLAG_PRO_JAHR, MAX_ABSCHLAG);
  const pensionBrutto = ((brutto * satz) / 100) * (1 - abschlag);
  const faktorPension = nettoFaktorPension(pensionBrutto);
  const pensionNetto = pensionBrutto * faktorPension;
  const nettoAktiv = brutto * NETTO_FAKTOR_AKTIV;
  const luecke = Math.max(nettoAktiv - pensionNetto, 0);
  const lueckeProzent = nettoAktiv > 0 ? (luecke / nettoAktiv) * 100 : 0;
  const jahreBisPension = Math.max(i.pensionsalter - i.alter, 0);
  const grenz = grenzsteuersatz(brutto);
  const steuervorteilJahr = i.sparrate * 12 * grenz;
  const nettoKostenMonat = i.sparrate - steuervorteilJahr / 12;

  // Beispiel-Sparplan bis zur Pension: Kapital (Modellrendite), daraus Entnahme (Entnahmerate).
  const sparKapital = kapitalAus(i.sparrate, jahreBisPension, MODELL_RENDITE);
  const zusatzRenteNominal = (sparKapital * ENTNAHMERATE) / 12;
  // Vergleich mit der Lücke nur in heutiger Kaufkraft (die Lücke ist in heutigen Euro gerechnet).
  const zusatzRente = zusatzRenteNominal / Math.pow(1 + INFLATION, jahreBisPension);
  const lueckeGeschlossenProzent = luecke > 0 ? Math.min((zusatzRente / luecke) * 100, 100) : 0;

  return {
    brutto,
    grenzsteuersatz: grenz,
    satz,
    abschlag,
    faktorPension,
    pensionBrutto,
    pensionNetto,
    nettoAktiv,
    luecke,
    lueckeProzent,
    jahreBisPension,
    steuervorteilJahr,
    nettoKostenMonat,
    sparKapital,
    zusatzRente,
    zusatzRenteNominal,
    lueckeGeschlossenProzent,
  };
}

/** Endkapital eines Sparplans: monatliche Rate über `jahre` Jahre bei Rendite p. a. */
export function kapitalAus(rate: number, jahre: number, renditePa: number) {
  const n = Math.max(jahre, 0) * 12;
  if (n === 0 || rate <= 0) return 0;
  const r = Math.pow(1 + renditePa, 1 / 12) - 1;
  return (rate * (Math.pow(1 + r, n) - 1)) / r;
}

/** Monatliche Sparrate, um in `jahre` Jahren das Kapital `ziel` aufzubauen (Modellrechnung). */
export function sparrateFuerZiel(ziel: number, jahre: number, renditePa: number) {
  const n = Math.max(jahre, 1) * 12;
  const r = Math.pow(1 + renditePa, 1 / 12) - 1;
  return (ziel * r) / (Math.pow(1 + r, n) - 1);
}

/** Kapital, aus dem eine monatliche Entnahme `monatlich` bei Entnahmerate `rate` p. a. fließt. */
export function kapitalFuerEntnahme(monatlich: number, rate = ENTNAHMERATE) {
  return (monatlich * 12) / rate;
}
