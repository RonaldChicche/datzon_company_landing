/**
 * Optimiza imágenes y las sube al bucket "landing" en Supabase Storage.
 *
 * Modos de uso:
 *   pnpm optimize-images
 *     → Si hay subcarpetas en scripts/images-to-upload/, procesa cada una
 *       como project/<slug-del-nombre-de-carpeta>/
 *     → Si solo hay imágenes sueltas, sube a landing/raw/
 *
 *   pnpm optimize-images <nombre>
 *     → Sube las imágenes sueltas de scripts/images-to-upload/ a landing/project/<nombre>/
 *
 * Requisito en .env.local:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (Settings → API → service_role secret)
 *
 * Formatos soportados: jpg · jpeg · png · webp · avif · tiff · bmp
 */

import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { readdir, stat, writeFile, unlink } from "fs/promises";
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
  const imageFiles = entries.filter(isImage);

  if (imageFiles.length === 0) {
    console.log(`  ⚠️  Sin imágenes en ${sourceDir}`);
    return { ok: 0, fail: 0 };
  }

  let ok = 0, fail = 0;

  for (const file of imageFiles) {
    const filePath = path.join(sourceDir, file);
    const destName = `${path.basename(file, path.extname(file))}.webp`;
    const destPath = `${storagePath}/${destName}`;

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

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const projectArg = process.argv[2];

  // Modo explícito: pnpm optimize-images <nombre>
  if (projectArg) {
    console.log(`\n🔧  Subiendo imágenes sueltas → project/${projectArg}/\n`);
    const { ok, fail } = await uploadImages(INPUT_DIR, `project/${projectArg}`);
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
    } else if (isImage(entry)) {
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

  // Sin subcarpetas: imágenes sueltas → raw/
  if (looseImages.length === 0) {
    console.log(`\nℹ️   Sin imágenes en scripts/images-to-upload/\n`);
    return;
  }

  console.log(`\n🔧  ${looseImages.length} imagen(es) suelta(s) → ${BUCKET}/raw/\n`);
  const { ok, fail } = await uploadImages(INPUT_DIR, "raw");
  console.log(`\n${"─".repeat(60)}\n✅  ${ok} subida(s)  |  ❌  ${fail} falla(s)\n`);
}

main().catch((err) => {
  console.error("\n❌ Error inesperado:", err);
  process.exit(1);
});
