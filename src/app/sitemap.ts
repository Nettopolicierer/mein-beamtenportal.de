import type { MetadataRoute } from "next";
import { ALL_POSTS, ALL_PAGES } from "@/lib/content";

export const dynamic = "force-static";

const BASE_URL = "https://mein-beamtenportal.de";

const EXCLUDE_PAGE_SLUGS = new Set(["albert-sibert"]); // ist die Startseite (/)

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/ratgeber`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/bu-check`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/webinar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    ...ALL_PAGES.filter((p) => !EXCLUDE_PAGE_SLUGS.has(p.slug)).map((p) => ({
      url: `${BASE_URL}/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...ALL_POSTS.map((p) => ({
      url: `${BASE_URL}/${p.slug}`,
      lastModified: new Date(p.modified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
