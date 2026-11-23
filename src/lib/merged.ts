// Zusammengelegte Artikel (Kannibalisierung vermeiden): alter Slug -> Zielseite. 301-Weiterleitung in next.config.ts,
// aus Sitemap/Listen ausgeblendet (src/lib/content.ts), interne Links im Content sind auf das Ziel umgestellt.
export const MERGED: Record<string, string> = {
  "bu-versicherung-fuer-lehrer": "dienstunfaehigkeitsversicherung-fuer-lehrer",
  "bu-fuer-lehrer": "dienstunfaehigkeitsversicherung-fuer-lehrer",
  "berufsunfaehigkeitsversicherung-fuer-lehrer-sinnvoll": "dienstunfaehigkeitsversicherung-fuer-lehrer",
  "berufsunfaehigkeitsversicherung-fuer-beamte-lehrer-sinnvoll": "dienstunfaehigkeitsversicherung-fuer-lehrer",
  "berufs-oder-dienstunfaehigkeitsversicherung": "dienstunfaehigkeitsversicherung-fuer-lehrer",
  "berufsunfaehigkeit-als-student-wie-sinnvoll-ist-die-absicherung": "berufsunfaehigkeitsversicherung-fuer-studenten-was-sie-wissen-muessen",
  "berufsunfaehigkeit-fuer-studenten-kosten-wie-sie-sparen": "berufsunfaehigkeitsversicherung-fuer-studenten-was-sie-wissen-muessen",
  "oeffnungsklausel-in-der-pkv": "oeffnungsaktion-pkv-fuer-beamte",
  "pkv-oeffnungsklausel-nachteile": "oeffnungsaktion-pkv-fuer-beamte",
  "berufsunfaehigkeitsversicherung-beamte-2026": "bu-fuer-beamte",
  "berufsunfaehigkeitsversicherung-beamte-sinnvoll": "bu-fuer-beamte",
  "referendariat-privat-versichert": "pkv-fuer-referendare",
  "private-krankenversicherung-im-referendariat-lehramt": "pkv-fuer-referendare",
  "pkv-referendare-einstieg": "pkv-fuer-referendare",
};
