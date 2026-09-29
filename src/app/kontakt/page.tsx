import type { Metadata } from "next";
import { StaticPageView } from "@/components/StaticPageView";

export const metadata: Metadata = { title: "Kontakt", alternates: { canonical: "/kontakt" } };

export default function KontaktPage() {
  return <StaticPageView slug="kontakt" />;
}
