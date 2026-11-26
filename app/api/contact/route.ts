import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { contactPayloadSchema, type ContactPayload } from "@/lib/contact-schema";
import { getSupabaseClient } from "@/lib/supabase/client";

// PALIATIVO, no garantía: este Map vive en la instancia serverless y muere
// con ella; en Vercel cada invocación puede caer en una instancia distinta.
// Frena ráfagas dentro de una instancia caliente y nada más. El límite que
// vale de verdad es la regla de Rate Limiting del Vercel Firewall sobre
// POST /api/contact (estado compartido entre instancias), que se configura
// en el dashboard de Vercel, no en este repo.
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_WINDOW_MS = 3_600_000;
const RATE_MAX = 5;
/** Tope de claves en memoria: sin él, muchas IPs distintas hacen crecer el Map sin fin. */
const RATE_MAP_MAX_KEYS = 5_000;

function pruneRateMap(now: number): void {
  for (const [key, entry] of rateMap) {
    if (entry.reset < now) rateMap.delete(key);
  }
  // Si aún sobra, se sueltan las más antiguas (un Map itera en orden de inserción).
  for (const key of rateMap.keys()) {
    if (rateMap.size <= RATE_MAP_MAX_KEYS) break;
    rateMap.delete(key);
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || entry.reset < now) {
    if (rateMap.size >= RATE_MAP_MAX_KEYS) pruneRateMap(now);
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count++;
  return false;
}

/**
 * Una web ajena puede hacer que el navegador de sus visitantes envíe este
 * formulario. Dos barreras lo impiden:
 * 1. Exigir application/json: un POST con ese Content-Type desde otro origen
 *    obliga al navegador a pedir permiso CORS antes (preflight), y esta ruta
 *    no lo concede, así que el envío nunca sale.
 * 2. Si el navegador manda Origin (siempre lo hace en un POST), debe ser
 *    este mismo sitio. Un cliente fuera del navegador puede falsificarlo,
 *    pero ese caso ya lo cubre el rate limit, no esta comprobación.
 */
function isJsonRequest(request: NextRequest): boolean {
  const type = request.headers.get("content-type") ?? "";
  return type.split(";")[0].trim().toLowerCase() === "application/json";
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (origin === null) return true;
  // El host propio puede venir por varias vías según el entorno (Vercel,
  // next dev, tests); cualquiera vale. Un navegador no deja a una web ajena
  // fijar el Host de la petición, así que esto no abre nada.
  const ownHosts = new Set(
    [request.nextUrl.host, request.headers.get("host"), request.headers.get("x-forwarded-host")]
      .filter((h): h is string => Boolean(h))
      .map((h) => h.toLowerCase())
  );
  try {
    return ownHosts.has(new URL(origin).host.toLowerCase());
  } catch {
    return false; // "null" (iframes con sandbox, file://) u otro valor no parseable
  }
}

/** Segunda capa tras el schema: una cabecera de email nunca lleva caracteres de control. */
function headerSafe(value: string): string {
  return value.replace(/\p{Cc}+/gu, " ").trim();
}

/** SHA-256 con sal de la IP; nunca la IP en claro. Sin sal no se guarda nada. */
function hashIp(ip: string): string | null {
  const salt = process.env.LEAD_IP_SALT;
  if (!salt || ip === "unknown") return null;
  return createHash("sha256").update(salt + ip).digest("hex");
}

/**
 * Notifica el lead por email. El lead YA está guardado en la base cuando
 * esto corre: cualquier fallo aquí se registra y no cambia la respuesta.
 * Sin RESEND_API_KEY (cuenta de Resend aún no creada) se omite en silencio.
 */
async function sendNotification(lead: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;
  if (!apiKey || !to) return;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const lines = [
    `Nombre: ${lead.nombre}`,
    lead.empresa ? `Empresa: ${lead.empresa}` : null,
    `Email: ${lead.email}`,
    lead.telefono ? `Teléfono: ${lead.telefono}` : null,
    lead.industria ? `Industria: ${lead.industria}` : null,
    `Origen: ${lead.source === "home" ? "formulario de la home" : "modal de contacto"}`,
    "",
    lead.mensaje,
  ].filter((l): l is string => l !== null);

  await resend.emails.send({
    from: "Datzon Landing <noreply@datzoncompany.com>",
    to,
    replyTo: lead.email,
    subject: headerSafe(`Nuevo lead: ${lead.nombre}${lead.empresa ? `, ${lead.empresa}` : ""}`),
    text: lines.join("\n"),
  });
}

export async function POST(request: NextRequest) {
  // Antes del rate limit: una petición rechazada aquí no gasta el cupo de nadie.
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Formato no soportado." }, { status: 415 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  // En Vercel (primer servidor que recibe la petición) x-forwarded-for lo
  // escribe la plataforma y descarta el valor que mande el cliente, así que
  // la primera entrada es la IP real. Fuera de Vercel no hay esa garantía.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intente más tarde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const result = contactPayloadSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 422 });
  }

  // Honeypot: descarte silencioso. El bot recibe el mismo 200 que un humano
  // para que no pueda distinguir que fue detectado.
  if (result.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { website: _website, ...lead } = result.data;

  const insertFailedResponse = () =>
    NextResponse.json(
      {
        error:
          "No pudimos registrar tu solicitud. Escríbenos directamente a contacto@datzoncompany.com.",
      },
      { status: 500 }
    );

  // getSupabaseClient() puede lanzar (p. ej. falta SUPABASE_URL o
  // SUPABASE_PUBLISHABLE_KEY en el host) y el insert puede fallar sin lanzar
  // (error en el resultado). Ambos casos deben terminar en el mismo 500 JSON
  // diseñado, nunca en un 500 genérico del framework por una excepción sin
  // capturar. Nunca loguear el contenido del lead, solo el mensaje del error.
  try {
    // Insert SIN .select(): devolver la fila exigiría permiso de lectura y
    // rompería el modelo de buzón (anon solo tiene INSERT).
    const { error } = await getSupabaseClient()
      .from("leads")
      .insert({ ...lead, ip_hash: hashIp(ip) });

    if (error) {
      console.error("[contact] insert falló:", error.code, error.message);
      return insertFailedResponse();
    }
  } catch (err) {
    console.error(
      "[contact] cliente de Supabase o insert lanzó una excepción:",
      err instanceof Error ? err.message : String(err)
    );
    return insertFailedResponse();
  }

  try {
    await sendNotification(result.data);
  } catch (err) {
    console.error(
      "[contact] notificación falló (lead ya guardado):",
      err instanceof Error ? err.message : String(err)
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
