/**
 * Destino real del botón de WhatsApp. Solo lo importa `app/whatsapp/route.ts`.
 *
 * El número NO debe aparecer en el HTML ni en el JS del cliente: los bots que
 * recolectan contactos leen los href `wa.me/...` de la página. Los componentes
 * enlazan a `WHATSAPP_HREF` (ruta interna) y el redirect ocurre en el servidor.
 * Número confirmado 2026-07-26.
 */
export const WHATSAPP_TARGET_URL =
  "https://wa.me/51956956778?text=" +
  encodeURIComponent("Hola, quiero cotizar un proyecto con Datzon.");
