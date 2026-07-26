# Migración de imágenes al bucket y limpieza de assets

**Fecha:** 2026-07-25
**Rama:** `feat/rediseno-deep-space`
**Sub-proyecto:** B (de tres; A — reglas de conexión a Supabase — está completo)

---

## Contexto

Tras el sub-proyecto A, el repositorio solo puede hablar con el proyecto Supabase `adnvzdcqcneqjemxneht` y las reglas de Storage viven en `CLAUDE.md`: bucket `landing`, prefijos `project/<slug>/` y `site/`, límite de 2 MB por archivo. Las imágenes de las galerías de proyectos ya viven en el bucket (19 objetos, 2.06 MB); el resto de imágenes del sitio sigue en `public/`, con varios problemas detectados en auditoría:

- El hero de la home es `industrial-planta.jpg` — **455 KB de JPG** como imagen LCP ([HomeContent.tsx:73](../../components/HomeContent.tsx)).
- `industrial-robot.jpg` (307 KB) no contiene ningún robot — son autos estacionados — y no lo referencia nadie.
- `hero_v2.webp` (233 KB, sin trackear) se descartó por mala calidad en móvil.
- El retrato de Danilo Luque tiene una **marca de agua de generación por IA** visible (glifo de 4 puntas, esquina inferior derecha) en la página de credibilidad del equipo.
- `Ronald_Chicche.jpg` pesa 423 KB frente a 34–45 KB de los otros retratos.
- El path del isotipo está duplicado byte a byte en 3 SVGs.
- `images.unsplash.com` en `remotePatterns` es config muerta.
- El destino `raw/` del script de subida viola la estructura de prefijos acordada.

## Objetivo

Que todo el contenido editorial se sirva desde el bucket `landing` bajo la estructura acordada, que `public/` quede solo con lo que Next exige por convención, y que el script de subida cumpla las reglas que `CLAUDE.md` declara.

## Decisiones tomadas (todas con el usuario, 2026-07-25)

| Decisión | Valor |
|---|---|
| Enfoque | **Todo al bucket** (aceptadas las concesiones: LCP desde origen externo, `dangerouslyAllowSVG`) |
| Hero nuevo | **Pexels 34207359** — robot seis ejes amarillo en nave industrial. Licencia Pexels (uso comercial libre, sin atribución). Original ≥3000 px. Elegida por el usuario entre 4 candidatas vistas |
| Retrato Ronald | **Se mantiene 3:4** y su `objectPosition: "center 15%"`; solo se comprime a webp |
| Retrato Danilo | **Se mantiene 600×600.** El glifo se elimina con una **edición IA localizada** (`antigravity_image`, aprobada por el usuario el 2026-07-26 tras verificar cara píxel-idéntica — diff 0.0 — y esquina sin costuras). Esta decisión ANULA tanto el recorte 540×540 original como el parche sharp intermedio: el experimento comparativo demostró que la vía IA no estampa el glifo visible (verificado por el usuario) y no altera el rostro (verificado por diff), invalidando las dos objeciones registradas abajo |
| Staging (`scripts/images-to-upload/`) | **Se vacía** (salvo `.gitkeep`); las 19 legítimas ya están en el bucket |
| Isotipo triplicado | **Se acepta la duplicación y se documenta** en DESIGN.md (generador = sobre-ingeniería) |
| `raw/` | **Se elimina** del script y de la tabla de CLAUDE.md |

Candidatas descartadas y por qué (para no repetir la búsqueda): Unsplash `_OPoVYkBZgc` es Unsplash+/Getty (no gratuita); Pexels 18471441 es un laboratorio universitario con marcas de terceros visibles; Pexels 34194567 tiene el logo DELTA en primer plano; Pexels 16544056 es un stand de feria; Pexels 29976478 y 31352672 quedaron segundas (chispas y línea de prensas).

## Estado final de los assets

