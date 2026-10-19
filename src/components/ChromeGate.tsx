"use client";

import { usePathname } from "next/navigation";
import { isLandingPath } from "@/lib/landing";

// Blendet den globalen Header bzw. Footer auf Werbe-Landingpages aus.
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isLandingPath(pathname)) return null;
  return <>{children}</>;
}
