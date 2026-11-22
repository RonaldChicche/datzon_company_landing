# Página "Proyectos y demos": plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** rehacer `/proyectos` como "Proyectos y demos". Arriba va la demo de soldadura robotizada, con vídeo de YouTube cargado solo al hacer clic y 6 fotos tratadas. Debajo, tres proyectos con portada cuadrada y fotos con el mismo formato y color.

**Arquitectura:** las fotos se preparan con un script local reutilizable (`scripts/photos/`). Lee un manifiesto JSON por proyecto y escribe originales JPEG con recorte, enderezado, paso de HDR a SDR y gradación común. Después se suben con el `optimize-upload.ts` que ya existe. En la web, `lib/projects.ts` describe los datos (proyectos más la demo destacada). Un componente cliente compone el bloque destacado, la rejilla y un lightbox extraído del actual.

**Stack:** Next.js 16 App Router, React 19, Tailwind v4 (`@theme` en `app/globals.css`), `motion/react`, `next/image`, sharp, ffmpeg 7 (sin `zscale`), vitest.

**Spec:** `docs/superpowers/specs/2026-11-21-proyectos-y-demos-design.md` (la sección "Ajustes tras revisar la maqueta" manda sobre lo anterior). Maqueta aprobada: https://claude.ai/artifact/7pEQ3FGbTQuMYWCjaPpTvS (v4).

## Restricciones globales

- Nunca nombrar el modelo del robot (ni marca ni modelo, p. ej. "FAIRINO", "FR10", "FR-HMI") en textos, `alt`, títulos ni nombres de archivo públicos.
- Sin raya larga (U+2014) en ningún texto, comentario ni commit.
- Imágenes con `next/image`; nada de `<img>` sueltos.
- `rel="noopener noreferrer"` en todo `target="_blank"`.
- La credencial secreta de Supabase solo en `scripts/*.ts` vía `.env.local`; nunca en `app/`, `components/` ni `lib/`.
- Storage: solo bucket `landing`, prefijo `project/<slug>/`. No se borra nada del bucket en este trabajo (los archivos de `soldadura-con-robot` se quedan).
- La subida al bucket la hace el agente principal tras el visto bueno de Ronald a la hoja de contactos; nunca un subagente.
- Formato: horizontales a 3:2, verticales a 1:1, póster a 16:9. La misma gradación para todas.
- El LCP del home no se toca. En `/proyectos` el iframe solo existe tras el clic.
- Commits en español, terminados con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No se hace push ni PR sin que Ronald lo pida.
- Tras cambiar código: `graphify update .`.

## Foco de revisión

1. **El vídeo no arranca tras el clic** (CSP o cabeceras bloquean el iframe). Lo esperado es que el reproductor cargue y suene sin errores CSP en consola. Lo cubren el test de `buildCsp` (Tarea 6) y la comprobación en navegador (Tarea 9, paso 3).
2. **Una imagen referenciada en `lib/projects.ts` no existe en el bucket** (nombre mal copiado, `-v2` olvidado). Lo esperado es que ninguna tarjeta ni miniatura salga rota. Lo cubren el test cruzado datos contra manifiestos (Tarea 5) y la comprobación de red sin 4xx (Tarea 9).
3. **El foco se pierde al cerrar el lightbox abierto desde una miniatura del destacado.** Lo esperado es que Esc devuelva el foco a la miniatura que lo abrió. Lo cubre la Tarea 9, paso 4.
4. **A 375 px el bloque destacado desborda** (6 miniaturas, vídeo y texto). Lo esperado es 3 miniaturas por fila, sin scroll horizontal. Lo cubre la Tarea 9, paso 5.
5. **Copy con raya larga o nombre del modelo del robot.** Lo esperado es que el test falle si aparece. Lo cubre la Tarea 5.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `scripts/photos/geometry.ts` (nuevo) | Cálculo de recortes: caja con proporción y foco, rectángulo inscrito tras rotar |
| `scripts/photos/hlg.ts` (nuevo) | Conversión HLG BT.2020 a sRGB SDR, por píxel |
| `scripts/photos/grade.ts` (nuevo) | Constantes de la gradación común y ganancias de balance de blancos |
| `scripts/photos/prepare.ts` (nuevo) | CLI: manifiesto a originales JPEG en `scripts/images-to-upload/` más hoja de contactos |
| `scripts/photos/manifests/*.json` (nuevos) | Procedencia de cada foto publicada (fuente, segundo, foco, giro) |
| `lib/youtube.ts` (nuevo) | URLs de inserción y de "ver en YouTube" con id validado |
| `lib/projects.ts` | Tipos `Project`, `ProjectImage`, `FeaturedDemo`; datos |
| `lib/csp.ts` (nuevo) | `buildCsp(nonce, isDev)` extraído de `proxy.ts`, con `frame-src` |
| `components/projects/Lightbox.tsx` (nuevo) | Lightbox extraído de `ProjectsGallery` (portal, flechas, Esc, deslizar) |
| `components/projects/YouTubeFacade.tsx` (nuevo) | Póster con play; iframe al clic |
| `components/projects/FeaturedDemo.tsx` (nuevo) | Bloque destacado: vídeo, texto, 6 miniaturas |
| `components/ProjectsGallery.tsx` | Compone destacado y rejilla; dueño del estado del lightbox |
| `app/proyectos/page.tsx`, `components/Header.tsx`, `app/globals.css` | Página, orden del menú, estilos |

