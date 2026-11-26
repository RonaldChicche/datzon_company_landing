import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// El CSP se genera por petición en `proxy.ts` (nonce dinámico). En Next 16 ese
// archivo se llamaba antes `middleware.ts`; el nombre viejo estuvo aquí siete
// semanas mientras el archivo real no existía.
// Estas cabeceras son estáticas: iguales en todas las rutas y peticiones.
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
    // Sin SVG en el optimizador: el logo (único SVG) se sirve con
    // `unoptimized` en Header y Footer. Las cabeceras de abajo quedan como
    // defensa por si algún día se reactiva.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Tope de lo que el optimizador descarga del origen. Por convención las
    // imágenes pesan < 2 MB; el default de Next (50 MB) permitía bajar vídeos
    // enteros del bucket antes de rechazarlos (auditoría run-2).
    maximumResponseBody: 5 * 1024 * 1024,
    // Next 16 exige declarar aquí toda calidad que se use en un <Image quality={...}>.
    // 90 es para los retratos del equipo: a 75 la recompresión era visible
    // (medido: RMSE 2.54 a q75 frente a 1.60 a q90).
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "adnvzdcqcneqjemxneht.supabase.co",
        // Acotado al bucket público y solo a extensiones de imagen: sin
        // esto, /_next/image también aceptaba los vídeos del bucket.
        pathname: "/storage/v1/object/public/landing/**/*.{webp,jpg,jpeg,png}",
        // Sin query: cada ?n=... distinto era una entrada de caché nueva y
        // una descarga nueva del origen. Nuestras URLs nunca llevan query.
        search: "",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
