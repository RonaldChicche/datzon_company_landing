# Página /robotica «Sala de control» · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el simulador 2D de `/robotica` por la «sala de control»: un escenario de vídeo con conmutador de demos, copy de venta por proyección y lista abierta de 10 aplicaciones ilustradas, según `docs/superpowers/specs/2026-08-02-robotica-sala-de-control-design.md`.

**Architecture:** Un módulo de datos puro (`lib/robotica-demos.ts`) alimenta dos client components (`DemoPlayer`, `DemoStudio`); la página sigue siendo Server Component y renderiza cabecera, estudio, lista de aplicaciones y CTA. Los estilos van en `app/globals.css` con los tokens existentes del `@theme`. Los assets (vídeos 1080p, posters, 10 ilustraciones) se sirven desde el bucket `landing` bajo `site/robotica/`.

**Tech Stack:** Next.js 16 App Router, React 19, CSS en globals (convención del proyecto), vitest para lógica, Supabase Storage.

## Global Constraints

- **Prohibida la raya larga (em dash)** en cualquier archivo. Sustituir por coma, dos puntos o paréntesis.
- **Prohibido «EN CICLO»** y cualquier badge/LED equivalente.
- **Prohibido nombrar modelos de robot** en copy público: nada de «FR10», «FAIRINO» ni «seis articulaciones».
- **Sin badges «en producción»** para demos futuras.
- Server Components por defecto; `"use client"` solo donde hay hooks o eventos.
- Imágenes siempre con `next/image`; URLs de assets con `siteAssetUrl()` de `lib/site-assets.ts`.
- Accesibilidad: todo interactivo navegable por teclado con foco visible; respetar `prefers-reduced-motion`.
- Referencia visual vinculante: maqueta `v8-lista-abierta` (artifact 0a0eef09; plantilla respaldada en `~/.claude/projects/-Users-ronaldc-Documents-DatzonCompany-datzon-company-landing/memory/templates/mockups/template_robotica.html`). Copiar de ahí valores exactos de CSS cuando haya duda.
- Los vídeos de reproductor no pueden afectar el LCP: `preload="metadata"`, poster JPEG, alto reservado por `aspect-ratio`.

**Prerequisito de assets:** la cola `render_cola_web.sh` debe haber producido `~/Documents/DatzonCompany/robot_blender/salidas/web/{soldadura,servicio,paletizado}_1080.mp4` (sin franjas). Si algún archivo supera ~25 MB, reexportar con `R_SAMPLES` menor o CRF `MEDIUM` antes de subir.

---

### Task 1: Módulo de datos de las demos y aplicaciones

**Files:**
- Create: `lib/robotica-demos.ts`
- Test: `lib/robotica-demos.test.ts`

**Interfaces:**
- Consumes: `siteAssetUrl(file: string): string` de `@/lib/site-assets`.
- Produces: `type Demo = { id: "paletizado" | "soldadura" | "servicio"; nombre: string; aplicacion: string; etiqueta: string; gancho: string; parrafo: string; variantesTitulo: string; variantes: string[]; video: string; poster: string }`, `const DEMOS: Demo[]` (3 elementos, en ese orden), `type Aplicacion = { nombre: string; linea: string; imagen: string }`, `const APLICACIONES: Aplicacion[]` (10 elementos).

- [ ] **Step 1: Escribir los tests que fallan** (incluyen las reglas duras del copy como tests permanentes)