---

### Tarea 1: Funciones puras del tratamiento de fotos

**Archivos:**
- Crear: `scripts/photos/geometry.ts`, `scripts/photos/hlg.ts`, `scripts/photos/grade.ts`
- Test: `scripts/photos/photos.test.ts`

**Interfaces:**
- Produce:
  - `type Box = { left: number; top: number; width: number; height: number }` (enteros).
  - `cropBox(w: number, h: number, ratio: number, focus: [number, number]): Box`: la caja más grande con `width/height = ratio`, centrada en `focus` (0 a 1) y desplazada para no salirse.
  - `inscribedSize(w: number, h: number, deg: number): { width: number; height: number }`: el mayor rectángulo con la misma proporción que `w×h`, alineado a los ejes y centrado, que cabe tras rotar la imagen `deg` grados.
  - `hlgToSdr(r: number, g: number, b: number): [number, number, number]`: entrada HLG normalizada 0 a 1, salida sRGB codificada 0 a 1.
  - `wbGains(mean: { r: number; g: number; b: number }): [number, number, number]`.
  - `GRADE = { normaliseLower: 0.5, normaliseUpper: 99.5, contrast: 1.05, saturation: 0.95, wbStrength: 0.5, wbClamp: [0.88, 1.12] } as const`.

- [ ] **Paso 1: Escribir los tests que fallan**

```ts
// scripts/photos/photos.test.ts
import { describe, expect, it } from "vitest";
import { cropBox, inscribedSize } from "./geometry";
import { hlgToSdr } from "./hlg";
import { wbGains, GRADE } from "./grade";

describe("cropBox", () => {
  it("3:2 centrado en un fotograma 16:9 de la GoPro", () => {
    expect(cropBox(5312, 2988, 3 / 2, [0.5, 0.5])).toEqual({ left: 415, top: 0, width: 4482, height: 2988 });
  });
  it("1:1 en vertical con foco bajo, sin salirse", () => {
    expect(cropBox(4590, 8160, 1, [0.5, 0.95])).toEqual({ left: 0, top: 3570, width: 4590, height: 4590 });
  });
  it("foco en el borde izquierdo se pega a 0", () => {
    expect(cropBox(5312, 2988, 3 / 2, [0, 0.5]).left).toBe(0);
  });
});

describe("inscribedSize", () => {
  it("sin giro devuelve el tamaño original", () => {
    expect(inscribedSize(900, 900, 0)).toEqual({ width: 900, height: 900 });
  });
  it("girar un cuadrado 45° deja un cuadrado de lado/√2", () => {
    const s = inscribedSize(900, 900, 45);
    expect(s.width).toBe(s.height);
    expect(s.width).toBeGreaterThanOrEqual(636);
    expect(s.width).toBeLessThanOrEqual(637);
  });
  it("es simétrico en el signo del ángulo", () => {
    expect(inscribedSize(900, 1600, 3)).toEqual(inscribedSize(900, 1600, -3));
  });
});

describe("hlgToSdr", () => {
  it("negro queda negro", () => expect(hlgToSdr(0, 0, 0)).toEqual([0, 0, 0]));
  it("un gris sigue siendo gris", () => {
    // Las filas de la matriz BT.2020→BT.709 suman 1 ± 1e-4, de ahí la tolerancia.
    const [r, g, b] = hlgToSdr(0.5, 0.5, 0.5);
    expect(Math.abs(r - g)).toBeLessThan(1e-3);
    expect(Math.abs(g - b)).toBeLessThan(1e-3);
  });
  it("el blanco de referencia HLG (75 %) cae entre 0.93 y 1", () => {
    const [r] = hlgToSdr(0.75, 0.75, 0.75);
    expect(r).toBeGreaterThan(0.93);
    expect(r).toBeLessThanOrEqual(1);
  });
  it("es monótona y no sale de [0, 1]", () => {
    let prev = -1;
    for (let v = 0; v <= 1; v += 0.05) {
      const [r] = hlgToSdr(v, v, v);
      expect(r).toBeGreaterThanOrEqual(prev);
      expect(r).toBeLessThanOrEqual(1);
      prev = r;
    }
  });
});

describe("wbGains", () => {
  it("una imagen neutra no se toca", () => expect(wbGains({ r: 120, g: 120, b: 120 })).toEqual([1, 1, 1]));
  it("una dominante fuerte se corrige a medias y con tope", () => {
    const [gr, , gb] = wbGains({ r: 200, g: 120, b: 60 });
    expect(gr).toBe(GRADE.wbClamp[0]);
    expect(gb).toBe(GRADE.wbClamp[1]);
  });
});
```

