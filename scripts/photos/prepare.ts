// scripts/photos/prepare.ts
// Convierte un manifiesto JSON en JPEG maestros con recorte y gradación común,
// listos para que `pnpm optimize-images` los pase a webp y los suba.
//
// Uso:
//   npx tsx scripts/photos/prepare.ts <manifiesto.json> --root <dir> [--out <dir>] [--sheets <dir>]
//
//   --root    carpeta contra la que se resuelven los `src` del manifiesto (obligatorio)
//   --out     destino de los JPEG; por defecto scripts/images-to-upload
//   --sheets  destino de la hoja de contactos; por defecto .superpowers/hojas.
//             Va fuera de --out a propósito: el script de subida publica toda
//             imagen suelta que encuentre en scripts/images-to-upload.
//
// ffmpeg, ffprobe y magick se lanzan con execFileSync y argumentos en array,
// nunca con una cadena de shell: las rutas de las fuentes llevan espacios.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { z } from "zod";
import { cropBox, inscribedSize } from "./geometry";
import { GRADE, wbGains } from "./grade";
import { hlgToSdr } from "./hlg";
import { resolveInside } from "../lib/staging";

// ── Manifiesto ────────────────────────────────────────────────────────────────

const EntrySchema = z
  .strictObject({
    // Nombre sin extensión; el .webp subido se llamará <out>.webp.
    out: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "solo minúsculas, dígitos y guiones"),
    // Relativo a --root.
    src: z.string().min(1),
    // Segundos, si src es vídeo.
    frameAt: z.number().nonnegative().optional(),
    // MOV del iPhone (transferencia arib-std-b67).
    hlg: z.boolean().optional(),
    // Grados, positivo = horario; recorta al rectángulo inscrito.
    rotate: z.number().gt(-90).lt(90).optional(),
    // auto: 3:2 si ancho >= alto, 1:1 si no.
    format: z.enum(["auto", "16:9"]).optional(),
    // Centro del recorte, 0 a 1 en cada eje.
    focus: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).optional(),
  })
  .refine((e) => !e.hlg || e.frameAt !== undefined, {
    message: "hlg: true solo tiene sentido en un vídeo (falta frameAt)",
  });

const ManifestSchema = z
  .array(EntrySchema)
  .min(1)
  .refine((entries) => new Set(entries.map((e) => e.out)).size === entries.length, {
    message: "hay valores de `out` repetidos",
  });

type Entry = z.infer<typeof EntrySchema>;

// ── Constantes de salida ──────────────────────────────────────────────────────

type Shape = "3:2" | "1:1" | "16:9";

const RATIO: Record<Shape, number> = { "3:2": 3 / 2, "1:1": 1, "16:9": 16 / 9 };
const MAX_SIZE: Record<Shape, { width: number; height: number }> = {
  "3:2": { width: 2400, height: 1600 },
  "1:1": { width: 1600, height: 1600 },
  "16:9": { width: 1920, height: 1080 },
};
const JPEG_QUALITY = 92;
const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v"]);
const MONTAGE_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf";
// Un fotograma 8K en PNG o rawvideo de 16 bits pasa holgado de 1 MB, el
// valor por defecto de execFileSync.
const MAX_BUFFER = 1024 * 1024 * 1024;

/** Imagen RGB de 8 bits, 3 canales, sin cabecera. */
type Raw = { data: Buffer; width: number; height: number };

// ── Argumentos ────────────────────────────────────────────────────────────────

type Args = { manifest: string; root: string; out: string; sheets: string };

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`${arg} necesita un valor`);
      }
      flags[arg.slice(2)] = value;
      i++;
    } else {
      positional.push(arg);
    }
  }
  const unknown = Object.keys(flags).filter((k) => !["root", "out", "sheets"].includes(k));
  if (unknown.length > 0) throw new Error(`opción desconocida: --${unknown.join(", --")}`);
  if (positional.length !== 1 || !flags.root) {
    throw new Error(
      "uso: npx tsx scripts/photos/prepare.ts <manifiesto.json> --root <dir> [--out <dir>] [--sheets <dir>]",
    );
  }
  return {
    manifest: path.resolve(positional[0]),
    root: path.resolve(flags.root),
    out: path.resolve(flags.out ?? "scripts/images-to-upload"),
    sheets: path.resolve(flags.sheets ?? ".superpowers/hojas"),
  };
}

// ── Vídeo ─────────────────────────────────────────────────────────────────────

type VideoProbe = {
  width: number;
  height: number;
  transfer: string;
  primaries: string;
  matrix: string;
  rotation: number;
};

