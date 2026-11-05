import type { Metadata } from "next";
import AbmeldenButton from "./AbmeldenButton";

export const metadata: Metadata = { title: "Abmelden", robots: { index: false, follow: false } };

export default async function AbmeldenPage({ searchParams }: { searchParams: Promise<{ e?: string; t?: string }> }) {
  const { e = "", t = "" } = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Folgemails abbestellen</h1>
      {e && t ? (
        <>
          <p className="mb-6 text-slate-700">Möchten Sie keine weiteren Informationsmails von Mein Beamtenportal erhalten?</p>
          <AbmeldenButton e={e} t={t} />
        </>
      ) : (
        <p className="text-slate-700">Der Link ist unvollständig. Schreiben Sie uns bitte an kontakt@albert-sibert.de, dann tragen wir Sie aus.</p>
      )}
    </main>
  );
}