- [ ] **Paso 2: Ejecutar y ver que falla**

Ejecutar: `npx vitest run scripts/photos/photos.test.ts`
Esperado: FAIL, "Failed to resolve import ./geometry".

- [ ] **Paso 3: Implementar los tres módulos**

`geometry.ts`: `cropBox` calcula el tamaño máximo con la proporción y centra en `focus·(w,h)`, con clamp a `[0, w-width]` y `[0, h-height]`; todo redondeado. `inscribedSize` usa la fórmula cerrada del rectángulo de proporción fija inscrito en una imagen rotada, con `floor`.

`hlg.ts`, este algoritmo (ffmpeg no trae `zscale`, por eso se hace a mano):
1. OETF inversa de HLG por canal: si `E' ≤ 0.5`, `E = E'²/3`; si no, `E = (exp((E' − c)/a) + b)/12`, con `a = 0.17883277`, `b = 0.28466892`, `c = 0.55991073`.
2. OOTF: `Ys = 0.2627R + 0.6780G + 0.0593B`; cada canal por `Ys^(1.2 − 1)` (si `Ys = 0`, todo 0).
3. Normalizar al blanco de referencia: dividir entre el valor que da el paso 2 para `E' = 0.75` (unos 0.2032). Calcularlo una vez como constante.
4. BT.2020 a BT.709: matriz `[[1.6605, −0.5876, −0.0728], [−0.1246, 1.1329, −0.0083], [−0.0182, −0.1006, 1.1187]]`, y clamp de negativos a 0.
5. Hombro de altas luces sobre `m = max(r, g, b)` con `k = 0.8`: si `m > k`, se escala `rgb` por `f(m)/m`, con `f(x) = k + (1 − k)(1 − exp(−(x − k)/(1 − k)))`.
6. Codificar con la curva sRGB y hacer clamp a [0, 1].

`grade.ts`: `wbGains` sigue el método gray-world. Ganancia por canal `= 1 + wbStrength·(media_gris/media_canal − 1)`, con `media_gris = (r+g+b)/3`, y clamp a `wbClamp`. Resultado redondeado a 4 decimales.

- [ ] **Paso 4: Ejecutar y ver que pasa**

Ejecutar: `npx vitest run scripts/photos/photos.test.ts`
Esperado: PASS, 12 tests.

- [ ] **Paso 5: Commit**

```bash
git add scripts/photos/geometry.ts scripts/photos/hlg.ts scripts/photos/grade.ts scripts/photos/photos.test.ts
git commit -m "feat(fotos): recorte, HLG a SDR y gradación común como funciones puras"
```

---

### Tarea 2: CLI `prepare.ts` y fotos de la demo de soldadura

**Archivos:**
- Crear: `scripts/photos/prepare.ts`, `scripts/photos/manifests/soldadura-robotizada.json`
- Copiar: `~/Downloads/WhatsApp Image 2026-11-11 at 5.38.06 PM.jpeg` a `~/Documents/DatzonCompany/datzon_company_brochure/01_fuentes/fotos/fr10-soldadura/whatsapp-2026-11-11-tubo.jpeg` (`cp`, no mover).

**Interfaces:**
- Consume: todo lo de la Tarea 1.
- Produce:
  - Uso: `npx tsx scripts/photos/prepare.ts <manifiesto.json> --root <dir> [--out <dir>]`. `--out` por defecto es `scripts/images-to-upload`.
  - El manifiesto es un array JSON de `Entry`, en el orden de publicación:
    ```ts
    type Entry = {
      out: string;               // nombre sin extensión; el .webp subido se llamará <out>.webp
      src: string;               // relativo a --root
      frameAt?: number;          // segundos, si src es vídeo
      hlg?: boolean;             // MOV del iPhone (transferencia arib-std-b67)
      rotate?: number;           // grados, positivo = horario; recorta al rectángulo inscrito
      format?: "auto" | "16:9";  // auto: 3:2 si ancho ≥ alto, 1:1 si no
      focus?: [number, number];  // centro del recorte, 0..1; por defecto [0.5, 0.5]
    };
    ```
  - Salida: `<out>/<entry.out>.jpg` (sRGB, calidad 92, croma 4:4:4) y `<out>/_hoja-<nombre-manifiesto>.jpg` (hoja de contactos con el nombre de cada foto). Tamaño máximo: 3:2 a 2400×1600, 1:1 a 1600×1600, 16:9 a 1920×1080, sin ampliar.

- [ ] **Paso 1: Implementar `prepare.ts`**