const ProbeSchema = z.object({
  streams: z
    .array(
      z.object({
        width: z.number(),
        height: z.number(),
        color_transfer: z.string().optional(),
        color_primaries: z.string().optional(),
        color_space: z.string().optional(),
        side_data_list: z.array(z.object({ rotation: z.number().optional() })).optional(),
      }),
    )
    .min(1),
});

function probeVideo(src: string): VideoProbe {
  const json = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_streams", "-of", "json", src],
    { maxBuffer: MAX_BUFFER },
  ).toString("utf8");
  const stream = ProbeSchema.parse(JSON.parse(json)).streams[0];
  const rotation = stream.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? 0;
  return {
    width: stream.width,
    height: stream.height,
    transfer: stream.color_transfer ?? "unknown",
    primaries: stream.color_primaries ?? "unknown",
    matrix: stream.color_space ?? "unknown",
    rotation,
  };
}

/** Fotograma SDR: ffmpeg lo entrega en PNG, ya girado según el display matrix. */
async function sdrFrame(src: string, frameAt: number): Promise<Raw> {
  const png = execFileSync(
    "ffmpeg",
    ["-v", "error", "-ss", String(frameAt), "-i", src, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
    { maxBuffer: MAX_BUFFER },
  );
  return toRaw(sharp(png));
}

/**
 * Fotograma HLG: ffmpeg pasa de YUV BT.2020 limitado a RGB de 16 bits en rango
 * completo (sin tocar la transferencia), y cada píxel se lleva a sRGB con hlgToSdr.
 */
function hlgFrame(src: string, frameAt: number, probe: VideoProbe): Raw {
  if (probe.transfer !== "arib-std-b67" || probe.primaries !== "bt2020" || !probe.matrix.startsWith("bt2020")) {
    throw new Error(
      `marcado como hlg pero ffprobe ve transfer=${probe.transfer}, primaries=${probe.primaries}, matrix=${probe.matrix}`,
    );
  }
  // ffmpeg aplica el giro del display matrix al decodificar: con 90° o 270°
  // el fotograma sale con ancho y alto intercambiados.
  const swap = Math.abs(Math.round(probe.rotation)) % 180 === 90;
  const width = swap ? probe.height : probe.width;
  const height = swap ? probe.width : probe.height;

  const rgb48 = execFileSync(
    "ffmpeg",
    [
      "-v", "error",
      "-ss", String(frameAt),
      "-i", src,
      "-frames:v", "1",
      "-vf", "scale=in_color_matrix=bt2020:in_range=tv:out_range=full",
      "-pix_fmt", "rgb48le",
      "-f", "rawvideo",
      "-",
    ],
    { maxBuffer: MAX_BUFFER },
  );
  const pixels = width * height;
  if (rgb48.length !== pixels * 6) {
    throw new Error(`fotograma HLG de ${rgb48.length} bytes, se esperaban ${pixels * 6} (${width}×${height})`);
  }

  const out = Buffer.alloc(pixels * 3);
  for (let p = 0; p < pixels; p++) {
    const i = p * 6;
    const [r, g, b] = hlgToSdr(
      rgb48.readUInt16LE(i) / 65535,
      rgb48.readUInt16LE(i + 2) / 65535,
      rgb48.readUInt16LE(i + 4) / 65535,
    );
    out[p * 3] = Math.round(r * 255);
    out[p * 3 + 1] = Math.round(g * 255);
    out[p * 3 + 2] = Math.round(b * 255);
  }
  return { data: out, width, height };
}

// ── Etapas ────────────────────────────────────────────────────────────────────

/** Materializa un pipeline de sharp como RGB de 8 bits. */
async function toRaw(img: Sharp): Promise<Raw> {
  const { data, info } = await img
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 3) throw new Error(`se esperaban 3 canales, llegaron ${info.channels}`);
  return { data, width: info.width, height: info.height };
}

/**
 * Cada etapa arranca un sharp nuevo sobre el resultado de la anterior. sharp
 * ordena internamente sus operaciones con independencia del orden de la
 * cadena; separarlas garantiza el orden que fija el diseño.
 */
function fromRaw(raw: Raw): Sharp {
  return sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 3 } });
}

