import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Logo ist ein lokales SVG; Next optimiert SVGs standardmäßig nicht.
    dangerouslyAllowSVG: true,
  },
  async redirects() {
    return [
      // Alte WordPress-Adressen, die noch verlinkt bzw. bei Google bekannt sind.
      { source: "/cookie-richtlinie-eu", destination: "/datenschutz", permanent: true },
      { source: "/beratung", destination: "/kontakt", permanent: true },
      { source: "/beamtenpension-rechner-berechnen-sie-ihre-pension", destination: "/ratgeber", permanent: true },
      // Alte Adressen, die Google noch als 404 meldet (Search Console, Oktober 2026), auf die passenden Seiten.
      { source: "/ueber-mich", destination: "/ueber-uns", permanent: true },
      { source: "/verbeamtung-auf-probe-finanzen", destination: "/verbeamtung-auf-probe-finanzfehler", permanent: true },
      { source: "/ratgeber/bu/berufsunfaehigkeitsversicherung-fuer-beamte-sinnvoll", destination: "/berufsunfaehigkeitsversicherung-beamte-sinnvoll", permanent: true },
      { source: "/ratgeber/beamte/abzuege-pension-beamte", destination: "/wie-hoch-ist-die-pension-bei-a13-netto", permanent: true },
      { source: "/ratgeber/pkv/beihilfe-einkommensgrenze-brutto-oder-netto", destination: "/beihilfe-fuer-ehepartner", permanent: true },
      { source: "/nettovorteil-beamte", destination: "/ratgeber", permanent: true },
      // Artikel sind flach unter / geroutet ([slug]/page.tsx), nicht unter
      // /ratgeber/<kategorie>/. Mehrere Artikel verlinkten intern trotzdem
      // mit diesem (WordPress-artigen) Pfadschema - alle betroffenen Links
      // wurden direkt im Content korrigiert, dieser Redirect ist nur ein
      // Sicherheitsnetz fuer evtl. extern verlinkte oder von Google noch
      // indexierte alte URLs in diesem Format.
      {
        source: "/ratgeber/:category/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