```ts
// lib/robotica-demos.test.ts
import { describe, expect, it } from "vitest";
import { DEMOS, APLICACIONES } from "./robotica-demos";

const textos = () =>
  [
    ...DEMOS.flatMap((d) => [d.nombre, d.aplicacion, d.etiqueta, d.gancho, d.parrafo, d.variantesTitulo, ...d.variantes]),
    ...APLICACIONES.flatMap((a) => [a.nombre, a.linea]),
  ].join(" ");

describe("robotica-demos", () => {
  it("tiene 3 demos en el orden del spec y 10 aplicaciones", () => {
    expect(DEMOS.map((d) => d.id)).toEqual(["paletizado", "soldadura", "servicio"]);
    expect(APLICACIONES).toHaveLength(10);
  });

  it("cada demo apunta a assets del bucket bajo site/robotica/", () => {
    for (const d of DEMOS) {
      expect(d.video).toContain("/site/robotica/");
      expect(d.video).toMatch(/\.mp4$/);
      expect(d.poster).toContain("/site/robotica/");
    }
    for (const a of APLICACIONES) expect(a.imagen).toContain("/site/robotica/apps/");
  });

  it("cada demo cierra sus variantes con el chip de contacto", () => {
    for (const d of DEMOS) expect(d.variantes.at(-1)).toBe("¿El tuyo?");
  });

  it("reglas duras: sin raya larga, sin EN CICLO, sin modelos de robot", () => {
    const t = textos();
    expect(t).not.toContain("\u2014"); // raya larga (escape para no escribirla)
    expect(t.toUpperCase()).not.toContain("EN CICLO");
    for (const prohibido of ["FR10", "FAIRINO", "seis articulaciones"]) {
      expect(t).not.toContain(prohibido);
    }
  });
});
```

- [ ] **Step 2: Verificar que fallan**

Run: `pnpm vitest run lib/robotica-demos.test.ts`
Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Implementar el módulo** (copy exacto del spec)

```ts
// lib/robotica-demos.ts
// Datos de la página /robotica (sala de control). El copy es el del spec
// 2026-08-02-robotica-sala-de-control-design.md; los tests de este módulo
// codifican las reglas duras de Ronald y no deben relajarse.
import { siteAssetUrl } from "@/lib/site-assets";

export type Demo = {
  id: "paletizado" | "soldadura" | "servicio";
  nombre: string;
  aplicacion: string;
  etiqueta: string;
  gancho: string;
  parrafo: string;
  variantesTitulo: string;
  variantes: string[];
  video: string;
  poster: string;
};

const demo = (
  id: Demo["id"], n: number, nombre: string, aplicacion: string,
  gancho: string, parrafo: string, variantesTitulo: string, variantes: string[],
): Demo => ({
  id, nombre, aplicacion,
  etiqueta: `Demo 0${n} · ${nombre}`,
  gancho, parrafo, variantesTitulo,
  variantes: [...variantes, "¿El tuyo?"],
  video: siteAssetUrl(`robotica/${id}.mp4`),
  poster: siteAssetUrl(`robotica/${id}-poster.jpg`),
});

export const DEMOS: Demo[] = [
  demo("paletizado", 1, "Paletizado", "Fin de línea",
    "Del envasado al despacho, sin manos.",
    "Una estación envasa y tapa; la otra carga las cajas al carro. El patrón, el ritmo y el formato se adaptan a tu producto; el brazo es el mismo.",
    "El mismo brazo, otros formatos",
    ["Cajas", "Sacos", "Bidones", "Bandejas", "Patrón a pedido"]),
  demo("soldadura", 2, "Soldadura", "Uniones repetibles",
    "El mismo cordón, turno tras turno.",
    "La antorcha avanza con velocidad y ángulo constantes donde una mano se fatiga. Menos retrabajos, acabado uniforme, trazabilidad de cada unión.",
    "Cambia el efector, cambia el proceso",
    ["MIG", "TIG", "Por puntos", "Plasma", "Corte"]),
  demo("servicio", 3, "Manipulación delicada", "Piezas frágiles",
    "Si sirve una cerveza sin romper el vaso, puede con tu pieza más delicada.",
    "Agarre calibrado sobre el cristal y vertido controlado desde la muñeca: fuerza y orientación bajo control durante todo el ciclo.",
    "La misma delicadeza para",
    ["Vidrio", "Cerámica", "Alimentos", "Electrónica", "Empaques"]),
];

export type Aplicacion = { nombre: string; linea: string; imagen: string };

const app = (archivo: string, nombre: string, linea: string): Aplicacion => ({
  nombre, linea, imagen: siteAssetUrl(`robotica/apps/${archivo}.jpg`),
});

export const APLICACIONES: Aplicacion[] = [
  app("paletizado", "Paletizado", "Fin de línea y alto volumen sin cuellos de botella."),
  app("soldadura", "Soldadura", "MIG/TIG con repetibilidad que no depende del turno."),
  app("pick-place", "Pick & place", "Clasificación y empaque a ritmo de línea."),
  app("pintura", "Pintura", "Acabado uniforme, pasada tras pasada."),
  app("manipulacion", "Manipulación", "Cargas pesadas o piezas frágiles, con la misma calma."),
  app("inspeccion", "Inspección", "Visión artificial montada donde haga falta mirar."),
  app("mecanizado", "Mecanizado", "Fresado y taladrado con precisión que no se negocia."),
  app("corte", "Corte", "Plasma o láser siguiendo la trayectoria exacta."),
  app("pulido", "Pulido", "Superficies uniformes sin brazos cansados."),
  app("dosificacion", "Dosificación", "El cordón justo de adhesivo o sellador, siempre."),
];
```

