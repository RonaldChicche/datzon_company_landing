/**
 * Base pública del bucket "landing". No es un secreto: es de solo lectura y
 * el host está declarado en next.config.ts (remotePatterns).
 * Compartida con lib/projects.ts para no duplicar la constante.
 */
export const STORAGE_PUBLIC_BASE =
  "https://adnvzdcqcneqjemxneht.supabase.co/storage/v1/object/public/landing";

/**
 * URL pública de un asset del sitio (prefijo site/ del bucket).
 * Los medios del hero del home están en lib/hero-media.ts.
 */
// A diferencia de `projectImageUrl`, esta función NO aplica encodeURIComponent:
// acepta subrutas como "equipo/danilo-luque.webp" y codificarlas rompería la
// barra. Los nombres bajo site/ son kebab-case sin espacios ni acentos, así que
// no hace falta; si algún día se sube un archivo con caracteres raros, hay que
// renombrarlo, no encodear aquí.
export function siteAssetUrl(file: string): string {
  return `${STORAGE_PUBLIC_BASE}/site/${file}`;
}