| Asset | Hoy | Destino |
|---|---|---|
| Hero nuevo (Pexels 34207359) | — | `site/hero.webp` — ancho 2400, calidad ~80, **≤ 350 KB** |
| `industrial-planta.jpg` | Hero actual, 455 KB | `site/industrial-planta.webp` (queda disponible; deja de ser el hero) |
| `public/equipo/*.jpg` (5) | Locales | `site/equipo/<nombre-kebab>.webp` — ~40–80 KB cada uno |
| `logo_datzon.svg`, `logo_datzon_full.svg` | Locales | `site/` — **como SVG, sin conversión** |
| `app/icon.svg`, `app/favicon.ico` | Locales (en `app/`) | **Se quedan** (convención de archivo de Next) |
| `industrial-robot.jpg` | Local, huérfano | `git rm` |
| `hero_v2.webp` | Local, sin trackear | `rm` |

Al terminar, `public/` queda **vacío** (favicon e icono viven en `app/` por convención). Los directorios `public/images/` y `public/equipo/` desaparecen.

Nombres en el bucket: kebab-case (`danilo-luque.webp`, `ronald-chicche.webp`, …). Los subdirectorios bajo `site/` (como `site/equipo/`) son libres; la regla de CLAUDE.md solo fija los prefijos de primer nivel.

## Cambios de código

### `lib/site-assets.ts` (nuevo)

Helper análogo al `projectImageUrl` existente, misma base pública:

```ts
export function siteAssetUrl(file: string): string {
  return `${SUPABASE_PUBLIC}/site/${file}`;
}
```

Con la base compartida extraída para no duplicar la constante entre este archivo y `lib/projects.ts`. Registrar en un comentario la procedencia del hero (URL de la foto en Pexels y licencia).

### Componentes

- `HomeContent.tsx` — hero pasa a `siteAssetUrl("hero.webp")`; se conservan `fill`, `priority`, `sizes="100vw"` y la clase `grayscale`; el `alt` se actualiza para describir la imagen nueva.
- `TeamContent.tsx` — los 5 retratos pasan a `siteAssetUrl("equipo/….webp")`. El `objectPosition` de Ronald se conserva.
- `Header.tsx` / `Footer.tsx` — logos desde `siteAssetUrl(...)`.
- `app/layout.tsx` — `<link rel="preconnect">` al host de Supabase (mitigación LCP por servir el hero desde origen externo). Revisar también si el JSON-LD de Organization o el metadata referencian el logo local y actualizarlos.

### `next.config.ts`

- Quitar `images.unsplash.com` de `remotePatterns` (muerto).
- Añadir la configuración estándar para SVG remoto:

```ts
images: {
  dangerouslyAllowSVG: true,
  contentDispositionType: "attachment",
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  remotePatterns: [{ protocol: "https", hostname: "adnvzdcqcneqjemxneht.supabase.co" }],
},
```

Riesgo aceptado y mitigado: solo `service_role` escribe en el bucket (no hay SVGs de terceros), y el CSP de sandbox neutraliza scripts embebidos.

## Cambios al script `scripts/optimize-upload.ts`

1. **Modo `site`:** subir el contenido de staging a `site/` (con subcarpetas respetadas: `equipo/` → `site/equipo/`).
2. **Eliminar el destino `raw/`:** sin argumento y sin subcarpetas, el script explica el uso y sale con error en lugar de subir a un destino no acordado.
3. **`--dry-run`:** lista qué archivos subiría, a qué rutas y con qué peso estimado, sin subir nada. (La protección que habría evitado el incidente de las 24 imágenes re-subidas.)
4. **Passthrough de SVG:** los `.svg` se suben tal cual con `contentType: "image/svg+xml"`, sin pasar por sharp.
5. El guardia `assertDatzonProject` ya está cableado desde A y no se toca.

## Procesado de imágenes (one-shot, con sharp vía el script o un paso puntual)

| Imagen | Operación | Objetivo |
|---|---|---|
| Hero (original Pexels) | Redimensionar a 2400 px de ancho, webp q≈80 | ≤ 350 KB |
| `industrial-planta.jpg` | webp, máx 1600 px | ≤ 150 KB |
| Danilo | Parche del glifo en la esquina inferior derecha + webp, **600×600 intactos** | ~40–60 KB, sin glifo |
| Jeffry, Jose, John | webp directo | ~40–60 KB |
| Ronald | webp directo, se conserva 3:4 | ≤ 100 KB |

Todo respeta el límite duro de 2 MB por archivo del bucket.

## Documentación

