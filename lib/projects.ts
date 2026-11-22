/**
 * Datos de los proyectos y de la demo destacada de Datzon.
 *
 * Estrategia: archivo estático (no se consulta Supabase en runtime).
 * Las imágenes viven en Supabase Storage, bucket público "landing", bajo
 * project/<slug>/<archivo>.webp. Las URLs se arman con `projectImageUrl`.
 *
 * Para agregar un proyecto o demo:
 *   1. Crear su manifiesto en `scripts/photos/manifests/<slug>.json` y
 *      preparar y subir las fotos con el CLI de fotos.
 *   2. Agregar una entrada aquí con ese slug y los archivos .webp que salen
 *      del manifiesto (`out` + ".webp"), en el mismo orden.
 *
 * La primera imagen de `images` es la portada (cover) que se ve en la tarjeta.
 * `focus` es un `object-position` y solo importa donde una foto 3:2 se muestra
 * en una caja cuadrada (portadas y miniaturas de la demo).
 */

import { STORAGE_PUBLIC_BASE } from "./site-assets";

export type ProjectImage = {
  file: string;
  alt?: string;
  /** object-position, p. ej. "50% 60%". */
  focus?: string;
};

export type Project = {
  /** Carpeta en Supabase: project/<slug>/ */
  slug: string;
  kind: "proyecto" | "demo";
  title: string;
  description: string;
  /** images[0] es la portada. */
  images: ProjectImage[];
};

export type FeaturedDemo = Project & {
  kind: "demo";
  youtubeId: string;
  /** Archivo .webp del póster dentro de project/<slug>/. */
  poster: string;
  tags: string[];
};

/** Etiqueta visible por tipo de proyecto. */
export const KIND_LABEL: Record<Project["kind"], string> = {
  proyecto: "Proyecto",
  demo: "Demo",
};

/** Arma la URL pública de una imagen de proyecto. */
export function projectImageUrl(slug: string, file: string): string {
  return `${STORAGE_PUBLIC_BASE}/project/${slug}/${encodeURIComponent(file)}`;
}

/** Texto alternativo de una foto: el propio o uno numerado por defecto. */
export function imageAlt(p: Project, i: number): string {
  return p.images[i].alt ?? `${p.title}, foto ${i + 1} de ${p.images.length}`;
}

export const FEATURED: FeaturedDemo = {
  slug: "soldadura-robotizada",
  kind: "demo",
  title: "Soldadura robotizada",
  description:
    "Un brazo robótico colaborativo suelda perfiles y tuberías en nuestro taller. Se programa guiándolo con la mano o desde la tableta, y repite el mismo cordón turno tras turno.",
  youtubeId: "UPYfgO93IdQ",
  poster: "poster.webp",
  tags: ["Robótica", "Soldadura MIG", "Programación por guiado"],
  images: [
    { file: "01-taller.webp", alt: "Vista del taller con el robot soldando" },
    { file: "02-operario.webp", alt: "Operario junto al robot mientras suelda" },
    { file: "03-guiado.webp", alt: "Programación guiando el brazo con la mano", focus: "55% 50%" },
    { file: "04-tableta.webp", alt: "Operario programando desde la tableta", focus: "45% 50%" },
    { file: "05-cordon.webp", alt: "Primer plano del cordón" },
    { file: "06-tubo-ia.webp", alt: "Unión de un tubo con su cordón" },
  ],
};

export const PROJECTS: Project[] = [
  {
    slug: "elevadores-hidraulicos",
    kind: "proyecto",
    title: "Elevadores hidráulicos industriales",
    description:
      "Diseño, fabricación e instalación de sistemas de elevación hidráulica para mover carga y plataformas dentro de planta.",
    images: [
      { file: "elev-portada-ia3.webp", alt: "Elevador hidráulico de tijera con su unidad de potencia" },
      { file: "img-20240716-wa0003-ia2.webp" },
      { file: "img-20230523-wa0009-ia.webp", alt: "Dos personas sobre la plataforma de un elevador extendido" },
      { file: "img-20230523-wa0020-ia.webp", alt: "Tablero eléctrico de mando del elevador" },
    ],
  },
  {
    slug: "plataforma-giratoria",
    kind: "proyecto",
    title: "Plataforma giratoria",
    description:
      "Plataforma giratoria motorizada para posicionar y rotar carga de forma controlada en planta.",
    images: [
      { file: "img-20251003-wa0021-ia.webp", alt: "Plataforma giratoria instalada bajo el escenario, con sus ruedas a la vista", focus: "50% 80%" },
      { file: "img-20251003-wa0054-ia.webp" },
      { file: "img-20250929-wa0066-ia.webp" },
      { file: "img-20251002-wa0020-v2.webp" },
      { file: "img-20251002-wa0196-ia.webp" },
    ],
  },
  {
    slug: "proyecto-de-investigacion-marina-y-sni-pathfinder-velero",
    kind: "proyecto",
    title: "Pathfinder, velero de investigación marina",
    description:
      "Plataforma náutica instrumentada con sistemas embebidos de navegación y captura de datos.",
    images: [
      { file: "img-20230808-wa0024-ia.webp" },
      { file: "img-20230725-wa0017-v2.webp" },
      { file: "img-20230425-wa0024-v2.webp" },
      { file: "img-20230823-wa0037-v2.webp" },
    ],
  },
];