- [ ] **Step 4: Verificar que pasan**

Run: `pnpm vitest run lib/robotica-demos.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/robotica-demos.ts lib/robotica-demos.test.ts
git commit -m "feat: datos de las demos y aplicaciones de /robotica con las reglas de copy como tests"
```

---

### Task 2: Utilidad de timecode

**Files:**
- Create: `lib/video-time.ts`
- Test: `lib/video-time.test.ts`

**Interfaces:**
- Produces: `formatTime(segundos: number): string` (formato `mm:ss`; valores no finitos o negativos devuelven `"00:00"`).

- [ ] **Step 1: Test que falla**

```ts
// lib/video-time.test.ts
import { expect, it } from "vitest";
import { formatTime } from "./video-time";

it("formatea segundos como mm:ss", () => {
  expect(formatTime(0)).toBe("00:00");
  expect(formatTime(7.9)).toBe("00:07");
  expect(formatTime(65)).toBe("01:05");
  expect(formatTime(600)).toBe("10:00");
});

it("tolera NaN, Infinity y negativos", () => {
  expect(formatTime(NaN)).toBe("00:00");
  expect(formatTime(Infinity)).toBe("00:00");
  expect(formatTime(-3)).toBe("00:00");
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm vitest run lib/video-time.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementación mínima**

```ts
// lib/video-time.ts
/** mm:ss para timecodes de vídeo. Números no finitos o negativos: "00:00". */
export function formatTime(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return "00:00";
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm vitest run lib/video-time.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/video-time.ts lib/video-time.test.ts
git commit -m "feat: formatTime para los timecodes del reproductor"
```

---

### Task 3: Subir los assets al bucket (vídeos, posters, ilustraciones)

**Files:**
- Create: `scripts/upload-robotica-assets.ts`
- Modify: `scripts/supabase-storage-rls.sql` (documentar el nuevo `file_size_limit`)
- Modify: `CLAUDE.md` (línea del límite de 2 MB del bucket)

**Interfaces:**
- Consumes: credencial `sb_secret_…` desde `.env.local` (patrón de `scripts/optimize-upload.ts`), `assertDatzonProject` de `lib/supabase/project.ts`.
- Produces: objetos públicos `site/robotica/{paletizado,soldadura,servicio}.mp4`, `site/robotica/{...}-poster.jpg` y `site/robotica/apps/{paletizado,soldadura,pick-place,pintura,manipulacion,inspeccion,mecanizado,corte,pulido,dosificacion}.jpg`, exactamente los nombres que consume `lib/robotica-demos.ts` (Task 1).

**Nota:** el bucket tiene `file_size_limit` de 2 MB, deliberadamente estricto para imágenes. Los MP4 de 1080p lo superan; este task lo sube a **30 MB** y lo deja documentado. Es la única forma de cumplir el spec (vídeos en `site/robotica/`).

- [ ] **Step 1: Subir el límite del bucket a 30 MB**

Con el MCP de Supabase del proyecto (o el dashboard): `update_storage_config` del bucket `landing` a `file_size_limit = 31457280`. Verificar con `get_storage_config` que quedó aplicado.

- [ ] **Step 2: Documentar el cambio**

En `scripts/supabase-storage-rls.sql` añadir al bloque descriptivo: `-- file_size_limit: 30 MB desde 2026-08-02 (los MP4 de /robotica pesan varios MB; las imágenes siguen debiendo optimizarse a <2 MB por convención).` En `CLAUDE.md`, actualizar la línea «El bucket tiene un límite de 2 MB por archivo» a 30 MB con la misma aclaración de que la convención para imágenes sigue siendo <2 MB.

- [ ] **Step 3: Preparar el staging local**

```bash
mkdir -p /tmp/robotica-assets/apps
cp ~/Documents/DatzonCompany/robot_blender/salidas/web/paletizado_1080.mp4 /tmp/robotica-assets/paletizado.mp4
cp ~/Documents/DatzonCompany/robot_blender/salidas/web/soldadura_1080.mp4  /tmp/robotica-assets/soldadura.mp4
cp ~/Documents/DatzonCompany/robot_blender/salidas/web/servicio_1080.mp4   /tmp/robotica-assets/servicio.mp4
# posters: fotograma central de cada mp4
python3 - <<'PY'
import cv2
for n in ["paletizado", "soldadura", "servicio"]:
    cap = cv2.VideoCapture(f"/tmp/robotica-assets/{n}.mp4")
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) // 2)
    ok, img = cap.read(); assert ok, n
    cv2.imwrite(f"/tmp/robotica-assets/{n}-poster.jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 85])
PY
# ilustraciones (versiones web de 600 px, respaldadas junto a la memoria)
SRC=~/.claude/projects/-Users-ronaldc-Documents-DatzonCompany-datzon-company-landing/memory/templates/mockups/apps
cp $SRC/paletizado_w.jpg   /tmp/robotica-assets/apps/paletizado.jpg
cp $SRC/soldadura_w.jpg    /tmp/robotica-assets/apps/soldadura.jpg
cp $SRC/pickplace_w.jpg    /tmp/robotica-assets/apps/pick-place.jpg
cp $SRC/pintura_w.jpg      /tmp/robotica-assets/apps/pintura.jpg
cp $SRC/manipulacion_w.jpg /tmp/robotica-assets/apps/manipulacion.jpg
cp $SRC/inspeccion_w.jpg   /tmp/robotica-assets/apps/inspeccion.jpg
cp $SRC/mecanizado_w.jpg   /tmp/robotica-assets/apps/mecanizado.jpg
cp $SRC/corte_w.jpg        /tmp/robotica-assets/apps/corte.jpg
cp $SRC/pulido_w.jpg       /tmp/robotica-assets/apps/pulido.jpg
cp $SRC/dosificacion_w.jpg /tmp/robotica-assets/apps/dosificacion.jpg
ls -la /tmp/robotica-assets /tmp/robotica-assets/apps
```

Si algún mp4 supera 25 MB, detenerse y reexportar antes de subir.

- [ ] **Step 4: Escribir el script de subida**

```ts
// scripts/upload-robotica-assets.ts
// Sube los assets de /robotica al bucket landing bajo site/robotica/.
// Uso: pnpm tsx scripts/upload-robotica-assets.ts
// Credencial secreta SOLO aquí (convención de scripts/, ver CLAUDE.md).
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { loadEnvConfig } from "@next/env";
import { assertDatzonProject } from "../lib/supabase/project";

loadEnvConfig(process.cwd());
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Faltan SUPABASE_URL o la credencial secreta en .env.local");
assertDatzonProject(url);

const supabase = createClient(url, key);
const STAGING = "/tmp/robotica-assets";

const contentType = (f: string) =>
  f.endsWith(".mp4") ? "video/mp4" : f.endsWith(".jpg") ? "image/jpeg" : "application/octet-stream";

async function subir(local: string, remoto: string) {
  const bytes = readFileSync(local);
  const { error } = await supabase.storage
    .from("landing")
    .upload(remoto, bytes, { contentType: contentType(local), upsert: true });
  if (error) throw new Error(`${remoto}: ${error.message}`);
  console.log(`ok  ${remoto}  ${(statSync(local).size / 1e6).toFixed(1)} MB`);
}

async function main() {
  for (const f of readdirSync(STAGING)) {
    if (f === "apps") continue;
    await subir(join(STAGING, f), `site/robotica/${f}`);
  }
  for (const f of readdirSync(join(STAGING, "apps"))) {
    await subir(join(STAGING, "apps", f), `site/robotica/apps/${f}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
```

Nota: si `@next/env` no está disponible, replicar la carga de `.env.local` tal como lo hace `scripts/optimize-upload.ts` (mismo patrón del repo; consultarlo antes de inventar otro).

- [ ] **Step 5: Ejecutar y verificar**

Run: `pnpm tsx scripts/upload-robotica-assets.ts`
Expected: 16 líneas `ok`.
Verificar en público (sin credencial):
`curl -sI https://adnvzdcqcneqjemxneht.supabase.co/storage/v1/object/public/landing/site/robotica/soldadura.mp4 | head -3` responde `200` y `content-type: video/mp4`; ídem una ilustración.

- [ ] **Step 6: Commit**

```bash
git add scripts/upload-robotica-assets.ts scripts/supabase-storage-rls.sql CLAUDE.md
git commit -m "feat: subida de assets de /robotica al bucket y limite de 30 MB documentado"
```

---

### Task 4: Estilos de la sala de control en globals.css

**Files:**
- Modify: `app/globals.css` (añadir un bloque nuevo al final, sección comentada `/* ROBOTICA · SALA DE CONTROL */`)

**Interfaces:**
- Produces: clases `.rb-head`, `.rb-head-glow`, `.rb-studio`, `.rb-stage`, `.rb-scene`, `.rb-player`, `.rb-player-tag`, `.rb-player-bar`, `.rb-pp`, `.rb-scrub`, `.rb-scrub-track`, `.rb-scrub-fill`, `.rb-tc`, `.rb-copy`, `.rb-hook`, `.rb-variants`, `.rb-chips`, `.rb-chip`, `.rb-chip--mas`, `.rb-rail`, `.rb-rail-cap`, `.rb-chan`, `.rb-chan-thumb`, `.rb-apps-grid`, `.rb-app`, `.rb-app-ill`, usadas por Tasks 5 a 7.

- [ ] **Step 1: Añadir el bloque de estilos**

Traducir el CSS de la maqueta (plantilla respaldada, secciones `head`, `studio`, `player`, `rail`, `open-grid`) usando los tokens del `@theme` ya definidos: `--bg-2` para fondos oscuros profundos, `--surface`/`--surface-2` para contenedores, `--line`/`--line-2` para hairlines, `--ink`/`--muted` para texto, `--lime`/`--lime-2`/`--lime-dim` para el acento, `--green-deep`, `--paper`, `--ink-d`, `--muted-d`, `--muted-d2`, `--card`, `--line-d` para la sección de papel, y `--font-display`/`--font-sans`/`--font-mono` para las voces. Valores no tokenizados (tamaños, radios 4/8 px, rejilla de papel de 42 px) van literales como en la maqueta. Puntos que no se pueden perder:

```css
/* extracto de referencia; el bloque completo replica la maqueta v8 */
.rb-head { background: var(--bg-2); position: relative; overflow: hidden; }
.rb-head-glow { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(800px 360px at 90% -20%, var(--lime-dim), transparent 60%); }
.rb-studio { display: grid; grid-template-columns: minmax(0, 1fr) 348px; gap: 28px; align-items: start; }
.rb-scene { display: none; }
.rb-scene.on { display: block; animation: rb-fadein .45s cubic-bezier(.2,.7,.2,1); }
.rb-player video { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; cursor: pointer; }
.rb-scrub { flex: 1; padding: 8px 0; cursor: pointer; touch-action: none; }
.rb-chan.on::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--lime); }
.rb-rail-cap { font-family: var(--font-display); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }
.rb-hook { font-family: var(--font-mono); font-weight: 600; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink); line-height: 1.9; }
.rb-apps-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; row-gap: 56px; }
.rb-app { display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: 24px; align-items: center; }
.rb-app-ill { mix-blend-mode: multiply; border-radius: 6px; }
@media (max-width: 960px) { .rb-studio { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .rb-apps-grid { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .rb-scene.on { animation: none; } }
```

- [ ] **Step 2: Verificar que compila**

Run: `pnpm build`
Expected: build sin errores (los estilos aún no se usan; solo valida el CSS).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: estilos de la sala de control de /robotica"
```

---

### Task 5: Componente DemoPlayer

**Files:**
- Create: `components/robotica/DemoPlayer.tsx`

**Interfaces:**
- Consumes: `formatTime` (Task 2); clases `.rb-player*`, `.rb-pp`, `.rb-scrub*`, `.rb-tc` (Task 4).
- Produces: `DemoPlayer({ src, poster, etiqueta, activo }: { src: string; poster: string; etiqueta: string; activo: boolean })`, client component. Reproduce solo si `activo` y el elemento está a la vista; pausa al desactivarse.

- [ ] **Step 1: Implementar el componente**

```tsx
// components/robotica/DemoPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/video-time";

type Props = { src: string; poster: string; etiqueta: string; activo: boolean };

export default function DemoPlayer({ src, poster, etiqueta, activo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const [pausado, setPausado] = useState(true);
  const [actual, setActual] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [visible, setVisible] = useState(false);

  // visibilidad del reproductor (no reproducir fuera de pantalla)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // reproducir solo si la demo esta activa, visible y sin reduced motion
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (activo && visible && !reducido) v.play().catch(() => setPausado(true));
    else v.pause();
  }, [activo, visible]);

  const alternar = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setPausado(true));
    else v.pause();
  };

  const buscar = (clientX: number) => {
    const v = videoRef.current, s = scrubRef.current;
    if (!v || !s || !v.duration) return;
    const r = s.getBoundingClientRect();
    v.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * v.duration;
    setActual(v.currentTime);
  };

  const onScrubPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const s = scrubRef.current;
    if (!s) return;
    s.setPointerCapture(e.pointerId);
    buscar(e.clientX);
    const mover = (ev: PointerEvent) => buscar(ev.clientX);
    s.addEventListener("pointermove", mover);
    s.addEventListener("pointerup", () => s.removeEventListener("pointermove", mover), { once: true });
  };

  const onScrubKeyDown = (e: React.KeyboardEvent) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    if (e.key === "ArrowRight") { v.currentTime = Math.min(v.duration, v.currentTime + 1); setActual(v.currentTime); }
    if (e.key === "ArrowLeft") { v.currentTime = Math.max(0, v.currentTime - 1); setActual(v.currentTime); }
  };

  const progreso = duracion ? (actual / duracion) * 100 : 0;

  return (
    <div className="rb-player">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={etiqueta}
        onClick={alternar}
        onPlay={() => setPausado(false)}
        onPause={() => setPausado(true)}
        onTimeUpdate={(e) => setActual(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuracion(e.currentTarget.duration)}
      />
      <span className="rb-player-tag">{etiqueta}</span>
      <div className="rb-player-bar">
        <button
          type="button"
          className="rb-pp"
          aria-label={pausado ? "Reproducir" : "Pausar"}
          onClick={alternar}
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            {pausado
              ? <path d="M2 0l9 6-9 6z" fill="currentColor" />
              : <path d="M1 0h3v12H1zM8 0h3v12H8z" fill="currentColor" />}
          </svg>
        </button>
        <div
          ref={scrubRef}
          className="rb-scrub"
          role="slider"
          aria-label="Posición del vídeo"
          aria-valuemin={0}
          aria-valuemax={Math.round(duracion)}
          aria-valuenow={Math.round(actual)}
          tabIndex={0}
          onPointerDown={onScrubPointerDown}
          onKeyDown={onScrubKeyDown}
        >
          <span className="rb-scrub-track"><i className="rb-scrub-fill" style={{ width: `${progreso}%` }} /></span>
        </div>
        <span className="rb-tc">
          <b>{formatTime(actual)}</b> / {formatTime(duracion)}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/robotica/DemoPlayer.tsx
git commit -m "feat: reproductor de demos con timeline arrastrable y autoplay respetuoso"
```

---

### Task 6: Componente DemoStudio (conmutador)

**Files:**
- Create: `components/robotica/DemoStudio.tsx`

**Interfaces:**
- Consumes: `DEMOS`, `type Demo` (Task 1); `DemoPlayer` (Task 5); clases `.rb-studio`, `.rb-stage`, `.rb-scene`, `.rb-copy`, `.rb-hook`, `.rb-variants`, `.rb-chips`, `.rb-chip`, `.rb-chip--mas`, `.rb-rail*`, `.rb-chan*` (Task 4).
- Produces: `DemoStudio()`, client component sin props; se monta una sola vez en la página.

- [ ] **Step 1: Implementar el componente**

```tsx
// components/robotica/DemoStudio.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { DEMOS } from "@/lib/robotica-demos";
import DemoPlayer from "@/components/robotica/DemoPlayer";

export default function DemoStudio() {
  const [activa, setActiva] = useState(DEMOS[0].id);

  return (
    <div className="rb-studio">
      <div className="rb-stage">
        {DEMOS.map((d) => (
          <div key={d.id} className={`rb-scene${d.id === activa ? " on" : ""}`}>
            <DemoPlayer src={d.video} poster={d.poster} etiqueta={d.etiqueta} activo={d.id === activa} />
            <div className="rb-copy">
              <p className="rb-hook">{d.gancho}</p>
              <p>{d.parrafo}</p>
              <div className="rb-variants">
                <p className="rb-variants-titulo">{d.variantesTitulo}</p>
                <div className="rb-chips">
                  {d.variantes.map((v) => (
                    <span key={v} className={`rb-chip${v === "¿El tuyo?" ? " rb-chip--mas" : ""}`}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="rb-rail" aria-label="Selector de demos">
        <p className="rb-rail-cap">Elige tu aplicación</p>
        {DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`rb-chan${d.id === activa ? " on" : ""}`}
            aria-pressed={d.id === activa}
            onClick={() => setActiva(d.id)}
          >
            <Image src={d.poster} alt="" width={96} height={54} className="rb-chan-thumb" />
            <span>
              <span className="rb-chan-nombre">{d.nombre}</span>
              <span className="rb-chan-app">{d.aplicacion}</span>
            </span>
          </button>
        ))}
        <p className="rb-rail-nota">Más demos en camino.<br />¿Quieres ver tu proceso aquí? →</p>
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/robotica/DemoStudio.tsx
git commit -m "feat: conmutador de demos de la sala de control"
```

---

### Task 7: Reescribir la página /robotica y verificación final

**Files:**
- Modify: `app/robotica/page.tsx` (reescritura completa; `PalletizerSim` deja de importarse pero su archivo se queda)
- Test: verificación visual y de build (no hay test unitario de página)

**Interfaces:**
- Consumes: `DemoStudio` (Task 6), `APLICACIONES` (Task 1), clases `.rb-*` (Task 4), `next/image`.

- [ ] **Step 1: Reescribir la página**

```tsx
// app/robotica/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import DemoStudio from "@/components/robotica/DemoStudio";
import { APLICACIONES } from "@/lib/robotica-demos";

export const metadata: Metadata = {
  title: "Robótica",
  description:
    "Un robot para cada proceso: demos de paletizado, soldadura y manipulación delicada calculadas con cinemática real. Robótica industrial por Datzon.",
};

export default function RoboticaPage() {
  return (
    <>
      <section className="rb-head">
        <div className="rb-head-glow" aria-hidden="true" />
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link> / Robótica
          </div>
          <h1>
            Un robot para <span className="accent">cada proceso</span>
          </h1>
          <p className="lead">
            Imagina tu planta con <strong>un turno que nunca se cansa</strong>: cajas
            que se apilan solas, cordones perfectos, piezas frágiles intactas. Elige
            una aplicación y mírala en marcha. Todo lo que ves se puede construir en
            tu línea.
          </p>
        </div>
      </section>

      <section className="rb-estudio-seccion">
        <div className="wrap">
          <DemoStudio />
        </div>
      </section>

      <section className="section-light solid rb-apps">
        <div className="wrap sec">
          <span className="kicker">¿Y en tu planta?</span>
          <h2>Proyecta tu proceso</h2>
          <p className="rb-apps-sub">
            No nos casamos con un modelo: trabajamos con todo tipo de robots
            industriales y elegimos cada uno según tu carga, tu alcance y tu ritmo.
            Estas son las puertas de entrada más habituales:
          </p>
          <div className="rb-apps-grid">
            {APLICACIONES.map((a) => (
              <div key={a.nombre} className="rb-app">
                <div>
                  <h3>{a.nombre}</h3>
                  <p>{a.linea}</p>
                </div>
                <Image src={a.imagen} alt="" width={190} height={190} className="rb-app-ill" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <span className="kicker">¿Cuál de estas celdas se parece a tu proceso?</span>
          <h2>Hablemos de tu línea</h2>
          <p className="rb-cta-p">
            Cuéntanos qué haces a mano hoy y te decimos qué puede hacer un robot
            mañana, con números y no promesas.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/#cotizar" className="btn btn-dark" id="robotica-cta-cotizar">
              Solicitar diagnóstico <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
```

Ajustar clases de cabecera/CTA a las existentes del sitio (`.breadcrumb`, `.lead`, `.kicker`, `.cta-band`, `.btn`) y añadir en el bloque CSS de Task 4 lo que falte (`.rb-estudio-seccion`, `.rb-apps-sub`, `.rb-cta-p`). Si `.section-light` impone rejilla de papel distinta a la maqueta, prevalece la maqueta.

- [ ] **Step 2: Suite completa y build**

Run: `pnpm vitest run && pnpm tsc --noEmit && pnpm build`
Expected: todo verde.

- [ ] **Step 3: Verificación visual contra la maqueta**

Run: `pnpm dev`, abrir `http://localhost:3000/robotica` con Playwright/Chrome DevTools MCP.
Comparar con la maqueta v8 en 1280 px y en 375 px: cabecera con glow, conmutador funcional (clic en Soldadura cambia vídeo y copy), timeline arrastrable, lista abierta con 10 ilustraciones, CTA. Capturar pantallas y revisarlas.

- [ ] **Step 4: Reglas duras sobre el HTML servido**

Run: `curl -s http://localhost:3000/robotica | grep -c "$(printf '\xe2\x80\x94')\|EN CICLO\|FR10\|FAIRINO"` (el printf produce la raya larga sin escribirla)
Expected: `0`.

- [ ] **Step 5: Accesibilidad de teclado**

Con el navegador: Tab recorre canales y controles del reproductor con foco visible; Enter activa canal; flechas mueven el timeline. Verificar también que con `prefers-reduced-motion` los vídeos no arrancan solos (emular en DevTools).

- [ ] **Step 6: Commit**

```bash
git add app/robotica/page.tsx app/globals.css
git commit -m "feat: /robotica se convierte en la sala de control con demos en video"
```

---

### Task 8: Rendimiento y cierre

**Files:**
- Modify: solo si la medición lo exige.

- [ ] **Step 1: Medir LCP y CLS de /robotica**

Con Chrome DevTools MCP (`performance_start_trace` sobre `http://localhost:3000/robotica`, red Fast 4G): LCP < 2,5 s (el LCP debe ser el H1 o el glow, nunca un fotograma de vídeo), CLS < 0,1 (el `aspect-ratio` del reproductor reserva el hueco).

- [ ] **Step 2: Si el vídeo activo compite con el LCP**

Cambiar el `preload` del vídeo activo a `none` y arrancar la carga en el primer `IntersectionObserver` hit; repetir la medición.

- [ ] **Step 3: Actualizar el grafo y cerrar**

```bash
graphify update .
git add -A && git commit -m "chore: ajustes de rendimiento de /robotica" || echo "sin cambios"
```

---

## Self-review

- **Cobertura del spec:** cabecera+glow+copy (T7), estudio/conmutador (T5-T6), variantes con «¿El tuyo?» (T1/T6), lista abierta con 10 apps ilustradas (T1/T7), CTA (T7), reproductor con timeline arrastrable y reduced-motion (T5), assets al bucket con nombres exactos (T3), reglas duras como tests (T1) y como verificación del HTML servido (T7.4), criterios de aceptación 1-5 (T7.3-T7.5, T8, PalletizerSim fuera en T7).
- **Placeholders:** ninguno; todos los pasos llevan código o comando concreto. El único punto abierto declarado es el patrón de carga de `.env.local` en T3, que remite a `scripts/optimize-upload.ts` como fuente.
- **Consistencia de tipos:** `Demo`/`DEMOS`/`APLICACIONES` (T1) coinciden con los consumos de T6 y T7; `formatTime` (T2) con T5; nombres de archivo del bucket (T3) con las URLs de T1.
