import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CSP con nonce por petición.
 *
 * En Next 16 este archivo se llama `proxy.ts` (antes `middleware.ts`) y lo
 * invoca el framework por convención: NO lo importa nadie. Por eso una revisión
 * de "código muerto" lo marca como basura — de hecho se borró así en el commit
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
    // OJO: un <img> apuntando DIRECTAMENTE a supabase.co se bloquea (verificado).
    // Si algún día hace falta, hay que añadir aquí el host del bucket —
    // pero lo correcto es seguir usando next/image.
    "img-src 'self' data: blob:",
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
