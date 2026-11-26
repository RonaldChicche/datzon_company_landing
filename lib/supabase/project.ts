/**
 * Este repositorio solo puede hablar con el proyecto Supabase de Datzon.
 *
 * El ref no es un secreto: ya aparece en lib/projects.ts (URL pública del
 * bucket) y en next.config.ts (remotePatterns). Lo que aporta este módulo es
 * un punto único donde se valida, para que una credencial de otro proyecto
 * falle al arranque en lugar de escribir en la base equivocada.
 */
export const EXPECTED_PROJECT_REF = "adnvzdcqcneqjemxneht";

export function assertDatzonProject(rawUrl: string | undefined): string {
  if (!rawUrl) {
    throw new Error(
      "SUPABASE_URL no está definida. Copia .env.example a .env.local y complétala."
    );
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`SUPABASE_URL no es una URL válida: ${rawUrl}`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`SUPABASE_URL debe usar https: ${rawUrl}`);
  }

  // Host exacto, no solo el primer subdominio: antes
  // "https://<ref>.dominio-ajeno.com" pasaba el control.
  const expectedHost = `${EXPECTED_PROJECT_REF}.supabase.co`;
  if (url.hostname !== expectedHost) {
    throw new Error(
      `Proyecto Supabase incorrecto: se esperaba "${expectedHost}" y se recibió "${url.hostname}". ` +
        "Este repositorio solo puede conectarse al proyecto Datzon."
    );
  }

  return rawUrl;
}
