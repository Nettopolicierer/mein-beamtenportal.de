import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Logo ist ein lokales SVG; Next optimiert SVGs standardmäßig nicht.
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