Orden por entrada:
1. Obtener píxeles.
   - Foto: `sharp(src).rotate()` (orientación EXIF).
   - Vídeo SDR: `ffmpeg -ss <frameAt> -i <src> -frames:v 1 -f image2pipe -vcodec png -`.
   - Vídeo HLG: `ffmpeg -ss <frameAt> -i <src> -frames:v 1 -vf scale=in_color_matrix=bt2020:in_range=tv:out_range=full -pix_fmt rgb48le -f rawvideo -`. Cada píxel se pasa por `hlgToSdr` y se arma un buffer RGB de 8 bits para sharp (`raw: { width, height, channels: 3 }`).
2. Si hay `rotate`: `.rotate(deg, { background: "#000" })` y extraer el centro con `inscribedSize`.
3. Recortar con `cropBox` según `format` y `focus`.
4. Gradación, en este orden: `recomb` diagonal con `wbGains(stats)`, `normalise({ lower, upper })`, `linear(contrast, 128·(1 − contrast))`, `modulate({ saturation })`. Los valores salen de `GRADE`.
5. Redimensionar al máximo de su formato con `withoutEnlargement: true` y guardar como JPEG.

Hoja de contactos: `magick montage` con `-font /System/Library/Fonts/Supplemental/Arial.ttf -label %t -geometry 480x480+8+8`. Sin `-font`, ImageMagick falla en esta máquina.

Los comandos de ffmpeg se lanzan con `execFileSync` y argumentos en array, nunca con una cadena de shell: las rutas llevan espacios ("PRUEBA 2").

- [ ] **Paso 2: Escribir el manifiesto**

`--root` = `~/Documents/DatzonCompany/datzon_company_brochure/01_fuentes`.

| out | src | frameAt | otros |
|---|---|---|---|
| `01-taller` | `video/fr10-soldadura/GX010471.MP4` | 20 | |
| `02-operario` | `fotos/fr10-soldadura/PXL_20261107_200614253.jpg` | | `focus [0.5, 0.6]` |
| `03-guiado` | `video/fr10-soldadura/PRUEBA 2/IMG_0953.MOV` | 5 | `hlg: true`, `focus [0.6, 0.5]` |
| `04-tableta` | `video/fr10-soldadura/GX010486.MP4` | 5.4 | `focus [0.4, 0.5]` |
| `05-cordon` | `fotos/fr10-soldadura/PXL_20261107_201120128.jpg` | | |
| `06-tubo` | `fotos/fr10-soldadura/whatsapp-2026-11-11-tubo.jpeg` | | `rotate`: medido en el paso 3 |
| `poster` | `video/fr10-soldadura/GX010466.MP4` | 30 | `format: "16:9"` |

- [ ] **Paso 3: Medir el giro del tubo**

Generar `06-tubo` sin `rotate` y mirarlo. Elegir el ángulo que deja vertical el borde del tubo o la arista de la mesa, apuntarlo en el manifiesto y regenerar. Se acepta cuando la arista de referencia se desvía menos de 0,5° (se comprueba con una línea guía de `magick -draw`).

- [ ] **Paso 4: Generar y verificar**

Ejecutar: `npx tsx scripts/photos/prepare.ts scripts/photos/manifests/soldadura-robotizada.json --root ~/Documents/DatzonCompany/datzon_company_brochure/01_fuentes`
Después: `for f in scripts/images-to-upload/*.jpg; do magick identify -format "%f %wx%h\n" "$f"; done`

Esperado:
- `01`, `03` y `04` a 2400×1600;
- `02` y `05` a 1600×1600;
- `06` cuadrado y como mucho de 900×900 (la fuente mide 900 de ancho);
- `poster` a 1920×1080.

`03-guiado` no debe verse lavado (gris y sin contraste): compararlo con `01-taller` en la hoja.

- [ ] **Paso 5: Commit (solo código y manifiesto; los JPEG no se versionan)**

```bash
git add scripts/photos/prepare.ts scripts/photos/manifests/soldadura-robotizada.json
git commit -m "feat(fotos): CLI que prepara fotos desde un manifiesto y manifiesto de la demo de soldadura"
```

---

### Tarea 3: Fotos de los otros tres proyectos

**Archivos:**
- Crear: `scripts/photos/manifests/elevadores-hidraulicos.json`, `plataforma-giratoria.json`, `proyecto-de-investigacion-marina-y-sni-pathfinder-velero.json`

**Interfaces:**
- Consume: `prepare.ts` (Tarea 2).
- Produce: originales `<nombre-original>-v2.jpg` por proyecto, en una carpeta de salida por slug. El sufijo `-v2` evita pisar URLs que `/_next/image` ya tiene en caché.

- [ ] **Paso 1: Descargar las fuentes actuales del bucket**

Fuente: las `.webp` públicas que lista hoy `lib/projects.ts`, descargadas con `curl` a `<scratchpad>/fuentes/<slug>/`. Son las mismas fotos de WhatsApp a 1600 px; recodificar una vez más apenas pierde calidad y evita depender de Drive.

- [ ] **Paso 2: Escribir los manifiestos**

