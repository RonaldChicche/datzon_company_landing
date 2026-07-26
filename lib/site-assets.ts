/**
 * Base pública del bucket "landing". No es un secreto: es de solo lectura y
 * el host está declarado en next.config.ts (remotePatterns).
 * Compartida con lib/projects.ts para no duplicar la constante.
 */
export const STORAGE_PUBLIC_BASE =
  "https://adnvzdcqcneqjemxneht.supabase.co/storage/v1/object/public/landing";

/**
 * URL pública de un asset del sitio (prefijo site/ del bucket).
 *
 * Hero: foto de Pexels nº 34207359 (robot industrial de seis ejes amarillo
 * en nave industrial) — https://www.pexels.com/photo/34207359/
 * Licencia Pexels: uso comercial libre, sin atribución requerida.
 */
export function siteAssetUrl(file: string): string {
  return `${STORAGE_PUBLIC_BASE}/site/${file}`;
}
