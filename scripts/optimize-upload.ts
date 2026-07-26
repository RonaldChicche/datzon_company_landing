/**
 * Optimiza imágenes y las sube al bucket "landing" en Supabase Storage.
 *
 * Modos de uso:
 *   pnpm optimize-images
 *     → Si hay subcarpetas en scripts/images-to-upload/, procesa cada una
 *       como project/<slug-del-nombre-de-carpeta>/
 *     → Si solo hay imágenes sueltas (sin subcarpetas), el destino es
 *       ambiguo: el script falla y pide usar uno de los modos explícitos.
 *
 *   pnpm optimize-images <nombre>
 *     → Sube las imágenes sueltas de scripts/images-to-upload/ a landing/project/<nombre>/
 *
 *   pnpm optimize-images site
 *     → Sube el contenido de scripts/images-to-upload/ a landing/site/,
 *       respetando un nivel de subcarpetas (site/<subcarpeta>/).
 *
 * Flag --dry-run (funciona con los tres modos anteriores):
 *   → Simula la subida: imprime qué se subiría y a dónde, sin llamar a
 *     Supabase Storage.
 *
 * Requisito en .env.local:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (Settings → API → service_role secret)
 *
 * Formatos soportados: jpg · jpeg · png · webp · avif · tiff · bmp
 *   (se recomprimen a webp). Los .svg se suben tal cual, sin pasar por sharp.
 */

import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { readdir, stat, writeFile, unlink, readFile } from "fs/promises";
import { execSync } from "child_process";
import { tmpdir } from "os";
import path from "path";
import { assertDatzonProject } from "@/lib/supabase/project";

// ── Config ────────────────────────────────────────────────────────────────────
const BUCKET = "landing";
const INPUT_DIR = path.resolve(process.cwd(), "scripts/images-to-upload");
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;
const SUPPORTED_EXTS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".bmp",
]);

// Se lee a nivel de módulo (no solo dentro de main()) porque uploadImages,
// que está definida fuera de main(), también necesita saber si debe
// simular la subida en lugar de escribir en Supabase Storage.
const DRY_RUN = process.argv.includes("--dry-run");

// ── Cargar .env.local (Node 20.12+ nativo) ────────────────────────────────────
try {
  process.loadEnvFile(".env.local");
} catch { /* vars pueden venir del shell */ }

// ── Validar vars de entorno ───────────────────────────────────────────────────
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "\n❌  Faltan variables en .env.local:\n\n" +
    "    SUPABASE_URL=https://adnvzdcqcneqjemxneht.supabase.co\n" +
    "    SUPABASE_SERVICE_ROLE_KEY=<Settings → API → service_role secret>\n"
  );
  process.exit(1);
}