- **Elevadores:** orden `IMG-20240716-WA0003` (portada), `IMG-20230523-WA0009`, `IMG-20230523-WA0020` (con `rotate` medido como en la Tarea 2, paso 3). Sin `IMG-20230209-WA0057`.
- **Plataforma y Pathfinder:** mismas fotos y mismo orden que hoy, salvo que otra foto sea mejor portada. En ese caso, pasarla al primer lugar y anotarlo para Ronald.
- `out` = nombre original más `-v2`.

- [ ] **Paso 3: Generar, una carpeta por proyecto**

Ejecutar por slug: `npx tsx scripts/photos/prepare.ts scripts/photos/manifests/<slug>.json --root <scratchpad>/fuentes/<slug> --out <scratchpad>/listas/<slug>`
Esperado: horizontales en 3:2 y verticales en 1:1 (comprobar con `magick identify`), y una hoja de contactos por proyecto.

- [ ] **Paso 4: Commit**

```bash
git add scripts/photos/manifests/
git commit -m "feat(fotos): manifiestos de elevadores, plataforma y Pathfinder"
```

---

### Tarea 4: Pase con IA, revisión de Ronald y subida

Esta tarea no es de código. La ejecuta el agente principal, nunca un subagente.

- [ ] **Paso 1: Decidir qué fotos necesitan IA**

Candidatas:
- `06-tubo`: 900 px, menos que los 1600 del resto; ampliar ×2.
- Cualquier vertical cuyo recorte 1:1 corte algo importante: completar los lados en vez de recortar.

Herramienta: buscar con `ToolSearch` un modelo de ampliación o de relleno, por ejemplo con `mcp__claude_ai_Figma__weave_find_model`.
- Si hay modelo: procesar, guardar como `<out>.jpg` encima del original preparado y volver a aplicar solo la gradación, para que el color siga igual.
- Si no hay: ampliar con Lanczos y `unsharp 0x0.8+0.6+0.02`, y decirle a Ronald que es un sustituto sin IA.

- [ ] **Paso 2: Enseñar las hojas de contactos a Ronald**

Las 4 hojas en un artifact (o como imágenes) con la pregunta: "¿Subo estas?". Si pide ajustes de gradación, se cambian las constantes de `GRADE`, que valen para todas, y se regenera todo. No se toca cada foto por separado.

- [ ] **Paso 3: Subir tras el sí**

```bash
npx tsx scripts/optimize-upload.ts soldadura-robotizada --dry-run   # con los 7 .jpg sueltos en scripts/images-to-upload/
npx tsx scripts/optimize-upload.ts soldadura-robotizada
```

Para cada otro proyecto: mover sus `.jpg` a `scripts/images-to-upload/` y repetir con su slug.

Esperado: el dry-run lista `project/<slug>/<out>.webp`. `curl -sI <url pública>` devuelve 200 en cada archivo. Se usa `npx tsx` porque `pnpm` falla en verify-deps en esta máquina.

- [ ] **Paso 4: Guardar las fuentes nuevas**

Comprobar que la copia del tubo sigue en el brochure (Tarea 2). No hay commit en este paso.

---

### Tarea 5: Datos y URLs de YouTube

**Archivos:**
- Crear: `lib/youtube.ts`, `lib/youtube.test.ts`, `lib/projects.test.ts`
- Modificar: `lib/projects.ts` (reescrito)

**Interfaces:**
- Produce:
  ```ts
  export type ProjectImage = { file: string; alt?: string; focus?: string }; // focus = object-position, p. ej. "50% 60%"
  export type Project = { slug: string; kind: "proyecto" | "demo"; title: string; description: string; images: ProjectImage[] };
  export type FeaturedDemo = Project & { kind: "demo"; youtubeId: string; poster: string; tags: string[] };
  export const PROJECTS: Project[];        // elevadores, plataforma, pathfinder, en ese orden
  export const FEATURED: FeaturedDemo;
  export function projectImageUrl(slug: string, file: string): string; // sin cambios
  export function imageAlt(p: Project, i: number): string; // img.alt ?? `${p.title}, foto ${i + 1} de ${p.images.length}`
  // lib/youtube.ts
  export function youtubeEmbedUrl(id: string): string;  // https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0
  export function youtubeWatchUrl(id: string): string;  // https://www.youtube.com/watch?v=<id>
  // ambas lanzan Error si id no cumple /^[A-Za-z0-9_-]{11}$/
  ```
- Se elimina el campo `tag`: nada lo muestra ya.

- [ ] **Paso 1: Escribir los tests que fallan**

```ts
// lib/youtube.test.ts
import { describe, expect, it } from "vitest";
import { youtubeEmbedUrl, youtubeWatchUrl } from "./youtube";

describe("youtube", () => {
  it("arma la URL sin cookies con autoplay", () => {
    expect(youtubeEmbedUrl("zvhX8jre5Nk")).toBe("https://www.youtube-nocookie.com/embed/zvhX8jre5Nk?autoplay=1&rel=0");
  });
  it("arma el enlace de respaldo", () => {
    expect(youtubeWatchUrl("zvhX8jre5Nk")).toBe("https://www.youtube.com/watch?v=zvhX8jre5Nk");
  });
  it("rechaza ids que no son de YouTube", () => {
    expect(() => youtubeEmbedUrl("abc")).toThrow();
    expect(() => youtubeEmbedUrl("zvhX8jre5Nk&x=1")).toThrow();
  });
});
```

