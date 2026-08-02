import { createClient } from "@supabase/supabase-js";
import { assertDatzonProject } from "./project";

/**
 * Cliente Supabase de la APLICACIÓN en runtime. Usa la clave publishable,
 * sujeta a RLS, la credencial secreta vive solo en scripts/ (CLAUDE.md).
 * Las tablas del proyecto están en el schema `landing`, no en `public`.
 *
 * La clave NO lleva prefijo NEXT_PUBLIC_ a propósito: solo se usa en el
 * servidor (Route Handlers) y no debe empaquetarse hacia el navegador.
 */

/**
 * Constructor auxiliar que crea el cliente Supabase con schema `landing`.
 * La inferencia de tipos de TypeScript captura el schema específico.
 */
function buildSupabaseClient(url: string, key: string) {
  return createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: "landing" },
  });
}

/**
 * Tipo inducido del cliente, preservando el schema literal "landing"
 * sin necesidad de especificar genéricos explícitamente.
 */
type DatzonSupabaseClient = ReturnType<typeof buildSupabaseClient>;

let client: DatzonSupabaseClient | null = null;

export function getSupabaseClient(): DatzonSupabaseClient {
  if (client) return client;

  const url = assertDatzonProject(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY no está definida. Copia .env.example a .env.local y complétala."
    );
  }

  client = buildSupabaseClient(url, key);
  return client;
}

/** Solo para tests: descarta el singleton para poder variar el entorno. */
export function _resetSupabaseClient(): void {
  client = null;
}
