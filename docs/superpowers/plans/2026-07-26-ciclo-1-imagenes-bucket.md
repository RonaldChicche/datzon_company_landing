# Ciclo 1, Imágenes al bucket y limpieza de assets: Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Todo el contenido editorial servido desde el bucket `landing` bajo `site/`, `public/` vacío, hero nuevo optimizado, retrato de Danilo sin glifo de IA, y el script de subida cumpliendo las reglas de CLAUDE.md (modo `site`, `--dry-run`, passthrough SVG, sin `raw/`).

**Architecture:** Un helper `siteAssetUrl` con la base pública compartida reemplaza las rutas locales en los componentes. El script se refactoriza primero; con él se suben los assets procesados con sharp en un paso puntual; después los componentes migran al bucket y `public/` se vacía. La subida real y la verificación del bucket usan la service key local y queries de solo lectura vía MCP.

**Tech Stack:** sharp, Supabase Storage (service key en `.env.local`), next/image, Vitest, curl (descarga Pexels).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-25-migracion-imagenes-bucket-design.md`, decisiones cerradas con el usuario, incluida la sección de delegación y el parche de Danilo (600×600, NO recorte).
- Bucket `landing`, prefijo `site/` para todo lo de este ciclo; **jamás** subir a `raw/` ni crear prefijos nuevos de primer nivel. Límite duro: 2 MB por archivo.
- Nombres en el bucket: kebab-case (`danilo-luque.webp`).
- Pesos objetivo: hero ≤ 350 KB (2400 px, q≈80) · planta ≤ 150 KB (1600 px) · retratos ~40–100 KB · SVGs tal cual.
- La subida real al bucket NO se delega a agentes externos y usa `SUPABASE_SERVICE_ROLE_KEY` solo vía el script (regla CLAUDE.md).
- `app/icon.svg` y `app/favicon.ico` NO se tocan (convención de Next).
- El hero se muestra en B/N por la clase `grayscale` existente, se conserva, igual que `fill`, `priority`, `fetchPriority="high"` y `sizes="100vw"` del ciclo 0.
- `objectPosition` por miembro en TeamContent se conserva (Ronald: `center 15%`).
- Los `width={614} height={120}` de los logos (ciclo 0) se conservan.
- TypeScript estricto; comentarios en español.

---

### Task 1: `lib/site-assets.ts`, helper y base compartida

**Files:**
- Create: `lib/site-assets.ts`
- Test: `lib/site-assets.test.ts`
- Modify: `lib/projects.ts:18-37` (la constante privada `SUPABASE_PUBLIC` pasa a importarse)

**Interfaces:**
- Produces: `STORAGE_PUBLIC_BASE: string` y `siteAssetUrl(file: string): string` desde `@/lib/site-assets`. Las consumen las Tasks 5 (componentes) y nadie más.
- `projectImageUrl(slug, file)` de `lib/projects.ts` NO cambia de firma ni de resultado.

- [ ] **Step 1: Write the failing test**

```ts
// lib/site-assets.test.ts
import { describe, it, expect } from "vitest";
import { STORAGE_PUBLIC_BASE, siteAssetUrl } from "./site-assets";
import { projectImageUrl } from "./projects";

const BASE =
  "https://adnvzdcqcneqjemxneht.supabase.co/storage/v1/object/public/landing";

describe("siteAssetUrl", () => {
  it("arma la URL pública bajo site/", () => {
    expect(siteAssetUrl("hero.webp")).toBe(`${BASE}/site/hero.webp`);
  });

  it("respeta subcarpetas bajo site/", () => {
    expect(siteAssetUrl("equipo/danilo-luque.webp")).toBe(
      `${BASE}/site/equipo/danilo-luque.webp`
    );
  });
});

