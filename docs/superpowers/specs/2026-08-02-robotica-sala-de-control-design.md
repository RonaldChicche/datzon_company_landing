# Página /robotica · Sala de control

**Fecha:** 2026-08-02
**Estado:** diseño aprobado, pendiente de implementación
**Alcance:** rediseño completo de `/robotica`. Sustituye la decisión D7 del spec
del ciclo 4 (la rejilla de tres con cifras queda descartada).

---

## Cómo se llegó aquí

Se exploraron y descartaron, en orden: cinco pantallas generadas con Stitch
(genéricas, «hero de letras»), filas apiladas con fichas técnicas, cine por
capítulos a pantalla completa («varios heros») y cuaderno técnico con láminas.
Ganó la **sala de control**, iterada ocho veces con Ronald. La referencia
visual vinculante es la maqueta publicada (artifact `v8-lista-abierta`,
https://claude.ai/code/artifact/0a0eef09-7cd0-40aa-9645-945d6054bf0f), cuyas
plantillas fuente están respaldadas junto a la memoria del proyecto.

---

## Estructura de la página

1. **Cabecera compacta** sobre `--surface-dim` con glow radial lima en la
   esquina superior derecha (a Ronald le gustó explícitamente). Breadcrumb
   mono, H1 en Michroma «UN ROBOT PARA <span lima>CADA PROCESO</span>» y lead
   aspiracional:
   > Imagina tu planta con **un turno que nunca se cansa**: cajas que se
   > apilan solas, cordones perfectos, piezas frágiles intactas. Elige una
   > aplicación y mírala en marcha. Todo lo que ves se puede construir en tu
   > línea.

2. **Estudio (sala de control):** un solo escenario grande de vídeo a la
   izquierda y un rail de canales a la derecha (348 px).
   - El rail lleva el rótulo «Elige tu aplicación» en Michroma y un canal por
     demo: miniatura 16:9 + nombre + aplicación («Fin de línea», «Uniones
     repetibles», «Piezas frágiles»). El canal activo lleva barra lima
     izquierda y fondo elevado. Cierra con la nota mono «Más demos en camino.
     ¿Quieres ver tu proceso aquí? →».
   - Al elegir canal cambian vídeo, copy y variantes (sin scroll). El vídeo
     inactivo se pausa; el activo se reproduce solo, silencioso y en bucle.
   - Bajo el escenario: gancho en JetBrains Mono blanco (13 px, mayúsculas),
     párrafo corto en Geist y el bloque de **variantes personalizables**:
     etiqueta mono + chips con borde («MIG · TIG · Por puntos · Plasma ·
     Corte») rematados por el chip punteado **«¿El tuyo?»**.
   - Demos nuevas (pintura, etc.) entran como un canal más, sin anuncios
     previos ni badges.

3. **«Proyecta tu proceso»** sobre papel milimetrado, en **lista abierta**
   (sin cajas): 2 columnas, cada ítem con nombre + una línea a un lado y una
   ilustración monolínea (190 px) al otro. **10 aplicaciones**: Paletizado,
   Soldadura, Pick & place, Pintura, Manipulación, Inspección, Mecanizado,
   Corte, Pulido, Dosificación. Intro: «No nos casamos con un modelo:
   trabajamos con todo tipo de robots industriales y elegimos cada uno según
   tu carga, tu alcance y tu ritmo.»

4. **CTA:** kicker «¿Cuál de estas celdas se parece a tu proceso?», H2
   «HABLEMOS DE TU LÍNEA», párrafo «Cuéntanos qué haces a mano hoy y te
   decimos qué puede hacer un robot mañana, con números y no promesas.» y
   botón lima «Solicitar diagnóstico →» hacia `/#cotizar`.

El simulador 2D `PalletizerSim` desaparece de la página (decisión D7 que sí
se mantiene).

## Copy por demo

| Demo | Aplicación | Gancho | Variantes |
|---|---|---|---|
| Paletizado | Fin de línea | Del envasado al despacho, sin manos. | Cajas, Sacos, Bidones, Bandejas, Patrón a pedido |
| Soldadura | Uniones repetibles | El mismo cordón, turno tras turno. | MIG, TIG, Por puntos, Plasma, Corte |
| Manipulación delicada | Piezas frágiles | Si sirve una cerveza sin romper el vaso, puede con tu pieza más delicada. | Vidrio, Cerámica, Alimentos, Electrónica, Empaques |

## El reproductor (componente cliente)

- Autoplay silencioso en bucle cuando el reproductor está a la vista;
  `playsinline`, `muted`, poster propio.
- Controles reales: botón pausa/reproducir, **timeline clicable y
  arrastrable** (pointer events + flechas de teclado), timecode vivo
  `mm:ss / mm:ss` en mono con `tabular-nums`. Clic sobre el vídeo también
  pausa.
- Etiqueta discreta «Demo 01 · Paletizado» arriba a la izquierda.
- `prefers-reduced-motion`: sin autoplay, poster visible, controles activos.

## Reglas duras del copy (de Ronald, permanentes)

- **Prohibida la raya larga (em dash)** en todo el proyecto (ya purgada del
  repo). Sustituir por coma, dos puntos, punto y coma o paréntesis.
- **Prohibido «EN CICLO»** y cualquier badge/LED equivalente.
- **Prohibidas las fichas técnicas** (tablas de specs, error en mm, nombre del
  solver) en el copy público. Los números van como máximo en una línea mono
  discreta.
- **Nunca nombrar un modelo de robot**: Datzon integra el robot que el proceso
  necesite. Nada de FR10 ni «seis articulaciones» de cara al cliente.
- **Sin badges de «en producción»** para demos futuras: cuando exista la demo,
  se añade y ya.
- El discurso vende proyección («imagina», «tu línea», «¿el tuyo?»), no
  explica tecnología.

## Assets

- **Vídeos:** los `mini_*.mp4` actuales sirven de placeholder; antes del
  lanzamiento se reexportan **sin franjas negras horneadas** (mini_pal y
  mini_sold las traen) y con los arreglos de render anotados en el spec del
  ciclo 4. Se sirven desde el bucket `landing` bajo `site/robotica/`, con
  `preload="metadata"`, poster JPEG y hueco reservado por `aspect-ratio`
  (patrón D10 del ciclo 4).
- **Ilustraciones:** 10 monolínea verde oliva (#5F7D00) sobre papel (#F4F5F1),
  generadas con Antigravity (prompt de estilo guardado en la memoria del
  proyecto, junto con originales y versiones web de 600 px). Al bucket bajo
  `site/robotica/apps/`. Para aplicaciones futuras se genera con el mismo
  prompt.
- **Tipografías:** las tres ya cargadas en `app/layout.tsx`; el rótulo del
  rail usa Michroma y los ganchos JetBrains Mono, ambos ya disponibles.

## Fuera de alcance

- **Home:** el hero conserva su foto actual. El teaser de robótica en la
  portada quedó maquetado pero **sin decisión**; se retomará después de
  implementar `/robotica`.
- Los arreglos de los renders de Blender (chorro que atraviesa el vaso, codo
  brusco del paletizado) pertenecen a la producción de vídeo del ciclo 4, no
  a esta página.

## Criterios de aceptación

1. La página real es visualmente indistinguible de la maqueta `v8` en desktop
   y usable desde 375 px (rail de canales debajo del escenario en móvil).
2. Cero rayas largas, cero «EN CICLO», cero menciones de modelo de robot.
3. Conmutador accesible por teclado; reproductores con ARIA y foco visible.
4. Core Web Vitals en verde con los vídeos diferidos (LCP no depende de
   ningún MP4).
5. `PalletizerSim` eliminado de `/robotica` (el componente puede quedar en el
   repo hasta decidir su futuro).
