/**
 * Sube tal cual (sin recodificar) los archivos de una carpeta local al bucket
 * "landing", bajo site/<prefijo>/. Pensado para medios ya optimizados fuera
 * del repo, como el vídeo del hero.
 *
 * Uso:
 *   npx tsx scripts/upload-site-files.ts <carpeta-local> <prefijo-bajo-site>
 *   npx tsx scripts/upload-site-files.ts ~/…/05_finales/video/hero hero/v8
 *
 * Solo sube vídeo (.mp4, .webm) e imagen (.webp, .jpg, .png); ignora el resto
 * (HANDOFF.md, manifest.json…). NO sobrescribe: si el objeto ya existe, falla.
 * Para publicar una versión nueva, usa un prefijo nuevo (hero/v9), así la
 * caché larga de los navegadores nunca sirve un archivo viejo.
 *
 * Requisito en .env.local (mismas vars que scripts/optimize-upload.ts):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (Settings -> API -> service_role secret)
 *
 * Credencial secreta SOLO aquí (convención de scripts/, ver CLAUDE.md).
 */

import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { assertDatzonProject } from "@/lib/supabase/project";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* vars pueden venir del shell */
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "\nFaltan variables en .env.local:\n\n" +
      "    SUPABASE_URL=https://adnvzdcqcneqjemxneht.supabase.co\n" +
      "    SUPABASE_SERVICE_ROLE_KEY=<Settings -> API -> service_role secret>\n"
  );
  process.exit(1);
}

// La service_role key bypasea RLS: fallar acá evita escribir en otro proyecto.
try {
  assertDatzonProject(SUPABASE_URL);
} catch (err) {
  console.error(`\n${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}

const [carpeta, prefijo] = process.argv.slice(2);
if (!carpeta || !prefijo) {
  console.error("\nUso: npx tsx scripts/upload-site-files.ts <carpeta-local> <prefijo-bajo-site>\n");
  process.exit(1);
}
// El prefijo va DENTRO de site/ (ver la tabla de Storage en CLAUDE.md).
if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(prefijo)) {
  console.error(
    `\nPrefijo inválido: "${prefijo}". Usa kebab-case separado por "/", sin "site/" ni "landing/" delante (ej. hero/v8).\n`
  );
  process.exit(1);
}

const TIPOS: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main(): Promise<void> {
  const archivos = readdirSync(carpeta).filter(
    (f) => TIPOS[extname(f).toLowerCase()] && statSync(join(carpeta, f)).isFile()
  );
  if (archivos.length === 0) throw new Error(`No hay medios que subir en ${carpeta}`);

  for (const f of archivos) {
    const remoto = `site/${prefijo}/${f}`;
    const { error } = await supabase.storage.from("landing").upload(remoto, readFileSync(join(carpeta, f)), {
      contentType: TIPOS[extname(f).toLowerCase()],
      // Un año: la ruta lleva la versión, así que el archivo nunca cambia.
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw new Error(`${remoto}: ${error.message}`);
    console.log(`ok  ${remoto}  ${(statSync(join(carpeta, f)).size / 1e6).toFixed(1)} MB`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
