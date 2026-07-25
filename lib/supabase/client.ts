import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertDatzonProject } from "./project";

/**
 * Cliente Supabase de la APLICACIÓN en runtime. Usa la clave publishable,
 * sujeta a RLS — la credencial secreta vive solo en scripts/ (CLAUDE.md).
 * Las tablas del proyecto están en el schema `landing`, no en `public`.
 *
 * La clave NO lleva prefijo NEXT_PUBLIC_ a propósito: solo se usa en el
 * servidor (Route Handlers) y no debe empaquetarse hacia el navegador.
 */
let client: SupabaseClient<any, any, any, any, any> | null = null;

export function getSupabaseClient(): SupabaseClient<any, any, any, any, any> {
  if (client) return client;

  const url = assertDatzonProject(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY no está definida. Copia .env.example a .env.local y complétala."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: "landing" },
  });
  return client;
}

/** Solo para tests: descarta el singleton para poder variar el entorno. */
export function _resetSupabaseClient(): void {
  client = null;
}