describe("base compartida", () => {
  it("STORAGE_PUBLIC_BASE es la base del bucket", () => {
    expect(STORAGE_PUBLIC_BASE).toBe(BASE);
  });

  it("projectImageUrl sigue funcionando igual tras el refactor", () => {
    expect(projectImageUrl("soldadura-con-robot", "IMG-20250429-WA0062.webp")).toBe(
      `${BASE}/project/soldadura-con-robot/IMG-20250429-WA0062.webp`
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/site-assets.test.ts`
Expected: FAIL, `Cannot find module './site-assets'`.

- [ ] **Step 3: Implementar**

```ts
// lib/site-assets.ts
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
 * en nave industrial), https://www.pexels.com/photo/34207359/
 * Licencia Pexels: uso comercial libre, sin atribución requerida.
 */
export function siteAssetUrl(file: string): string {
  return `${STORAGE_PUBLIC_BASE}/site/${file}`;
}
```

En `lib/projects.ts`: eliminar la constante privada `SUPABASE_PUBLIC` (y su comentario de dos líneas) y añadir arriba `import { STORAGE_PUBLIC_BASE } from "./site-assets";`. En `projectImageUrl`, reemplazar `SUPABASE_PUBLIC` por `STORAGE_PUBLIC_BASE`. Nada más cambia.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run lib/site-assets.test.ts && pnpm exec tsc --noEmit`
Expected: PASS (4 tests) y tsc limpio.

- [ ] **Step 5: Commit**

```bash
git add lib/site-assets.ts lib/site-assets.test.ts lib/projects.ts
git commit -m "feat: helper siteAssetUrl con la base pública del bucket compartida"
```

---

### Task 2: Refactor de `scripts/optimize-upload.ts`, modo site, --dry-run, SVG, sin raw/

**Files:**
- Modify: `scripts/optimize-upload.ts` (los cambios abarcan cabecera, config, `uploadImages` y `main`)

**Interfaces:**
- Produces: CLI `pnpm optimize-images site [--dry-run]` que la Task 4 usa para subir el staging a `site/`. Los modos de proyecto existentes (`pnpm optimize-images` con subcarpetas, `pnpm optimize-images <nombre>`) no cambian de comportamiento, salvo que aceptan `--dry-run`.

- [ ] **Step 1: Flag --dry-run y soporte SVG en la subida**

1. Tras la línea de `const projectArg = process.argv[2];` no, la lectura de argv se hace así al inicio de `main()`:

```ts
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const modeArg = args.find((a) => !a.startsWith("--"));
```

2. Añadir `.svg` al reconocimiento SIN meterlo en `SUPPORTED_EXTS` (que alimenta a sharp):

```ts
function isSvg(filename: string): boolean {
  return path.extname(filename).toLowerCase() === ".svg";
}
```

y en `uploadImages`, el filtro pasa de `entries.filter(isImage)` a `entries.filter((f) => isImage(f) || isSvg(f))`.

3. Dentro del bucle de `uploadImages`, bifurcar ANTES de optimizar:

```ts
const svg = isSvg(file);
const destName = svg
  ? file
  : `${path.basename(file, path.extname(file))}.webp`;
const destPath = `${storagePath}/${destName}`;

if (DRY_RUN) {
  const kb = Math.round((await stat(filePath)).size / 1024);
  console.log(`    [dry-run] ${file.padEnd(45)} → ${BUCKET}/${destPath}  (~${kb}KB${svg ? ", svg tal cual" : " origen, se recomprime a webp"})`);
  ok++;
  continue;
}

if (svg) {
  const buffer = await readFile(filePath);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(destPath, buffer, { contentType: "image/svg+xml", upsert: true });
  if (error) { console.log(`✗  ${error.message}`); fail++; continue; }
  console.log(`✓  svg tal cual (${Math.round(buffer.length / 1024)}KB)`);
  ok++;
  continue;
}
```

(añadir `readFile` al import de `fs/promises`; `DRY_RUN` se declara a nivel de módulo: `const DRY_RUN = process.argv.includes("--dry-run");` y en `main()` solo se calcula `modeArg` filtrando flags).

- [ ] **Step 2: Modo site**

Nueva función junto a `uploadImages`:

```ts
/** Sube el contenido del staging a site/, respetando un nivel de subcarpetas. */
async function uploadSite(): Promise<void> {
  const entries = await readdir(INPUT_DIR);
  let totalOk = 0, totalFail = 0;

  // Archivos sueltos del staging → site/
  const { ok, fail } = await uploadImages(INPUT_DIR, "site");
  totalOk += ok; totalFail += fail;

  // Subcarpetas (un nivel) → site/<subcarpeta>/
  for (const entry of entries) {
    if (entry === ".gitkeep") continue;
    const fullPath = path.join(INPUT_DIR, entry);
    if ((await stat(fullPath)).isDirectory()) {
      console.log(`  📂  "${entry}"  →  ${BUCKET}/site/${entry}/`);
      const r = await uploadImages(fullPath, `site/${entry}`);
      totalOk += r.ok; totalFail += r.fail;
    }
  }

  console.log(`\n${"─".repeat(60)}\n✅  ${totalOk} subida(s)  |  ❌  ${totalFail} falla(s)${DRY_RUN ? "  (dry-run: nada se subió)" : ""}\n`);
}
```

En `main()`, antes del modo proyecto explícito:

```ts
if (modeArg === "site") {
  console.log(`\n🔧  Staging → ${BUCKET}/site/${DRY_RUN ? "  (dry-run)" : ""}\n`);
  await uploadSite();
  return;
}
```

- [ ] **Step 3: Eliminar el destino raw/**

Reemplazar el bloque final de `main()` (el de `looseImages` → `raw/`) por:

```ts
// Imágenes sueltas sin modo: destino ambiguo. raw/ se eliminó (CLAUDE.md).
if (looseImages.length > 0) {
  console.error(
    `\n❌  Hay ${looseImages.length} imagen(es) suelta(s) en el staging y ningún destino.\n` +
    `    Usa:  pnpm optimize-images <proyecto>   → project/<proyecto>/\n` +
    `          pnpm optimize-images site         → site/ (respeta subcarpetas)\n` +
    `    Añade --dry-run para previsualizar sin subir.\n`
  );
  process.exit(1);
}
console.log(`\nℹ️   Sin imágenes en scripts/images-to-upload/\n`);
```

Actualizar la cabecera del archivo (bloque de comentario inicial): documentar los tres modos (`<proyecto>`, `site`, auto por subcarpetas), el flag `--dry-run`, el passthrough de `.svg`, y eliminar toda mención a `raw/`.

- [ ] **Step 4: Verificar con dry-run**

Run: `pnpm exec tsc --noEmit && pnpm optimize-images --dry-run 2>&1 | head -8 && pnpm optimize-images site --dry-run 2>&1 | head -12`
Expected: tsc limpio; el primer comando lista los proyectos del staging actual en modo dry-run sin subir nada; el segundo lista qué iría a `site/`. Ninguna llamada de red de subida (todas las líneas llevan `[dry-run]`).

- [ ] **Step 5: Commit**

```bash
git add scripts/optimize-upload.ts
git commit -m "feat: modo site, --dry-run y passthrough SVG en el script de subida; fuera raw/"
```

---

### Task 3: Procesado one-shot de los assets (sharp) y limpieza del staging viejo

**Files:**
- Delete (git rm): `scripts/images-to-upload/<las 4 carpetas de proyectos>` (~11 MB de originales ya subidos)
- Genera (SIN commitear): `scripts/images-to-upload/{hero.webp, industrial-planta.webp, logo_datzon.svg, logo_datzon_full.svg, equipo/*.webp}`

**Interfaces:**
- Produces: el staging listo para `pnpm optimize-images site` (Task 4), con los 9 archivos y pesos dentro de objetivo.

- [ ] **Step 1: Verificar que las galerías ya están en el bucket y vaciar el staging viejo**

Con la tool MCP `mcp__supabase__execute_sql`:

```sql
select count(*) from storage.objects
where bucket_id = 'landing' and name like 'project/%';
```

Expected: **19**. Solo entonces:

```bash
git rm -r -q "scripts/images-to-upload/ELEVADORES HIDRAULICOS " "scripts/images-to-upload/PLATAFORMA GIRATORIA" "scripts/images-to-upload/Proyecto de Investigacion Marina y SNI - Pathfinder velero" "scripts/images-to-upload/SOLDADURA CON ROBOT"
ls scripts/images-to-upload/   # debe quedar solo .gitkeep
git commit -m "chore: purga del staging, los originales de las galerías ya viven en el bucket"
```

(OJO: la primera carpeta tiene un espacio final en el nombre, citar exactamente.)

- [ ] **Step 2: Descargar el hero original de Pexels**

```bash
curl -L -o /tmp/hero-pexels-34207359.jpg "https://images.pexels.com/photos/34207359/pexels-photo-34207359.jpeg"
sips -g pixelWidth -g pixelHeight /tmp/hero-pexels-34207359.jpg
```

Expected: descarga ≥ 3000 px de ancho. Si la URL directa fallara, descargar desde la página de la foto y continuar.

- [ ] **Step 3: Script one-shot de procesado (se ejecuta, no se commitea)**

Escribir este script en el scratchpad de la sesión (p. ej. `<scratchpad>/process-site.ts`) y ejecutarlo con `pnpm exec tsx <ruta>`:

```ts
import sharp from "sharp";
import { mkdir, copyFile } from "fs/promises";
import path from "path";

const OUT = path.resolve("scripts/images-to-upload");
const EQUIPO = path.join(OUT, "equipo");

async function toWebp(src: string, dest: string, width: number | null, quality: number) {
  let img = sharp(src, { failOn: "none" });
  if (width) img = img.resize({ width, withoutEnlargement: true });
  const buf = await img.webp({ quality }).toBuffer();
  await sharp(buf).toFile(dest);
  console.log(`${path.basename(dest).padEnd(28)} ${Math.round(buf.length / 1024)}KB`);
}

async function main() {
  await mkdir(EQUIPO, { recursive: true });

  // Hero: 2400px, q80, objetivo ≤ 350KB (si excede, bajar quality a 75/70 y reintentar)
  await toWebp("/tmp/hero-pexels-34207359.jpg", path.join(OUT, "hero.webp"), 2400, 80);

  // Planta (deja de ser hero, queda disponible): 1600px ≤ 150KB
  await toWebp("public/images/industrial-planta.jpg", path.join(OUT, "industrial-planta.webp"), 1600, 80);

  // Danilo: versión editada por IA (antigravity_image, inpaint localizado),
  // APROBADA por el usuario el 2026-07-26 tras verificar cara píxel-idéntica
  // (diff 0.0 en la zona facial) y esquina sin costuras. Mantiene 600×600.
  // Fuente estable dentro del workspace del plan:
  await toWebp(
    ".superpowers/sdd/2026-07-26-ciclo-1-imagenes-bucket/danilo-aprobado.png",
    path.join(EQUIPO, "danilo-luque.webp"),
    null,
    82
  );

  // Resto del equipo: webp directo (Ronald conserva su 3:4)
  await toWebp("public/equipo/Jeffry_Huanca.jpg", path.join(EQUIPO, "jeffry-huanca.webp"), null, 82);
  await toWebp("public/equipo/John_Ojeda.jpg", path.join(EQUIPO, "john-ojeda.webp"), null, 82);
  await toWebp("public/equipo/Jose_Zamora.jpg", path.join(EQUIPO, "jose-zamora.webp"), null, 82);
  await toWebp("public/equipo/Ronald_Chicche.jpg", path.join(EQUIPO, "ronald-chicche.webp"), null, 78);

  // Logos: tal cual, sin conversión
  await copyFile("public/logo_datzon.svg", path.join(OUT, "logo_datzon.svg"));
  await copyFile("public/logo_datzon_full.svg", path.join(OUT, "logo_datzon_full.svg"));
  console.log("logos copiados (svg tal cual)");
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 4: Verificación visual de Danilo, BLOQUEANTE**

Abrir/leer `scripts/images-to-upload/equipo/danilo-luque.webp` como imagen y comprobar: sin glifo en la esquina inferior derecha, 600×600, y la cara intacta (la fuente aprobada ya lo garantiza; esto verifica que la conversión a webp no rompió nada). Si la fuente `danilo-aprobado.png` no existiera (workspace del plan borrado), PARAR y avisar al orquestador, no improvisar un parche.

- [ ] **Step 5: Verificar pesos y dimensiones**

```bash
ls -la scripts/images-to-upload/ scripts/images-to-upload/equipo/
sips -g pixelWidth -g pixelHeight scripts/images-to-upload/equipo/danilo-luque.webp
```

Expected: hero ≤ 350 KB · planta ≤ 150 KB · danilo 600×600 y ~40–80 KB · ronald ≤ 100 KB · resto ~40–80 KB · 2 SVGs presentes. Si el hero excede 350 KB, regenerar con quality 75 (y 70 como último paso). Todo muy por debajo de los 2 MB del bucket.

*(Los archivos generados NO se commitean: el staging termina vacío en la Task 4.)*

---

### Task 4: Subida a `site/` y verificación del bucket

**Files:** ninguno (operación contra el bucket + limpieza del staging).

**Interfaces:**
- Consumes: el CLI `pnpm optimize-images site [--dry-run]` (Task 2) y el staging preparado (Task 3).
- Produces: los 9 objetos bajo `site/` que la Task 5 referencia por estas rutas EXACTAS: `site/hero.webp`, `site/industrial-planta.webp`, `site/logo_datzon.svg`, `site/logo_datzon_full.svg`, `site/equipo/danilo-luque.webp`, `site/equipo/jeffry-huanca.webp`, `site/equipo/john-ojeda.webp`, `site/equipo/jose-zamora.webp`, `site/equipo/ronald-chicche.webp`.

- [ ] **Step 1: Dry-run y revisión**

Run: `pnpm optimize-images site --dry-run`
Expected: lista exactamente los 9 archivos con los destinos de arriba (webp se recomprimen, svg tal cual). Cualquier ruta inesperada = corregir el staging antes de seguir.

- [ ] **Step 2: Subida real**

Run: `pnpm optimize-images site`
Expected: `9 subida(s) | 0 falla(s)`. Nota: los webp del staging se recomprimen una vez más por el pipeline del script (webp→webp q80); es una pérdida marginal aceptada, verificar en el Step 3 que los pesos finales siguen dentro de objetivo.

- [ ] **Step 3: Verificar el bucket**

`mcp__supabase__execute_sql`:

```sql
select name, (metadata->>'size')::int / 1024 as kb
from storage.objects
where bucket_id = 'landing' and name like 'site/%'
order by name;
```

Expected: exactamente las 9 rutas de Interfaces, hero ≤ 350 KB, planta ≤ 150 KB, retratos ≤ 100 KB. Y el control de las galerías:

```sql
select count(*) from storage.objects
where bucket_id = 'landing' and name like 'project/%';
```

Expected: **19** (intactas).

- [ ] **Step 4: Vaciar el staging (ahora sí)**

```bash
rm -rf scripts/images-to-upload/equipo scripts/images-to-upload/*.webp scripts/images-to-upload/*.svg
ls -la scripts/images-to-upload/   # solo .gitkeep
git status --short                 # limpio (los generados nunca se trackearon)
```

*(Sin commit: no hay cambios trackeados en esta task.)*

---

### Task 5: Componentes y config apuntan al bucket

**Files:**
- Modify: `components/HomeContent.tsx` (hero), `components/TeamContent.tsx` (5 retratos), `components/Header.tsx` y `components/Footer.tsx` (logo), `app/layout.tsx` (preconnect + JSON-LD), `next.config.ts` (unsplash fuera, SVG remoto).

**Interfaces:**
- Consumes: `siteAssetUrl` de `@/lib/site-assets` (Task 1) y las rutas exactas de la Task 4.

- [ ] **Step 1: HomeContent, hero nuevo**

En el `<Image>` del hero: `src={siteAssetUrl("hero.webp")}` (import arriba), y el `alt` pasa a describir la foto nueva: `"Robot industrial de seis ejes operando en una nave de producción"`. Se conservan `fill`, `priority`, `fetchPriority="high"`, `sizes="100vw"` y `className="object-cover grayscale"`.

- [ ] **Step 2: TeamContent, retratos**

Los cinco campos `image` pasan de `"/equipo/<Nombre>.jpg"` a `siteAssetUrl("equipo/<nombre-kebab>.webp")`:
`danilo-luque.webp`, `jeffry-huanca.webp`, `jose-zamora.webp`, `john-ojeda.webp`, `ronald-chicche.webp` (mapeo 1:1 con el miembro actual del array). Cada `objectPosition` se conserva tal cual.

- [ ] **Step 3: Header y Footer, logo**

`src="/logo_datzon.svg"` → `src={siteAssetUrl("logo_datzon.svg")}` en ambos (import de `siteAssetUrl`). `width={614} height={120}` y clases se conservan.

- [ ] **Step 4: layout, preconnect y JSON-LD**

1. En el `<head>` de `app/layout.tsx`, junto al script de JSON-LD:

```tsx
<link rel="preconnect" href="https://adnvzdcqcneqjemxneht.supabase.co" />
```

(mitiga el costo de servir la imagen LCP desde origen externo, decisión registrada en el spec).

2. En `organizationJsonLd`, el campo `logo` pasa de la URL local a la del bucket: importar `siteAssetUrl` y usar `logo: siteAssetUrl("logo_datzon.svg")`.

- [ ] **Step 5: next.config.ts, SVG remoto y limpieza**

En `images`: eliminar el remotePattern de `images.unsplash.com` (config muerta) y añadir la configuración del spec:

```ts
images: {
  dangerouslyAllowSVG: true,
  contentDispositionType: "attachment",
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  remotePatterns: [
    { protocol: "https", hostname: "adnvzdcqcneqjemxneht.supabase.co" },
  ],
},
```

Riesgo aceptado y mitigado (spec): solo la service key escribe en el bucket y el CSP de sandbox neutraliza scripts embebidos en SVG.

- [ ] **Step 6: Verificar**

Run: `pnpm exec tsc --noEmit && pnpm test && pnpm build`
Expected: verde. En dev (`pnpm dev`): la home muestra el hero nuevo (robot amarillo en B/N), `/equipo` los 5 retratos (Danilo sin glifo), logos en header y footer desde el bucket. Y:

```bash
grep -rn '"/images/\|"/equipo/\|"/logo_datzon' components/ app/ | grep -v node_modules
```

Expected: **cero** resultados (ya no hay referencias locales).

- [ ] **Step 7: Commit**

```bash
git add components/HomeContent.tsx components/TeamContent.tsx components/Header.tsx components/Footer.tsx app/layout.tsx next.config.ts
git commit -m "feat: hero, retratos y logos servidos desde el bucket (site/) con preconnect"
```

---

### Task 6: `public/` queda vacío

**Files:**
- Delete (git rm): `public/images/industrial-planta.jpg`, `public/images/industrial-robot.jpg`, `public/equipo/*.jpg` (5), `public/logo_datzon.svg`, `public/logo_datzon_full.svg`
- Delete (rm, no trackeados): `public/images/hero_v2.webp`, `public/.DS_Store`

- [ ] **Step 1: Borrar**

```bash
git rm -q public/images/industrial-planta.jpg public/images/industrial-robot.jpg public/equipo/*.jpg public/logo_datzon.svg public/logo_datzon_full.svg
rm -f public/images/hero_v2.webp public/.DS_Store
rmdir public/images public/equipo 2>/dev/null || true
ls -la public/
```

Expected: `public/` vacío (el directorio puede quedar sin contenido o desaparecer; Next lo tolera).

- [ ] **Step 2: Verificar que nada se rompió**

Run: `pnpm build && pnpm dev` (breve comprobación visual de home y /equipo, todo carga desde el bucket).
Expected: build verde; sin 404 de imágenes en la consola del navegador.

- [ ] **Step 3: Commit**

```bash
git add -A public/
git commit -m "chore: public/ queda vacío, todo el contenido editorial vive en el bucket"
```

---

### Task 7: Documentación y verificación final

**Files:**
- Modify: `CLAUDE.md` (tabla de Storage: fila `raw/` fuera, convención de subcarpetas bajo `site/`)
- Modify: `DESIGN.md` (isotipo triplicado + procedencia del hero)

- [ ] **Step 1: CLAUDE.md**

En la tabla de prefijos del bucket (sección Storage): eliminar la fila `raw/` completa. En la fila `site/` (o como nota bajo la tabla), añadir: los subdirectorios bajo `site/` son libres (`site/equipo/`, …); la regla solo fija los prefijos de primer nivel. Revisar que ninguna otra frase de la sección mencione `raw/` (el párrafo posterior a la tabla lo hace, actualizarlo: el script ya no tiene ese destino).

- [ ] **Step 2: DESIGN.md**

Añadir dos notas donde encajen con la estructura del documento:
1. El isotipo vive en 3 archivos ( `app/icon.svg` + `site/logo_datzon.svg` + `site/logo_datzon_full.svg` (bucket) ) y un cambio de marca debe tocar los tres.
2. Hero de la home: Pexels nº 34207359, licencia Pexels (uso comercial libre, sin atribución), servido desde el bucket como `site/hero.webp` (2400 px, B/N por la clase `grayscale`).

- [ ] **Step 3: Verificación final del ciclo (la lista del spec)**

```bash
pnpm exec tsc --noEmit && pnpm test && pnpm build
grep -rn '"/images/\|"/equipo/' components/ app/ | grep -v node_modules   # nada
git status --short                                                        # limpio
ls scripts/images-to-upload/                                              # solo .gitkeep
ls public/ 2>/dev/null                                                    # vacío o inexistente
```

Más la query del bucket (Task 4 Step 3) confirmando 9 en `site/` + 19 en `project/`.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md DESIGN.md
git commit -m "docs: reglas de Storage sin raw/ y procedencia del hero; isotipo triplicado anotado"
```

## Self-review (hecho al escribir)

- **Cobertura del spec:** helper + base compartida (T1) · refactor del script con los 4 cambios (T2) · procesado con pesos objetivo y parche de Danilo 600×600 (T3) · subida y verificación 9+19 (T4) · componentes, preconnect, JSON-LD, next.config con SVG (T5) · public/ vacío y muertas fuera (T6) · CLAUDE.md/DESIGN.md (T7). El estado final de assets del spec queda cubierto fila por fila.
- **Riesgo señalado:** el modo site recomprime webp→webp (pérdida marginal); anotado en T4 con verificación de pesos posterior. Alternativa (subir webp tal cual) descartada por YAGNI, tocaría más el script.
- **Placeholders:** las coordenadas del parche de Danilo son estimadas a propósito con iteración visual BLOQUEANTE (T3 Step 4), es verificación, no hueco.
- **Consistencia:** `siteAssetUrl`/`STORAGE_PUBLIC_BASE` idénticos en T1 y T5; las 9 rutas de T4 coinciden 1:1 con los `siteAssetUrl(...)` de T5.