```ts
// lib/projects.test.ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FEATURED, PROJECTS, imageAlt } from "./projects";

const manifest = (slug: string): string[] =>
  JSON.parse(readFileSync(`scripts/photos/manifests/${slug}.json`, "utf8")).map((e: { out: string }) => `${e.out}.webp`);

describe("datos de proyectos", () => {
  it("quedan los tres proyectos, en orden, sin la celda antigua", () => {
    expect(PROJECTS.map((p) => p.slug)).toEqual([
      "elevadores-hidraulicos",
      "plataforma-giratoria",
      "proyecto-de-investigacion-marina-y-sni-pathfinder-velero",
    ]);
  });
  it("la demo destacada usa el vídeo y las 6 fotos", () => {
    expect(FEATURED.slug).toBe("soldadura-robotizada");
    expect(FEATURED.youtubeId).toBe("zvhX8jre5Nk");
    expect(FEATURED.images.map((i) => i.file)).toEqual([
      "01-taller.webp", "02-operario.webp", "03-guiado.webp", "04-tableta.webp", "05-cordon.webp", "06-tubo.webp",
    ]);
    expect(FEATURED.poster).toBe("poster.webp");
  });
  it("cada archivo referenciado sale de su manifiesto", () => {
    for (const p of [FEATURED, ...PROJECTS]) {
      const files = manifest(p.slug);
      for (const img of p.images) expect(files).toContain(img.file);
    }
    expect(manifest(FEATURED.slug)).toContain(FEATURED.poster);
  });
  it("los focos son valores válidos de object-position", () => {
    for (const p of [FEATURED, ...PROJECTS])
      for (const img of p.images) if (img.focus) expect(img.focus).toMatch(/^\d{1,3}% \d{1,3}%$/);
  });
  it("ningún texto lleva raya larga ni el modelo del robot", () => {
    const text = JSON.stringify([FEATURED, PROJECTS]);
    expect(text).not.toContain(String.fromCharCode(0x2014)); // raya larga, escrita sin el carácter literal
    expect(text).not.toMatch(/fairino|fr\s?-?\s?10|fr-hmi/i);
  });
  it("alt por defecto numerado", () => {
    expect(imageAlt(PROJECTS[0], 0)).toBe(`${PROJECTS[0].title}, foto 1 de ${PROJECTS[0].images.length}`);
  });
});
```

- [ ] **Paso 2: Ejecutar y ver que falla**

Ejecutar: `npx vitest run lib/youtube.test.ts lib/projects.test.ts`
Esperado: FAIL (no existe `lib/youtube.ts`; no existen `FEATURED` ni `imageAlt`).

- [ ] **Paso 3: Implementar**

Copy fijo de `FEATURED`, tomado de la maqueta aprobada:
- `title`: "Soldadura robotizada"
- `description`: "Un brazo robótico colaborativo suelda perfiles y tuberías en nuestro taller. Se programa guiándolo con la mano o desde la tableta, y repite el mismo cordón turno tras turno."
- `tags`: `["Robótica", "Soldadura MIG", "Programación por guiado"]`
- `alt` de las 6 fotos, en orden:
  1. "Vista del taller con el robot soldando"
  2. "Operario junto al robot mientras suelda"
  3. "Programación guiando el brazo con la mano"
  4. "Operario programando desde la tableta"
  5. "Primer plano del cordón"
  6. "Unión de un tubo con su cordón"
- `focus`: punto de partida `03-guiado` "70% 50%" y `04-tableta` "35% 50%". Ajustarlos a ojo con las fotos ya subidas: es el centro del recorte cuadrado de la miniatura.

Proyectos: `title` y `description` como en la maqueta.
- Elevadores: "Diseño, fabricación e instalación de sistemas de elevación hidráulica para mover carga y plataformas dentro de planta."
- Plataforma: "Plataforma giratoria motorizada para posicionar y rotar carga de forma controlada en planta."
- Pathfinder: "Plataforma náutica instrumentada con sistemas embebidos de navegación y captura de datos."

Archivos: los de las Tareas 2 y 3. Actualizar el comentario de cabecera: el alta de un proyecto ahora pasa por un manifiesto en `scripts/photos/manifests/`.

- [ ] **Paso 4: Ejecutar y ver que pasa**

Ejecutar: `npx vitest run lib/youtube.test.ts lib/projects.test.ts`
Esperado: PASS. `npx tsc --noEmit` dará errores solo en `ProjectsGallery.tsx` (usa `tag`), que se arreglan en la Tarea 7.

- [ ] **Paso 5: Commit**

