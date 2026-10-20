import { NextResponse } from "next/server";
import { WHATSAPP_TARGET_URL } from "@/lib/whatsapp-target";

/**
 * Redirige al chat de WhatsApp. Existe para que el número no figure en el HTML.
 *
 * Los buscadores y los crawlers de IA no necesitan seguir este enlace: robots.ts
 * lo excluye y la respuesta lleva `noindex`, así que no afecta al posicionamiento
 * ni a que te citen. Las personas lo siguen con un clic normal.
 */
export function GET() {
  return NextResponse.redirect(WHATSAPP_TARGET_URL, {
    status: 302,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