// ── Restricción de proyecto único ─────────────────────────────────────────────
// Este script usa la service_role key, que bypasea RLS. Fallar acá evita
// escribir en un proyecto que no es el de Datzon.
try {
  assertDatzonProject(SUPABASE_URL);
} catch (err) {
  console.error(`\n❌  ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convierte un nombre de carpeta a slug: minúsculas, espacios y puntuación → guiones */
function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")  // cualquier carácter no-alfanumérico → guión
    .replace(/^-+|-+$/g, "");      // quitar guiones al inicio/fin
}

function isImage(filename: string): boolean {
  return SUPPORTED_EXTS.has(path.extname(filename).toLowerCase());
}

/** Los .svg no pasan por sharp: se suben tal cual (passthrough). */
function isSvg(filename: string): boolean {
  return path.extname(filename).toLowerCase() === ".svg";
}

async function optimizeToWebp(
  filePath: string
): Promise<{ buffer: Buffer; originalKB: number; optimizedKB: number }> {
  let workPath = filePath;
  let tmpFile: string | null = null;

  try {
    const image = sharp(filePath, { failOn: "none" });
    const { width = MAX_WIDTH, size: originalSize = 0 } = await image.metadata();
    const buffer = await image
      .resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    return {
      buffer,
      originalKB: Math.round(originalSize / 1024),
      optimizedKB: Math.round(buffer.length / 1024),
    };
  } catch {
    // Fallback: re-encodear con sips (macOS nativo) para sanear JPEGs inválidos
    tmpFile = path.join(tmpdir(), `datzon_fix_${Date.now()}.jpg`);
    execSync(`sips -s format jpeg "${filePath}" --out "${tmpFile}"`, { stdio: "pipe" });
    workPath = tmpFile;

    const image = sharp(workPath, { failOn: "none" });
    const { width = MAX_WIDTH } = await image.metadata();
    const buffer = await image
      .resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    return {
      buffer,
      originalKB: 0,
      optimizedKB: Math.round(buffer.length / 1024),
    };
  } finally {
    if (tmpFile) unlink(tmpFile).catch(() => {});
  }
}

async function uploadImages(sourceDir: string, storagePath: string): Promise<{ ok: number; fail: number }> {
  const entries = await readdir(sourceDir);
  const imageFiles = entries.filter((f) => isImage(f) || isSvg(f));

  if (imageFiles.length === 0) {
    console.log(`  ⚠️  Sin imágenes en ${sourceDir}`);
    return { ok: 0, fail: 0 };
  }

  let ok = 0, fail = 0;

  for (const file of imageFiles) {
    const filePath = path.join(sourceDir, file);
    const svg = isSvg(file);
    const destName = svg
      ? file
      : `${path.basename(file, path.extname(file))}.webp`;
    const destPath = `${storagePath}/${destName}`;

    // --dry-run: se imprime la línea completa y se sale ANTES de tocar
    // Supabase Storage. Ninguna llamada de red de subida ocurre aquí.
    if (DRY_RUN) {
      const kb = Math.round((await stat(filePath)).size / 1024);
      console.log(`    [dry-run] ${file.padEnd(45)} → ${BUCKET}/${destPath}  (~${kb}KB${svg ? ", svg tal cual" : " origen, se recomprime a webp"})`);
      ok++;
      continue;
    }

    // Passthrough: el .svg se sube tal cual, sin pasar por sharp/webp.
    if (svg) {
      const buffer = await readFile(filePath);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(destPath, buffer, { contentType: "image/svg+xml", upsert: true });
      if (error) { console.log(`✗  ${error.message}`); fail++; continue; }
      console.log(`✓  svg tal cual (${Math.round(buffer.length / 1024)}KB)`);
      ok++;
      continue;
    }

    process.stdout.write(`    ${file.padEnd(45)} `);

    try {
      const { buffer, originalKB, optimizedKB } = await optimizeToWebp(filePath);
      const saving = originalKB > 0 ? Math.round((1 - optimizedKB / originalKB) * 100) : 0;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(destPath, buffer, { contentType: "image/webp", upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
      console.log(`✓  ${originalKB}KB → ${optimizedKB}KB (-${saving}%)`);
      ok++;
    } catch (err) {
      console.log(`✗  ${err instanceof Error ? err.message : String(err)}`);
      fail++;
    }
  }

  return { ok, fail };
}

/** Sube el contenido del staging a site/, respetando un nivel de subcarpetas. */
async function uploadSite(): Promise<void> {
  const entries = await readdir(INPUT_DIR);
  let totalOk = 0, totalFail = 0;

  // Archivos sueltos del staging → site/
  const { ok, fail } = await uploadImages(INPUT_DIR, "site");
  totalOk += ok; totalFail += fail;

  // Subcarpetas (un nivel) → site/<subcarpeta>/
  for (const entry of entries) {
    if (entry === ".gitkeep") continue;
    const fullPath = path.join(INPUT_DIR, entry);
    if ((await stat(fullPath)).isDirectory()) {
      console.log(`  📂  "${entry}"  →  ${BUCKET}/site/${entry}/`);
      const r = await uploadImages(fullPath, `site/${entry}`);
      totalOk += r.ok; totalFail += r.fail;
    }
  }

  console.log(`\n${"─".repeat(60)}\n✅  ${totalOk} subida(s)  |  ❌  ${totalFail} falla(s)${DRY_RUN ? "  (dry-run: nada se subió)" : ""}\n`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // DRY_RUN se lee a nivel de módulo (arriba) porque uploadImages, que
  // vive fuera de main(), también lo necesita. Acá solo se filtra el
  // flag para encontrar el modo (site | <nombre>).
  const args = process.argv.slice(2);
  const modeArg = args.find((a) => !a.startsWith("--"));

  // Modo site: pnpm optimize-images site
  if (modeArg === "site") {
    console.log(`\n🔧  Staging → ${BUCKET}/site/${DRY_RUN ? "  (dry-run)" : ""}\n`);
    await uploadSite();
    return;
  }

  // Modo explícito: pnpm optimize-images <nombre>
  if (modeArg) {
    console.log(`\n🔧  Subiendo imágenes sueltas → project/${modeArg}/\n`);
    const { ok, fail } = await uploadImages(INPUT_DIR, `project/${modeArg}`);
    console.log(`\n${"─".repeat(60)}\n✅  ${ok} subida(s)  |  ❌  ${fail} falla(s)\n`);
    return;
  }

  // Modo auto: detectar subcarpetas
  let entries: string[];
  try {
    entries = await readdir(INPUT_DIR);
  } catch {
    console.error(`\n❌  No se encontró: ${INPUT_DIR}\n`);
    process.exit(1);
  }

  // Separar subcarpetas de imágenes sueltas
  const subdirs: string[] = [];
  const looseImages: string[] = [];

  for (const entry of entries) {
    if (entry === ".gitkeep") continue;
    const fullPath = path.join(INPUT_DIR, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) {
      subdirs.push(entry);
    } else if (isImage(entry) || isSvg(entry)) {
      looseImages.push(entry);
    }
  }

  // Con subcarpetas: procesar cada una como proyecto
  if (subdirs.length > 0) {
    console.log(`\n📁  ${subdirs.length} proyecto(s) detectado(s)\n`);
    let totalOk = 0, totalFail = 0;

    for (const dir of subdirs) {
      const slug = toSlug(dir);
      const sourceDir = path.join(INPUT_DIR, dir);
      const storagePath = `project/${slug}`;
      console.log(`  📂  "${dir}"  →  ${BUCKET}/${storagePath}/`);
      const { ok, fail } = await uploadImages(sourceDir, storagePath);
      totalOk += ok;
      totalFail += fail;
      console.log(`      → ${ok} OK, ${fail} fallos\n`);
    }

    console.log(`${"─".repeat(60)}`);
    console.log(`✅  Total: ${totalOk} subida(s)  |  ❌  ${totalFail} falla(s)\n`);
    return;
  }

  // Imágenes sueltas sin modo: destino ambiguo. raw/ se eliminó (CLAUDE.md).
  if (looseImages.length > 0) {
    console.error(
      `\n❌  Hay ${looseImages.length} imagen(es) suelta(s) en el staging y ningún destino.\n` +
      `    Usa:  pnpm optimize-images <proyecto>   → project/<proyecto>/\n` +
      `          pnpm optimize-images site         → site/ (respeta subcarpetas)\n` +
      `    Añade --dry-run para previsualizar sin subir.\n`
    );
    process.exit(1);
  }
  console.log(`\nℹ️   Sin imágenes en scripts/images-to-upload/\n`);
}

main().catch((err) => {
  console.error("\n❌ Error inesperado:", err);
  process.exit(1);
});
