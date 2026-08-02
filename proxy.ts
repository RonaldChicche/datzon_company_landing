import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_PUBLIC_BASE } from "@/lib/site-assets";

/**
 * CSP con nonce por petición.
 *
 * En Next 16 este archivo se llama `proxy.ts` (antes `middleware.ts`) y lo
 * invoca el framework por convención: NO lo importa nadie. Por eso una revisión
 * de "código muerto" lo marca como basura, de hecho se borró así en el commit
 * 81e0ae9 y el sitio se quedó siete semanas sin CSP. Si lo ves sin referencias,
 * no lo borres: es intencional.
 *
 * El nonce viaja a la petición como cabecera `x-nonce`; `app/layout.tsx` lo lee
 * con `headers()` y se lo aplica al script del JSON-LD. Next pone el mismo
 * nonce en sus propios scripts de arranque.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    // 'strict-dynamic': un script de confianza puede cargar otros, que heredan
    // la confianza. Es lo que permite a Next cargar sus fragmentos de JS.
    // 'unsafe-eval' solo en desarrollo: lo exige la recarga en caliente.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
    // 'unsafe-inline' es obligatorio aquí: los nonces NO aplican a atributos
    // style=, y tanto React (style={{...}}) como Framer Motion animan con
    // estilos en línea. Sin esto el sitio se queda sin maquetación.
    "style-src 'self' 'unsafe-inline'",
    // next/font autoaloja las fuentes en nuestro propio origen.
    "font-src 'self'",
    // Las imágenes del bucket llegan proxeadas por /_next/image, que es 'self'.
    // data: y blob: los usa next/image para los placeholders.
    // Excepción: el <video poster> de la sala de control (DemoPlayer) no puede
    // pasar por next/image (no es un <img>), así que el poster referencia el
    // bucket directo. Se permite solo esa ruta del bucket público, no todo
    // supabase.co, igual que acota next.config.ts en `images.remotePatterns`.
    `img-src 'self' data: blob: ${STORAGE_PUBLIC_BASE}/`,
    // Los <video src> de las demos apuntan al mismo bucket público y no tienen
    // equivalente a next/image para vídeo, así que se acotan aquí igual que el
    // poster de arriba (mismo host + prefijo de ruta, nada más amplio).
    `media-src 'self' ${STORAGE_PUBLIC_BASE}/`,
    "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