```bash
git add lib/youtube.ts lib/youtube.test.ts lib/projects.ts lib/projects.test.ts
git commit -m "feat(proyectos): datos de la demo destacada y fotos con formato uniforme"
```

---

### Tarea 6: CSP que permite el reproductor de YouTube

**Archivos:**
- Crear: `lib/csp.ts`, `lib/csp.test.ts`
- Modificar: `proxy.ts` (usa `buildCsp`; los comentarios de cada directiva se mudan a `lib/csp.ts`)

**Interfaces:**
- Produce: `buildCsp(nonce: string, isDev: boolean): string`, con la misma salida que hoy más `"frame-src https://www.youtube-nocookie.com"` justo después de `media-src`.

- [ ] **Paso 1: Test que falla**

```ts
// lib/csp.test.ts
import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

describe("buildCsp", () => {
  const csp = buildCsp("abc", false);
  it("permite solo el reproductor sin cookies", () => {
    expect(csp).toContain("frame-src https://www.youtube-nocookie.com;");
    expect(csp).not.toMatch(/frame-src[^;]*\/\/(www\.)?youtube\.com/);
  });
  it("mantiene lo que ya había", () => {
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic' https://va.vercel-scripts.com");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-eval");
  });
  it("en desarrollo añade unsafe-eval", () => expect(buildCsp("abc", true)).toContain("'unsafe-eval'"));
});
```

- [ ] **Paso 2:** `npx vitest run lib/csp.test.ts`. Esperado: FAIL, el módulo no existe.
- [ ] **Paso 3:** Mover el array de `proxy.ts` a `buildCsp` y añadir `frame-src`.
- [ ] **Paso 4:** `npx vitest run lib/csp.test.ts`. Esperado: PASS.
- [ ] **Paso 5: Commit**

```bash
git add lib/csp.ts lib/csp.test.ts proxy.ts
git commit -m "feat(csp): permite el reproductor de YouTube sin cookies"
```

---

### Tarea 7: Componentes de la página

**Archivos:**
- Crear: `components/projects/Lightbox.tsx`, `components/projects/YouTubeFacade.tsx`, `components/projects/FeaturedDemo.tsx`
- Modificar: `components/ProjectsGallery.tsx`, `app/globals.css` (bloque `PROJECTS GRID`)

**Interfaces:**
- Consume: `Project`, `FeaturedDemo`, `FEATURED`, `PROJECTS`, `projectImageUrl`, `imageAlt` (Tarea 5); `youtubeEmbedUrl`, `youtubeWatchUrl` (Tarea 5).
- Produce:
  - `Lightbox(props: { project: Project | null; index: number; onIndex: (i: number) => void; onClose: () => void })`: el lightbox actual movido tal cual (portal, Esc, flechas, deslizar, miniaturas, bloqueo de scroll). Cambian dos cosas: sobre el título muestra la pastilla de `kind` en lugar de `tag`; y al cerrar devuelve el foco al elemento que estaba activo al abrir (guardado en una ref en el efecto de apertura).
  - `YouTubeFacade(props: { videoId: string; poster: string; title: string })`, donde `poster` es la URL. Antes del clic es un `<button aria-label="Reproducir el vídeo de la demo de soldadura">` con `next/image` (`fill`, `priority`, `sizes="(max-width: 900px) 100vw, 60vw"`, `alt=""`), un círculo lima con el triángulo y la etiqueta "Vídeo de la demo". Tras el clic es un `<iframe src={youtubeEmbedUrl(videoId)} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin">` que recibe el foco. El contenedor mantiene `aspect-ratio: 16/9` antes y después, sin salto de maquetación.
  - `FeaturedDemo(props: { demo: FeaturedDemo; onOpen: (i: number) => void })`. Estructura: `article.feat` con la línea "Destacado" y la pastilla "Demo", el `h2`, y dos columnas `1.7fr 1fr` (facade; texto, tags y enlace "Ver en YouTube ↗" con `target="_blank" rel="noopener noreferrer"`). Debajo, 6 botones cuadrados (`aria-label="Ver foto n de 6: <alt en minúscula inicial>"`) con `next/image` `fill`, `sizes="(max-width: 900px) 33vw, 16vw"` y `objectPosition` igual a `focus`. Sin la línea "6 fotos · taller propio".
  - `ProjectsGallery()`: dueño de `const [open, setOpen] = useState<{ project: Project; index: number } | null>(null)`. Renderiza `FeaturedDemo`, el `h2` "Proyectos" (sin subtítulo), la rejilla y `Lightbox`. Tarjeta: portada `aspect-ratio: 1` con `objectPosition` del `focus` de `images[0]` y el contador de fotos; cuerpo con la pastilla "Proyecto", `h3` y `p`. Sin línea de categoría. La portada ya no lleva `priority`: queda debajo del destacado.

- [ ] **Paso 1: Extraer `Lightbox` sin cambiar su comportamiento**

