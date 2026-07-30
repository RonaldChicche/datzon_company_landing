import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// CSP is handled dynamically by middleware.ts (nonce-based, per request).
// These static headers apply to all routes and don't change per request.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Permite acceder al dev server desde otros equipos de la red local
  // (ej. probar en el celular). Solo aplica en `next dev`, no en producción.
  allowedDevOrigins: ["192.168.18.137"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Next 16 exige declarar aquí toda calidad que se use en un <Image quality={...}>.
    // 90 es para los retratos del equipo: a 75 la recompresión era visible
    // (medido: RMSE 2.54 a q75 frente a 1.60 a q90).
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "adnvzdcqcneqjemxneht.supabase.co",
        // Acotado al bucket público: sin pathname, cualquier objeto del
        // proyecto Supabase sería proxeable a través de /_next/image.
        pathname: "/storage/v1/object/public/landing/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
