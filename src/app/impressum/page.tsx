import type { Metadata } from "next";
import { StaticPageView } from "@/components/StaticPageView";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default function ImpressumPage() {
  return <StaticPageView slug="impressum" />;
}