Mover el JSX y los efectos. `ProjectsGallery` lo usa con los datos actuales. Comprobar en `localhost:3000/proyectos` (`next dev`) que abre, avanza con flechas y cierra con Esc igual que antes.

- [ ] **Paso 2: `YouTubeFacade`, `FeaturedDemo`, rejilla nueva y CSS**

CSS nuevo en `globals.css` bajo `PROJECTS GRID`, con los valores de la maqueta (`template.html`, líneas 72 a 118):
- `.feat`: fondo `var(--card)`, borde `var(--line-d)`, radio 10 px, padding 28 px, `gap` 28 px.
- `.feat-body`: columnas `1.7fr 1fr`.
- `.feat-thumbs`: `repeat(6, minmax(0, 1fr))` con `gap` 10 px.
- `.yt-facade`: 16:9, imagen `brightness(.82)` que sube a `.95` al hover, play de 74 px.
- `.pill.demo` (fondo `var(--ink-d)`, texto `var(--lime)`) y `.pill.proj` (borde `var(--line-d)`).
- `.proj .pimg`: `aspect-ratio: 1`.
- Por debajo de 900 px: `.feat-body` a 1 columna, `.feat-thumbs` a 3 columnas, `.proj-grid` a 2. Por debajo de 600 px: `.proj-grid` a 1.
- Bajo `prefers-reduced-motion: reduce`: sin `scale` ni `translate` en hover.
- Se borran `.proj .ptag` y `.proj .pmetric*` (ya no se usan; comprobarlo con grep).

- [ ] **Paso 3: Tipos y lint**

Ejecutar: `npx tsc --noEmit && npx eslint components/ProjectsGallery.tsx components/projects`
Esperado: sin errores.

- [ ] **Paso 4: Commit**

```bash
git add components/projects components/ProjectsGallery.tsx app/globals.css
git commit -m "feat(proyectos): demo destacada con vídeo bajo demanda y tarjetas cuadradas"
```

---

### Tarea 8: Página, menú y metadatos

**Archivos:**
- Modificar: `app/proyectos/page.tsx`, `components/Header.tsx:9-14`

- [ ] **Paso 1: Cambios**

- `page.tsx`:
  - `h1` = `Proyectos <span className="accent">y demos</span>`, en una sola línea y sin `<br />`;
  - se borra el `<p className="lead">`; el breadcrumb queda "Inicio / Proyectos";
  - `metadata`: `title: "Proyectos y demos"`, `description: "Demo de soldadura robotizada y proyectos de Datzon: elevadores hidráulicos, plataforma giratoria y el velero de investigación Pathfinder."`;
  - la cabecera (`page-head--light` con `grid-bg`) y la sección `section-light solid` quedan como están: ya dan el papel milimetrado solo arriba;
  - la CTA no cambia.
- `Header.tsx`: `NAV_LINKS` en el orden Inicio, Proyectos, Robótica, Equipo.

- [ ] **Paso 2:** `npx vitest run lib/seo.test.ts`. Esperado: PASS (si algún test fija el título antiguo, actualizarlo).
- [ ] **Paso 3: Commit**

```bash
git add app/proyectos/page.tsx components/Header.tsx
git commit -m "feat(proyectos): título Proyectos y demos y menú con Proyectos en segundo lugar"
```

---

### Tarea 9: Verificación completa

- [ ] **Paso 1:** `npx vitest run && npx eslint . && npx next build`. Esperado: todo verde y `/proyectos` como página estática.
- [ ] **Paso 2:** Parar el `next start` viejo del puerto 3000 (`TaskStop`) y levantar el build nuevo. Con Playwright en `/proyectos`, comprobar que el HTML no contiene `data-dgst` y que no hay respuestas 4xx ni 5xx de `/_next/image`.
- [ ] **Paso 3:** Clic en el póster. Esperado: existe un `iframe[src^="https://www.youtube-nocookie.com/embed/zvhX8jre5Nk"]`, no hay mensajes de consola "Refused to frame" ni "Content Security Policy", y el foco está en el iframe. Antes del clic, la red no muestra ninguna petición a `youtube`.
- [ ] **Paso 4:** Teclado. Tab hasta la miniatura 3, Enter, Flecha derecha (el contador dice "4 / 6"), Esc. Esperado: `document.activeElement` es la miniatura 3.
- [ ] **Paso 5:** A 375×812: `document.documentElement.scrollWidth <= 375`, 3 miniaturas por fila y tarjetas a una columna. Capturas a 375 y 1440 en `.playwright-mcp/`, ocultando el header fijo con `addStyleTag`.
- [ ] **Paso 6:** LCP de `/proyectos` con el protocolo del proyecto: viewport 412×823, CPU ×4, latencia 150 ms y 1,6 Mbps; 5 corridas, mediana, contra el build local. Apuntar la cifra. No compararla con producción.
- [ ] **Paso 7:** `graphify update .` y enseñarle a Ronald las capturas y el LCP. El push y el PR esperan a que él lo pida.
