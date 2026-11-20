import type { Metadata } from "next";

export const SITE_URL = "https://www.datzoncompany.com";
export const SITE_NAME = "Datzon";
export const SITE_LOCALE = "es_PE";
export const DEFAULT_TITLE = "Datzon | Ingeniería y Automatización Industrial";

// Imagen estática en app/opengraph-image.png. Antes se generaba en el servidor
// con app/opengraph-image.tsx (sharp + fetch), pero Next carga ese módulo al
// resolver la metadata de CADA página, y en Vercel su carga fallaba y tumbaba
// todo el sitio (error 500 del 2026-11-20). Si hay que rediseñarla, el código
// original está en el commit 7c057ba: genérala en local y reemplaza el PNG.
const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  // Debe coincidir con app/opengraph-image.alt.txt (el alt de la home).
  alt: "Datzon Automatización Industrial",
  type: "image/png",
};

interface PageMetadataOptions {
  /** Título corto de la sección (ej. "Robótica"). Si se omite, usa el título raíz de la home. */
  title?: string;
  description: string;
  /** Ruta canónica relativa empezando con `/` (ej. "/robotica"). */
  path: `/${string}`;
}

/**
 * Genera el bloque `Metadata` completo (canonical, Open Graph y Twitter Card)
 * en un solo lugar. Cuando una página hija define `openGraph`, Next.js 16
 * reemplaza todo el objeto `openGraph` del layout padre (incluido el
 * `opengraph-image.png` de la raíz), por lo que para páginas internas
 * adjuntamos explícitamente `images: [OG_IMAGE]`. En la raíz (`path === "/"`),
 * Next.js inyecta automáticamente `app/opengraph-image.png` con su hash de caché.
 */
export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataOptions): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const isRoot = path === "/";

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      url: path,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      ...(isRoot ? {} : { images: [OG_IMAGE] }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(isRoot ? {} : { images: [OG_IMAGE] }),
    },
  };
}
