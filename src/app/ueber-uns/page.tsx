import type { Metadata } from "next";
import { StaticPageView } from "@/components/StaticPageView";

export const metadata: Metadata = { title: "Über uns", alternates: { canonical: "/ueber-uns" } };

export default function UeberUnsPage() {
  return <StaticPageView slug="ueber-uns" />;
}
