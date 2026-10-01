"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LogoLink({
  width,
  height,
  className,
  linkClassName,
  priority,
}: {
  width: number;
  height: number;
  className?: string;
  linkClassName?: string;
  priority?: boolean;
}) {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      aria-label="Zur Startseite"
      className={linkClassName}
      onClick={() => {
        if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <Image
        src="/logo.svg"
        alt="Mein Beamtenportal"
        width={width}
        height={height}
        priority={priority}
        className={className}
      />
    </Link>
  );
}
