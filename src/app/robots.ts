import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // SEO-Analyse- und Werbe-Crawler ohne Nutzen für Rankings oder Antworten von Suchmaschinen: sparen Vercel-Kontingent.
      { userAgent: ["SERankingBacklinksBot", "PetalBot", "AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "Bytespider"], disallow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: "https://www.mein-beamtenportal.de/sitemap.xml",
  };
}
