// next.config.test.ts
import { describe, expect, it } from "vitest";
// La misma función que usa el optimizador de Next para aceptar o rechazar una URL.
import { hasRemoteMatch } from "next/dist/shared/lib/match-remote-pattern";
import nextConfig from "./next.config";

const images = nextConfig.images!;
const BASE = "https://adnvzdcqcneqjemxneht.supabase.co/storage/v1/object/public/landing";
const permitida = (url: string) => hasRemoteMatch([], images.remotePatterns ?? [], new URL(url));

// Auditoría run-2: /_next/image aceptaba cualquier query (cada ?n=... era una
// entrada de caché nueva) y también los vídeos del bucket, que descargaba
// enteros antes de rechazarlos. Todo ese trabajo lo pagan las cuotas del operador.
describe("next.config images", () => {
  it.each([
    `${BASE}/site/hero.webp`,
    `${BASE}/site/equipo/ronald-chicche.webp`,
    `${BASE}/site/robotica/paletizado-poster.jpg`,
    `${BASE}/site/robotica/apps/soldadura.jpg`,
    `${BASE}/site/hero/v8/hero-16x9-poster.webp`,
    `${BASE}/project/soldadura-robotizada/01-taller.webp`,
  ])("acepta la imagen que usa el sitio: %s", (url) => {
    expect(permitida(url)).toBe(true);
  });

  it.each([
    [`${BASE}/site/hero.webp?n=1`, "query para saltarse la caché"],
    [`${BASE}/site/robotica/paletizado.mp4`, "vídeo"],
    [`${BASE}/site/hero/v8/hero-16x9.webm`, "vídeo"],
    [`${BASE}/site/logo_datzon.svg`, "SVG: el logo se sirve sin optimizar"],
    [`${BASE}/site/notas.txt`, "no es imagen"],
    ["https://adnvzdcqcneqjemxneht.supabase.co/storage/v1/object/public/otro/x.webp", "otro bucket"],
    ["https://otro.supabase.co/storage/v1/object/public/landing/site/hero.webp", "otro proyecto"],
  ])("rechaza %s (%s)", (url) => {
    expect(permitida(url)).toBe(false);
  });

  it("no procesa SVG y acota la descarga de origen", () => {
    expect(images.dangerouslyAllowSVG).toBe(false);
    expect(images.maximumResponseBody).toBeLessThanOrEqual(5 * 1024 * 1024);
  });
});
