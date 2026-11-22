# Diseño: página "Proyectos y demos"

Fecha: 2026-11-21 · Estado: borrador para aprobación de Ronald

## Intención

La página `/proyectos` hoy no transmite credibilidad: la tarjeta "Celda robótica de soldadura" usa fotos de WhatsApp de un proyecto que no corresponde, las imágenes tienen formatos distintos y algunas carecen de contexto. El único vídeo propio (la demo de soldadura robotizada) no aparece. Objetivo: que lo primero que vea un visitante sea esa demo, en vídeo y con fotos reales, y que el resto de trabajos se vea ordenado.

## Decidido con Ronald

- Título de la página: **"Proyectos y demos"**. La URL sigue siendo `/proyectos` y el menú dice "Proyectos".
- Orden del menú: Inicio, **Proyectos, Robótica**, Equipo (proyectos pasa a segunda).
- **Destacado arriba:** "Demo · Soldadura robotizada", con el vídeo y una galería de fotos reales.
- Sale la tarjeta "Celda robótica de soldadura" y sus fotos.
- Quedan, debajo: Elevadores hidráulicos, Plataforma giratoria, Pathfinder.
- Las demos de Blender se quedan en `/robotica`; no se enlazan como demos aquí.
- Imágenes, enfoque **A**: tarjeta cuadrada con recorte y punto de enfoque por portada; en la galería se ve la foto completa.
- Fuera de alcance ahora: corte láser (se añade la próxima semana, sin tarjeta "próximamente"), retoques con IA de la plataforma giratoria y del resto.

## Enfoques considerados (imágenes)

| | Qué hace | Por qué no / por qué sí |
|---|---|---|
| **A (elegido)** | Recorte cuadrado solo en la tarjeta (CSS `aspect-ratio: 1` + `object-position` por portada); galería con la foto entera | Uniforme sin perder contexto; deja abiertos los retoques con IA |
| B | Reexportar todas las fotos en 1:1 | En fotos de WhatsApp el recorte se come la escena, que es justo lo que les falta |

## Diseño

### Datos (`lib/projects.ts`)

- `Project` gana `kind: "proyecto" | "demo"` y `focus?: string` (valor de `object-position` de la portada, p. ej. `"50% 30%"`).
- Nuevo `FEATURED`: el destacado de soldadura, con `youtubeId`, `poster` (fotograma propio) y sus imágenes.
- Se borra la entrada `soldadura-con-robot`. Sus archivos en el bucket no se borran en este cambio (borrar es irreversible; se decide aparte).

### Vídeo: fachada de YouTube

- Vídeo "Cobot Welding" del canal Datzon Robotics (`zvhX8jre5Nk`).
- Se muestra un póster propio (fotograma de la GoPro, servido desde el bucket con `next/image`) con botón de play. El reproductor de YouTube solo se carga al hacer clic, desde `www.youtube-nocookie.com`, con `autoplay=1`.
- CSP en `proxy.ts`: añadir `frame-src https://www.youtube-nocookie.com`. Nada más.
- Botón accesible ("Reproducir el vídeo de la demo de soldadura") y enlace de respaldo "Ver en YouTube" con `rel="noopener noreferrer"`.
- Cuando la promo recreada esté cerrada, se cambia solo el `youtubeId` (o se pasa a vídeo propio).

### Fotos de la demo de soldadura

- Fuente: `datzon_company_brochure/01_fuentes/` (16 fotos y los vídeos de GoPro 5,3K del 7 de noviembre).
- Se extraen fotogramas nítidos de la GoPro con ffmpeg y se combinan con las mejores fotos (GOPR0470/0473/0475, IMG_0959, PXL_200614253, PXL_201120128). Selección final: 6 a 8 imágenes.
- Exclusiones: planos del soldador en short; ningún texto ni nombre de modelo del robot.
- Se suben con `pnpm optimize-images` al prefijo `project/soldadura-robotizada/` (< 2 MB cada una).

### Proyectos existentes

- Elevadores: la foto IMG-20240716-WA0003 pasa a ser la portada; se quita IMG-20230209-WA0057 (sin contexto); IMG-20230523-WA0020 se endereza y se resube.
- Plataforma giratoria y Pathfinder: se elige la mejor portada y su punto de enfoque; sin retoques.

### Página

```
PROYECTOS Y DEMOS                         (cabecera actual, nuevo título y texto)
┌ DESTACADO · DEMO ─────────────────────────────────┐
│ Soldadura robotizada                               │
│ [▶ vídeo 16:9]        [■][■][■] miniaturas fotos   │
└────────────────────────────────────────────────────┘
[■ Elevadores]   [■ Plataforma giratoria]   [■ Pathfinder]   ← tarjetas cuadradas
CTA "¿Tienes un reto de automatización?" (igual que hoy)
```

- El destacado reutiliza el lightbox actual de `ProjectsGallery` para sus fotos.
- Etiqueta visible "Demo" o "Proyecto" en cada tarjeta, según `kind`.
- `metadata` de la página actualizada al nuevo título y descripción.

## Ajustes tras revisar la maqueta (2026-11-21)

Maqueta revisada: https://claude.ai/artifact/7pEQ3FGbTQuMYWCjaPpTvS (versión 4).

- **Cabecera:** solo el título "Proyectos y demos". Sin frase debajo.
- **Fondo:** papel milimetrado solo en la cabecera; el resto con el fondo liso actual (`.section-light.solid`, `#eceee6`).
- **Destacado:** vídeo y texto lado a lado; debajo, una fila de 6 miniaturas cuadradas a todo el ancho (3 por fila en móvil). Sin la línea "6 fotos · taller propio".
- **Tarjetas de proyecto:** sin la línea de categoría ("Diseño y fabricación · …") ni el subtítulo de la sección.
- **Galería ampliada:** foto completa, con flechas y deslizar (ya existen en `ProjectsGallery`).
- **Las 6 fotos de la demo**, en este orden: vista amplia del taller con chispas (GX010471, 20 s), operario soldando junto al robot (PXL_20261107_200614253), mano guiando el brazo (IMG_0953), operario con la tableta (GX010486, 5,4 s), primer plano del cordón (PXL_20261107_201120128), unión del tubo con cordón (foto de WhatsApp del 2026-11-11 aportada por Ronald). Póster del vídeo: GX010466, 30 s.
- **Formato uniforme de las imágenes completas:** las horizontales a **3:2**; las verticales a **1:1**. Las verticales se recortan a cuadrado; si el recorte pierde lo importante, se completan con IA.
- **Color uniforme:** todas con el mismo tratamiento (balance, contraste y saturación comunes); las tomas HDR del iPhone se pasan a SDR.
- **Calidad:** la foto del tubo se endereza. Si alguna queda blanda, se mejora con IA.
- **Fotos del resto de proyectos** (elevadores, plataforma, Pathfinder): mismo tratamiento de formato y color en este trabajo; los retoques con IA de la plataforma quedan para después.

## Restricciones

- Nunca nombrar el modelo del robot en textos, alt ni títulos.
- Imágenes con `next/image`; nada de `<img>` sueltos.
- Sin raya larga en ningún texto.
- El LCP del home no se toca; en `/proyectos` el póster del vídeo no debe empeorar la carga (el iframe solo existe tras el clic).

## Lo que queda a criterio del implementador

- Copy exacto del destacado y de la descripción de la página (sobrio, sin cifras no verificables).
- Puntos de enfoque concretos de cada portada.
- Qué fotogramas exactos entran en la galería de soldadura (con revisión visual de Ronald antes de subir).
