import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildCsp } from "@/lib/csp";

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

  const csp = buildCsp(nonce, isDev);

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
