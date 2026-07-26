/**
 * Datos de los proyectos de Datzon.
 *
 * Estrategia: archivo estático (no se consulta Supabase en runtime).
 * Las imágenes viven en Supabase Storage, bucket público "landing", bajo
 * project/<slug>/<archivo>.webp. Las URLs se arman con `projectImageUrl`.
 *
 * Para agregar un proyecto:
 *   1. Subir sus fotos con `pnpm optimize-images` (carpeta = nombre del proyecto).
 *   2. Agregar una entrada aquí con el slug que generó el script y los
 *      nombres de archivo .webp resultantes.
 *
 * La primera imagen de `images` es la portada (cover) que se ve en la tarjeta.
 *
 * NOTA: el copy (title, tag, description) son borradores — editar libremente.
 */

import { STORAGE_PUBLIC_BASE } from "./site-assets";

export type Project = {
  /** Carpeta en Supabase: project/<slug>/ */
  slug: string;
  title: string;
  /** Categoría corta que se muestra como etiqueta sobre el título. */
  tag: string;
  description: string;
  /** Nombres de archivo .webp. images[0] es la portada. */
  images: string[];
};

/** Arma la URL pública de una imagen de proyecto. */
export function projectImageUrl(slug: string, file: string): string {
  return `${STORAGE_PUBLIC_BASE}/project/${slug}/${encodeURIComponent(file)}`;
}

export const PROJECTS: Project[] = [
  {
    slug: "elevadores-hidraulicos",
    title: "Elevadores hidráulicos industriales",
    tag: "Diseño y fabricación · Hidráulica",
    description:
      "Diseño, fabricación e instalación de sistemas de elevación hidráulica para el movimiento de carga y plataformas dentro de planta.",
    images: [
      "IMG-20230209-WA0057.webp",
      "IMG-20230523-WA0009.webp",
      "IMG-20230523-WA0020.webp",
      "IMG-20240716-WA0003.webp",
    ],
  },
  {
    slug: "plataforma-giratoria",
    title: "Plataforma giratoria",
    tag: "Diseño y fabricación · Automatización",
    description:
      "Diseño y fabricación de plataforma giratoria motorizada para el posicionamiento y la rotación controlada de carga en planta.",
    images: [
      "IMG-20250929-WA0066.webp",
      "IMG-20251002-WA0020.webp",
      "IMG-20251002-WA0196.webp",
      "IMG-20251003-WA0021.webp",
      "IMG-20251003-WA0054.webp",
    ],
  },
  {
    slug: "soldadura-con-robot",
    title: "Celda robótica de soldadura",
    tag: "Robótica · Metalmecánica",
    description:
      "Estación de soldadura automatizada con brazo robótico para uniones repetibles y de alta consistencia en piezas metálicas.",
    images: [
      "IMG-20250429-WA0062.webp",
      "IMG-20250526-WA0099.webp",
      "IMG-20250616-WA0068.webp",
      "IMG-20250628-WA0039.webp",
      "IMG-20250628-WA0040.webp",
      "IMG-20250703-WA0068.webp",
    ],
  },
  {
    slug: "proyecto-de-investigacion-marina-y-sni-pathfinder-velero",
    title: "Pathfinder — velero de investigación marina",
    tag: "I+D · Sistemas embebidos",
    description:
      "Plataforma náutica instrumentada para investigación marina (SNI), con sistemas embebidos de navegación y captura de datos.",
    images: [
      "IMG-20230425-WA0024.webp",
      "IMG-20230725-WA0017.webp",
      "IMG-20230808-WA0024.webp",
      "IMG-20230823-WA0037.webp",
    ],
  },
];
