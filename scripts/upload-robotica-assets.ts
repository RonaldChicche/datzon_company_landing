/**
 * Sube los assets de /robotica al bucket "landing" en Supabase Storage,
 * bajo site/robotica/.
 *
 * Uso: pnpm tsx scripts/upload-robotica-assets.ts
 *
 * Staging esperado en /tmp/robotica-assets/:
 *   paletizado.mp4, soldadura.mp4, servicio.mp4
 *   paletizado-poster.jpg, soldadura-poster.jpg, servicio-poster.jpg
 *   apps/{paletizado,soldadura,pick-place,pintura,manipulacion,inspeccion,
 *         mecanizado,corte,pulido,dosificacion}.jpg
 *
 * Requisito en .env.local (mismas vars que scripts/optimize-upload.ts):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (Settings -> API -> service_role secret)
 *
 * Credencial secreta SOLO aquí (convención de scripts/, ver CLAUDE.md).
 */

import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { assertDatzonProject } from "../lib/supabase/project";

// ── Cargar .env.local (Node 20.12+ nativo, mismo patrón que optimize-upload.ts) ──
try {
  process.loadEnvFile(".env.local");
} catch {
  /* vars pueden venir del shell */
}

// ── Validar vars de entorno ───────────────────────────────────────────────────
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "\nFaltan variables en .env.local:\n\n" +
      "    SUPABASE_URL=https://adnvzdcqcneqjemxneht.supabase.co\n" +
      "    SUPABASE_SERVICE_ROLE_KEY=<Settings -> API -> service_role secret>\n"
  );
  process.exit(1);
}

// ── Restricción de proyecto único ─────────────────────────────────────────────
// Este script usa la service_role key, que bypasea RLS. Fallar acá evita
// escribir en un proyecto que no es el de Datzon.
try {
  assertDatzonProject(SUPABASE_URL);
} catch (err) {
  console.error(`\n${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET = "landing";
const STAGING = "/tmp/robotica-assets";

const contentType = (f: string) =>
  f.endsWith(".mp4")
    ? "video/mp4"
    : f.endsWith(".jpg")
    ? "image/jpeg"
    : "application/octet-stream";

async function subir(local: string, remoto: string): Promise<void> {
  const bytes = readFileSync(local);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(remoto, bytes, { contentType: contentType(local), upsert: true });
  if (error) throw new Error(`${remoto}: ${error.message}`);
  console.log(`ok  ${remoto}  ${(statSync(local).size / 1e6).toFixed(1)} MB`);
}

async function main(): Promise<void> {
  for (const f of readdirSync(STAGING)) {
    if (f === "apps") continue;
    if (!statSync(join(STAGING, f)).isFile()) continue;
    await subir(join(STAGING, f), `site/robotica/${f}`);
  }
  for (const f of readdirSync(join(STAGING, "apps"))) {
    await subir(join(STAGING, "apps", f), `site/robotica/apps/${f}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
