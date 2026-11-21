import { siteAssetUrl } from "@/lib/site-assets";

/**
 * Medios del hero del home: montaje de soldadura robotizada (metraje real),
 * 13,9 s en bucle, sin audio. Lo produce el proyecto datzon_company_brochure
 * (05_finales/video/hero/, ver su HANDOFF.md) y se sube con
 * scripts/upload-site-files.ts.
 *
 * Para publicar una versión nueva: súbela a site/hero/v9/ y cambia HERO_VERSION.
 * Nunca se sobrescribe una versión: los archivos tienen caché de un año.
 */
const HERO_VERSION = "v8";

export type HeroOrientation = "landscape" | "portrait";

const NAME: Record<HeroOrientation, string> = {
  landscape: "hero-16x9",
  portrait: "hero-9x16",
};

const url = (file: string) => siteAssetUrl(`hero/${HERO_VERSION}/${file}`);

/** Póster de cada versión: primer fotograma del vídeo y elemento LCP del home. */
export const HERO_POSTERS: Record<HeroOrientation, { src: string; width: number; height: number }> = {
  landscape: { src: url("hero-16x9-poster.webp"), width: 1920, height: 1080 },
  portrait: { src: url("hero-9x16-poster.webp"), width: 1080, height: 1920 },
};

/** Fuentes del vídeo en orden de preferencia: WebM (VP9, más ligero) y MP4 (H.264) de respaldo. */
export function heroVideoSources(orientation: HeroOrientation): { src: string; type: string }[] {
  const n = NAME[orientation];
  return [
    { src: url(`${n}.webm`), type: "video/webm" },
    { src: url(`${n}.mp4`), type: "video/mp4" },
  ];
}
