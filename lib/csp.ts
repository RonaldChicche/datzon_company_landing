import { STORAGE_PUBLIC_BASE } from "@/lib/site-assets";

/**
 * Construye la cabecera Content-Security-Policy para una petición.
 *
 * Función pura (sin cabeceras ni estado de Next), para poder probarla. La usa
 * `proxy.ts` con un nonce nuevo en cada petición.
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    // 'strict-dynamic': un script de confianza puede cargar otros, que heredan
    // la confianza. Es lo que permite a Next cargar sus fragmentos de JS.
    // 'unsafe-eval' solo en desarrollo: lo exige la recarga en caliente.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
    // 'unsafe-inline' es obligatorio aquí: los nonces NO aplican a atributos
    // style=, y tanto React (style={{...}}) como Framer Motion animan con
    // estilos en línea. Sin esto el sitio se queda sin maquetación.
    "style-src 'self' 'unsafe-inline'",
    // next/font autoaloja las fuentes en nuestro propio origen.
    "font-src 'self'",
    // Las imágenes del bucket llegan proxeadas por /_next/image, que es 'self'.
    // data: y blob: los usa next/image para los placeholders.
    // Excepción: el <video poster> de la sala de control (DemoPlayer) no puede
    // pasar por next/image (no es un <img>), así que el poster referencia el
    // bucket directo. Se permite solo esa ruta del bucket público, no todo
    // supabase.co, igual que acota next.config.ts en `images.remotePatterns`.
    `img-src 'self' data: blob: ${STORAGE_PUBLIC_BASE}/`,
    // Los <video src> de las demos apuntan al mismo bucket público y no tienen
    // equivalente a next/image para vídeo, así que se acotan aquí igual que el
    // poster de arriba (mismo host + prefijo de ruta, nada más amplio).
    `media-src 'self' ${STORAGE_PUBLIC_BASE}/`,
    // Solo el reproductor de YouTube sin cookies, y solo tras pulsar play.
    "frame-src https://www.youtube-nocookie.com",
    "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}
