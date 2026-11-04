// Werbe-Landingpages: ohne Header, Navigation, Footer, Webinar-Banner und Pop-ups,
// damit nichts vom Ziel ablenkt. Pflichtangaben stehen im eigenen Mini-Footer der Seite.
export const LANDING_PATHS = ["/referendar-bw", "/anfrage"];

export function isLandingPath(pathname: string | null) {
  return pathname !== null && LANDING_PATHS.includes(pathname.replace(/\/$/, ""));
}

// Ruhige Artikelseiten: kein Scroll-Popup und kein Webinar-Banner, damit genau ein Lead-Pfad bleibt.
export const CALM_PATHS = ["/wie-hoch-ist-die-pension-bei-a13-netto"];

export function isCalmPath(pathname: string | null) {
  return pathname !== null && CALM_PATHS.includes(pathname.replace(/\/$/, ""));
}
