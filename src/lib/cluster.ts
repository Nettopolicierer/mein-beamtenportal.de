// Themen-Cluster: Jeder Artikel verlinkt am Ende auf die Hauptseiten (Pillar) seines Themas.
// Das stärkt die Hauptseiten intern und führt Leser zu den Seiten mit Beratungsbezug.
export interface ClusterLink { slug: string; label: string }

const DU: ClusterLink[] = [
  { slug: "dienstunfaehigkeitsversicherung", label: "Dienstunfähigkeitsversicherung für Beamte: der Leitfaden" },
  { slug: "echte-dienstunfaehigkeitsklausel", label: "Echte Dienstunfähigkeitsklausel erklärt" },
  { slug: "dienstunfaehigkeit-berufsunfaehigkeit", label: "Dienstunfähigkeit oder Berufsunfähigkeit: der Unterschied" },
];
const PKV: ClusterLink[] = [
  { slug: "pkv-fuer-beamte", label: "Private Krankenversicherung für Beamte: der PKV-Ratgeber" },
  { slug: "pauschale-beihilfe", label: "Pauschale Beihilfe: GKV oder PKV bei der Verbeamtung" },
  { slug: "oeffnungsaktion-pkv-fuer-beamte", label: "Öffnungsaktion der PKV für Beamte" },
];
const REF: ClusterLink[] = [
  { slug: "pkv-fuer-referendare", label: "PKV für Referendare: Krankenversicherung im Referendariat" },
  { slug: "anwartschaft-im-referendariat", label: "Anwartschaft im Referendariat" },
  { slug: "dienstunfaehigkeitsversicherung", label: "Dienstunfähigkeitsversicherung für Beamte: der Leitfaden" },
];

export function clusterLinks(slug: string, categories: string[]): { heading: string; links: ClusterLink[] } | null {
  let heading = "";
  let pool: ClusterLink[] = [];
  if (categories.includes("Referendare")) { heading = "Mehr zu Referendariat und Anwärterzeit"; pool = REF; }
  else if (categories.includes("DU") || categories.includes("BU")) { heading = "Mehr zur Absicherung bei Dienstunfähigkeit"; pool = DU; }
  else if (categories.includes("PKV")) { heading = "Mehr zu PKV und Beihilfe"; pool = PKV; }
  const links = pool.filter((l) => l.slug !== slug);
  return links.length ? { heading, links } : null;
}