async function loadPixels(entry: Entry, src: string): Promise<Raw> {
  const isVideo = VIDEO_EXTS.has(path.extname(src).toLowerCase());
  if (isVideo && entry.frameAt === undefined) throw new Error("es un vídeo y falta frameAt");
  if (!isVideo && entry.frameAt !== undefined) throw new Error("frameAt en algo que no es un vídeo");

  if (!isVideo) return toRaw(sharp(src).rotate()); // .rotate() sin argumentos: orientación EXIF

  const frameAt = entry.frameAt as number;
  const probe = probeVideo(src);
  if (entry.hlg) return hlgFrame(src, frameAt, probe);
  if (probe.transfer === "arib-std-b67") {
    throw new Error("el vídeo es HLG (arib-std-b67): marca hlg: true en el manifiesto");
  }
  return sdrFrame(src, frameAt);
}

async function straighten(raw: Raw, deg: number): Promise<Raw> {
  const rotated = await toRaw(fromRaw(raw).rotate(deg, { background: "#000" }));
  const inner = inscribedSize(raw.width, raw.height, deg);
  return toRaw(
    fromRaw(rotated).extract({
      left: Math.round((rotated.width - inner.width) / 2),
      top: Math.round((rotated.height - inner.height) / 2),
      width: inner.width,
      height: inner.height,
    }),
  );
}

function shapeOf(entry: Entry, raw: Raw): Shape {
  if (entry.format === "16:9") return "16:9";
  // Solo las fotos más anchas que altas van a 3:2; cuadradas y verticales, a 1:1.
  return raw.width > raw.height ? "3:2" : "1:1";
}

async function grade(raw: Raw): Promise<Raw> {
  const stats = await fromRaw(raw).stats();
  const [r, g, b] = stats.channels;
  let gains = wbGains({ r: r.mean, g: g.mean, b: b.mean });
  // wbGains divide por la media de cada canal: con un canal en negro da NaN o Infinity.
  if (!gains.every(Number.isFinite)) gains = [1, 1, 1];

  let img = await toRaw(
    fromRaw(raw).recomb([
      [gains[0], 0, 0],
      [0, gains[1], 0],
      [0, 0, gains[2]],
    ]),
  );
  img = await toRaw(fromRaw(img).normalise({ lower: GRADE.normaliseLower, upper: GRADE.normaliseUpper }));
  img = await toRaw(fromRaw(img).linear(GRADE.contrast, 128 * (1 - GRADE.contrast)));
  return toRaw(fromRaw(img).modulate({ saturation: GRADE.saturation }));
}

async function prepare(entry: Entry, args: Args): Promise<string> {
  // resolveInside: un src con "../" o absoluto ya no puede traer al staging
  // de subida archivos de fuera de --root (auditoría run-2).
  const src = resolveInside(args.root, entry.src);
  if (!existsSync(src)) throw new Error(`no existe la fuente ${entry.src}`);

  let raw = await loadPixels(entry, src);
  if (entry.rotate) raw = await straighten(raw, entry.rotate);

  const shape = shapeOf(entry, raw);
  const box = cropBox(raw.width, raw.height, RATIO[shape], entry.focus ?? [0.5, 0.5]);
  raw = await toRaw(fromRaw(raw).extract(box));

  raw = await grade(raw);

  const dest = path.join(args.out, `${entry.out}.jpg`);
  const max = MAX_SIZE[shape];
  const info = await fromRaw(raw)
    .resize(max.width, max.height, { fit: "inside", withoutEnlargement: true })
    .withIccProfile("srgb")
    .jpeg({ quality: JPEG_QUALITY, chromaSubsampling: "4:4:4" })
    .toFile(dest);
  console.log(`  ${entry.out}.jpg  ${shape}  ${info.width}×${info.height}`);
  return dest;
}

function contactSheet(files: string[], dest: string): void {
  execFileSync(
    "magick",
    ["montage", "-font", MONTAGE_FONT, "-label", "%t", ...files, "-geometry", "480x480+8+8", dest],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const entries = ManifestSchema.parse(JSON.parse(readFileSync(args.manifest, "utf8")));
  mkdirSync(args.out, { recursive: true });
  mkdirSync(args.sheets, { recursive: true });

  console.log(`${entries.length} fotos → ${path.relative(process.cwd(), args.out) || "."}`);
  const written: string[] = [];
  for (const entry of entries) {
    try {
      written.push(await prepare(entry, args));
    } catch (err) {
      throw new Error(`${entry.out}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const sheet = path.join(args.sheets, `${path.basename(args.manifest, path.extname(args.manifest))}.jpg`);
  contactSheet(written, sheet);
  console.log(`hoja de contactos: ${path.relative(process.cwd(), sheet)}`);
}

main().catch((err: unknown) => {
  console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
