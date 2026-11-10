// Strukturierte Daten (schema.org, JSON-LD) für Artikelseiten: Artikel, Autor, Unternehmen, Brotkrumen und FAQ.
// Die FAQ werden nur aus den sichtbaren <details>-Blöcken des Artikels übernommen, nie erfunden.

const BASE = "https://www.mein-beamtenportal.de";
const PERSON_ID = `${BASE}/#albert-sibert`;
const ORG_ID = `${BASE}/#organisation`;

const abs = (u?: string | null) => (u ? (u.startsWith("http") ? u : `${BASE}${u.startsWith("/") ? "" : "/"}${u}`) : undefined);
const plain = (h: string) =>
  h
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

export function extractFaq(html: string) {
  const out: { q: string; a: string }[] = [];
  for (const m of html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)) {
    const q = plain(m[1]);
    const a = plain(m[2]);
    if (q && a) out.push({ q, a });
  }
  return out;
}

interface PostLike {
  slug: string;
  title: string;
  description?: string;
  date: string;
  modified?: string;
  featuredImage?: string | null;
  html: string;
}

export function articleJsonLd(post: PostLike) {
  const url = `${BASE}/${post.slug}`;
  const faq = extractFaq(post.html);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Mein Beamtenportal",
      url: BASE,
      logo: `${BASE}/logo.svg`,
      email: "kontakt@albert-sibert.de",
      telephone: "+49 176 92609041",
      address: { "@type": "PostalAddress", streetAddress: "Gämsenbergstraße 22", postalCode: "71640", addressLocality: "Ludwigsburg", addressCountry: "DE" },
      sameAs: ["https://www.provenexpert.com/de-de/albert-sibert/", "https://www.linkedin.com/in/albert-sibert-86225a231/"],
      founder: { "@id": PERSON_ID },
      identifier: { "@type": "PropertyValue", name: "Vermittlerregister-Nr. (§ 34d Abs. 1 GewO)", value: "D-4EHE-G249E-13" },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Albert Sibert",
      jobTitle: "Unabhängiger Finanzberater und Versicherungsvertreter (§ 34d Abs. 1 GewO)",
      worksFor: { "@id": ORG_ID },
      url: `${BASE}/ueber-uns`,
      sameAs: ["https://www.linkedin.com/in/albert-sibert-86225a231/"],
      knowsAbout: ["Beamtenversorgung", "Beihilfe", "Private Krankenversicherung für Beamte", "Dienstunfähigkeit", "Altersvorsorge für Beamte"],
    },
    {
      "@type": "Article",
      "@id": `${url}#artikel`,
      headline: post.title,
      description: post.description || undefined,
      image: abs(post.featuredImage),
      datePublished: post.date,
      dateModified: post.modified || post.date,
      inLanguage: "de-DE",
      mainEntityOfPage: url,
      author: { "@id": PERSON_ID },
      publisher: { "@id": ORG_ID },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: BASE },
        { "@type": "ListItem", position: 2, name: "Ratgeber", item: `${BASE}/ratgeber` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/** JSON für <script type="application/ld+json">: "<" maskieren, damit nichts den Tag schließen kann. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
