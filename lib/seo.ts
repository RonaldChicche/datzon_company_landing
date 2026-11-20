import type { Metadata } from "next";

export const SITE_URL = "https://www.datzoncompany.com";
export const SITE_NAME = "Datzon";
export const SITE_LOCALE = "es_PE";
export const DEFAULT_TITLE = "Datzon | Ingeniería y Automatización Industrial";

const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: DEFAULT_TITLE,
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
 * `opengraph-image.tsx` de la raíz), por lo que para páginas internas
 * adjuntamos explícitamente `images: [OG_IMAGE]`. En la raíz (`path === "/"`),
 * Next.js inyecta automáticamente `app/opengraph-image.tsx` con su hash de caché.
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