- **CLAUDE.md:** quitar la fila `raw/` de la tabla de Storage (el script deja de escribir ahí); anotar la convención de subcarpetas bajo `site/`.
- **DESIGN.md:** nota de que el isotipo vive en 3 archivos (`app/icon.svg` + 2 logos del bucket) y un cambio de marca toca los tres; procedencia y licencia del hero.

## Verificación

1. `pnpm build`, `pnpm exec tsc --noEmit` y `pnpm test` en verde.
2. Ninguna referencia local muerta: buscar `/images/` y `/equipo/` en `components/` y `app/` no devuelve rutas a archivos borrados.
3. Listado del bucket: `site/` contiene exactamente 9 objetos (hero, planta, 5 retratos, 2 logos) con los pesos objetivo; `project/` sigue intacto con sus 19.
4. Comprobación visual en dev (`pnpm dev`): home con el hero nuevo, `/equipo` con los 5 retratos (Danilo sin glifo), logos en header y footer.
5. `public/` queda vacío; `git status` limpio de huérfanos.
6. Staging vacío salvo `.gitkeep`.

## Riesgos y decisiones registradas

- **LCP desde origen externo:** concesión del enfoque "todo al bucket", aceptada por el usuario. Mitigación: `preconnect` + `priority`. Si Core Web Vitals se degrada en producción, la vuelta atrás es traer `hero.webp` a `public/` — un cambio de una línea gracias al helper.
- **`dangerouslyAllowSVG`:** aceptado; riesgo bajo por escritura restringida a `service_role` + CSP sandbox.
- **El hero se ve en B/N** por la clase `grayscale` existente; la foto elegida se evaluó sabiéndolo.
- **Los originales de los retratos solo existen localmente** hasta subirse; el staging se vacía **después** de verificar la subida, no antes.

## Delegación a CLIs externos (evaluado 2026-07-25)

El bridge `antigravity-cli-mcp` expone Antigravity (Gemini), Codex, Copilot y Cursor como sub-agentes sobre la cuota del usuario. Se evaluó qué partes de este spec podían delegarse. **Decisión: por ahora nada se delega**, pero el análisis queda registrado para cuando el spec pase a plan ejecutable.

**Regenerar el retrato de Danilo con IA quedó descartado**, por tres motivos:

1. Codex **no genera imágenes**; el único generador del bridge es `antigravity_image` (Gemini).
2. El glifo actual **es la marca de Gemini**. Pedirle a Gemini que lo corrija devuelve con alta probabilidad la misma marca, además de SynthID invisible. Se cambia un watermark por otro.
3. Es el rostro de una **persona real identificable**. Los modelos o rechazan editarlo, o devuelven una cara sutilmente distinta — peor que cualquier recorte en una página de credibilidad.

**Si en el futuro se delega, el reparto sería:**

| Delegable a Codex (`workspace-write`) | Se queda local, no se delega |
|---|---|
| Refactor de `scripts/optimize-upload.ts` (aislado, 234 LOC, spec preciso) | **Subida al bucket** — escritura irreversible a producción con `service_role` |
| Migración de componentes a `siteAssetUrl` (mecánico, 6 archivos) | Procesado sharp y descarga del hero — deterministas, más baratos en local |
| | `CLAUDE.md` / `DESIGN.md` — necesitan criterio de proyecto |
| | `pnpm build` / `tsc` / `test` — la verificación no se delega |

**Precondición obligatoria de cualquier corrida delegada:** `.env.local` contiene `SUPABASE_SERVICE_ROLE_KEY` en texto plano en la raíz del workspace. Un agente al que se le pida tocar `optimize-upload.ts` lo abrirá para entender el contrato de env, y ese contenido termina en un transcript de un tercero. **Mover `.env.local` fuera del repo antes de lanzar el agente y devolverlo al terminar** — instruir al agente a no leerlo es más frágil y no se acepta como mitigación.

## Fuera de alcance

- **Sub-proyecto C:** CSP inexistente (`next.config.ts` menciona un `middleware.ts` que no existe).
- **Formulario de contacto** (leads perdidos en `console.log`) — más urgente que B y C, pendiente de su propio ciclo.
- **`pnpm lint` roto** (override de `brace-expansion`) — sin dueño asignado.
- Reemplazar el retrato generado por IA por una foto real (el parche elimina el glifo, no el origen; decisión de negocio pendiente).
