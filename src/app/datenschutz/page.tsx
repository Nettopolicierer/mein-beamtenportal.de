import type { Metadata } from "next";
import { StaticPageView } from "@/components/StaticPageView";

export const metadata: Metadata = { title: "Datenschutz", alternates: { canonical: "/datenschutz" } };

export default function DatenschutzPage() {
  return <StaticPageView slug="datenschutz" />;
}
