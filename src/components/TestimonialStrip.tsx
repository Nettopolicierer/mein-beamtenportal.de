import Image from "next/image";
import { Star, Quote } from "lucide-react";

// Echte ProvenExpert-/HORBACH-Bewertungen (vom Nutzer bereitgestellt bzw.
// vom Bewertungsprofil übernommen), anonymisiert mit Initialen der
// Mandant:innen - keine erfundenen Stimmen.
const TESTIMONIALS = [
  {
    name: "Lisa G.",
    role: "Lehrerin",
    quote:
      "Herr Sibert hat eine sehr starke, lösungsorientierte und kompetente Kommunikation, die es sehr leicht macht, Sachverhalte zu verstehen. Ich fühle mich sehr gut beraten und freue mich auf die weitere Zusammenarbeit.",
  },
  {
    name: "Johanna W.",
    role: "Lehrerin",
    quote:
      "Die Beratung durch Herrn Sibert war sehr angenehm, kompetent und zielführend. Er geht auf Wünsche individuell ein und nimmt sich während der Termine sehr viel Zeit.",
  },
  {
    name: "Nadine F.",
    role: "Lehrerin",
    quote:
      "Herr Sibert ist auf alle meine Fragen ausführlich eingegangen und hat alles verständlich erklärt. Vor allem durch seine sympathische und offene Art fühlt man sich bei ihm sehr gut beraten.",
  },
  {
    name: "Mara P.",
    role: "Lehramtsstudentin",
    quote:
      "Sympathisch kompetente Beratung – alle meine Fragen konnten geklärt werden. Auch die Flexibilität in der Terminfindung hat mir gut gefallen.",
  },
  {
    name: "Micha B.",
    role: "Lehramtsstudent",
    quote:
      'Immer freundlich und stets bereit für Rückfragen. Auch das "Mit-rein-nehmen" in die Thematik und das gute Erklären hat mir gefallen.',
  },
  {
    name: "Jana P.",
    role: "Lehramtsstudentin",
    quote:
      "Albert hat sich mit mehreren Online-Terminen sehr viel Zeit genommen, meine Situation zu verstehen und mir daraufhin verschiedene Möglichkeiten vorgestellt. Kosten und Provision wurden offen angesprochen.",
  },
];

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-mediumlight/30">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} className="size-3.5 fill-primary text-primary" />
          ))}
        </div>
        <Quote className="size-5 text-mediumlight" />
      </div>
      <p className="text-sm leading-relaxed text-mediumdark">&ldquo;{t.quote}&rdquo;</p>
      <div className="mt-auto flex items-center gap-3 pt-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {t.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-primary">{t.name}</span>
          <span className="text-xs text-mediumdark">{t.role}</span>
        </div>
      </div>
    </div>
  );
}

export function TestimonialStrip() {
  // Karten werden verdoppelt, damit die Marquee-Animation bei -50% Transform
  // nahtlos wieder am (identischen) Anfang landet - kein sichtbarer Sprung.
  const cards = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="border-b border-mediumlight/40 bg-base py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-center">
          <Image src="/proven-expert.webp" alt="ProvenExpert" width={28} height={28} unoptimized />
          <Image src="/stars.svg" alt="" width={90} height={16} unoptimized />
          <span className="text-sm text-mediumdark">4,9/5 · echte Kundenstimmen</span>
        </div>
      </div>
      <div className="testimonial-mask overflow-hidden">
        <div className="testimonial-marquee flex w-max gap-5">
          {cards.map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
