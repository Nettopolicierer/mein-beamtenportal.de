import posts from "@/content-posts.json";
import pages from "@/content-pages.json";

export interface TocEntry {
  href: string;
  text: string;
}

export interface Post {
  slug: string;
  title: string;
  subtitle: string;
  toc: TocEntry[];
  description: string;
  date: string;
  modified: string;
  categories: string[];
  featuredImage: string | null;
  featuredImageAlt: string;
  html: string;
}

export interface StaticPage {
  slug: string;
  title: string;
  subtitle: string;
  html: string;
}

export const ALL_POSTS = posts as Post[];
export const ALL_PAGES = pages as StaticPage[];

export const SORTED_POSTS = [...ALL_POSTS].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export function getPost(slug: string): Post | undefined {
  return ALL_POSTS.find((p) => p.slug === slug);
}

export function getPage(slug: string): StaticPage | undefined {
  return ALL_PAGES.find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  const seen = new Set<string>();
  for (const p of SORTED_POSTS) {
    for (const c of p.categories) seen.add(c);
  }
  return Array.from(seen).sort();
}

export function getRelatedPosts(current: Post, limit = 3): Post[] {
  const sameCategory = SORTED_POSTS.filter(
    (p) => p.slug !== current.slug && p.categories.some((c) => current.categories.includes(c))
  );
  const rest = SORTED_POSTS.filter(
    (p) => p.slug !== current.slug && !sameCategory.includes(p)
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));
}

export const BOOKING_LINK = "https://cal.eu/mein-beamtenportal/kostenfreie-erstberatung";
