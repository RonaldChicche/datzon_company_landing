# CLAUDE.md — Datzon Landing Page

> Constitución del proyecto. Claude Code debe respetar estas reglas en todas las tareas.
> Lo que ya está en `package.json`, `tsconfig.json` y `next.config.ts` NO se repite aquí.

---

## Proyecto

Landing page corporativa de **Datzon**, empresa peruana de ingeniería y automatización industrial.

- **Producción:** https://www.datzoncompany.com
- **Hosting / CI-CD:** Vercel
- **Estado:** funcional pero incompleto. Varias secciones son demos estáticas. El formulario de contacto ya persiste los envíos en `landing.leads`; la notificación por email queda inerte hasta configurar `RESEND_API_KEY` (cuenta de Resend con dominio verificado, pendiente de operaciones). No hay i18n real.

### Stack

- Next.js 15/16 (App Router) + TypeScript
- React 19
- Tailwind CSS v4 (sistema `@theme` en `globals.css`)
- Framer Motion (animaciones)

### Páginas actuales

- `/` — landing principal (Hero, partners, soluciones, tecnologías, diagnóstico)
- `/solutions` — soluciones mecánicas, analítica, robótica industrial
- `/equipo` — 5 miembros del equipo, tarjetas animadas

---

## Identidad de la empresa

- **Razón social:** DATZON S.A.C — **RUC:** 20615575624
- **Nombre Comercial:** DATZON INDUSTRIAL AUTOMATION
- **Fundación:** marzo 2026 (startup en lanzamiento)
- **Domicilio:** Cal. Mercator 484, Dpto. 101, San Borja, Lima, Perú
- **Marca:** Datzon (siempre con D mayúscula, sin variantes)
- **Tagline registrado:** Industrial Automation

### Servicios core (en orden de prioridad)

1. **Diseño, fabricación y robótica industrial** — sistemas automatizados, robots industriales, sistemas de control, impresión 3D y prototipado, maquinaria, dispositivos electrónicos a medida. **PRIORIDAD PRINCIPAL.**
2. **Automatización industrial y control** — PLC, HMI, SCADA, telemetría, monitoreo remoto, integración de sistemas de control.
3. **Desarrollo de software y sistemas embebidos** — apps web/móviles, backend/frontend, integración hardware-software, analítica, IA aplicada. **Capacidad menor por ahora.**

Complementarios (NO comunicar como core todavía): consultoría técnica, import/export de equipos, licitaciones.

- **Cliente objetivo:** empresas industriales y de manufactura que buscan automatizar procesos, optimizar producción o implementar sistemas de control. B2B, decisiones racionales.
- **Mercado:** Perú (base Lima), con capacidad nacional e internacional.

---

## Objetivos del sitio

**Principal:** llevar la landing de "funcional pero incompleta" a producción profesional.

**Estándares técnicos objetivo:**

1. Core Web Vitals en verde: LCP < 2.5s, INP < 200ms, CLS < 0.1
2. Seguridad: security headers OWASP, HTTPS, `npm audit` limpio
3. SEO técnico: metadata por página, sitemap.xml, robots.txt, JSON-LD Organization
4. Accesibilidad: WCAG 2.2 nivel AA
5. Formulario de contacto enviando emails reales
6. Mobile first: usable desde 375px

**Negocio:** transmitir credibilidad técnica a empresas industriales, generar contactos vía formulario, posicionar a Datzon en búsquedas de automatización industrial en Perú.

**NO es prioridad ahora:** integración GenAI, datos en tiempo real, i18n completo, e-commerce.

---

## Convenciones de código

- **TypeScript estricto.** Sin `any` explícitos salvo casos muy justificados.
- **Server Components por defecto.** Solo `"use client"` cuando se usen hooks, eventos del browser o Framer Motion.
- **Estilos: Tailwind CSS v4 únicamente.** Sin CSS modules ni styled-components. Colores del tema en `globals.css` con `@theme`.
- **Imágenes: siempre `next/image`.** Nunca `<img>` nativo.
- **Fuentes:** cargadas en `app/layout.tsx` vía `next/font/google`.
- **Rutas API:** en `app/api/[endpoint]/route.ts` como Route Handlers.
- **Env vars:** prefijo `NEXT_PUBLIC_` solo para las accesibles en cliente.
- **Imports:** paths absolutos con alias `@/`.
- **Errores:** siempre manejar errores en `fetch` y API Routes. Ninguna promesa sin `catch`.
- **Accesibilidad:** todo componente nuevo con ARIA correcto y navegable por teclado.

---

## Reglas de seguridad

- **Nunca** API keys, tokens ni secrets en el código. Siempre variables de entorno.
- **Nunca** `dangerouslySetInnerHTML` sin sanitización explícita.
- **Nunca** exponer lógica de servidor en Client Components.
- **Nunca** `console.log` de datos de usuario o tokens en producción.
- **Siempre** validar inputs en cliente (Zod) y en servidor (API Route).
- **Siempre** `rel="noopener noreferrer"` en links externos con `target="_blank"`.
- Si propones una dependencia nueva: explica para qué sirve y si tiene mantenimiento activo.

---

## Modo de trabajo

El dueño del proyecto está aprendiendo desarrollo web moderno. Tiene base, no es experto.

**Al implementar:**

- Explica el concepto clave en 2-3 líneas antes del código.
- Si hay dos formas de hacer algo, di por qué eliges una.
- Si el cambio toca un concepto importante (SSR vs CSR, hidratación, bundle splitting), explícalo brevemente.

**Al encontrar un problema:**

- Explica qué causó el error antes de dar la solución.
- Si el fix es un workaround temporal, dilo explícitamente.

**Formato:**

- Código en bloques con el nombre del archivo en el comentario superior.
- Cambios pequeños: solo el fragmento relevante con contexto.
- Cambios grandes: archivo completo.
- No usar jerga sin explicarla la primera vez que aparece.

**Contexto:** proyecto real de una startup peruana en lanzamiento. Las decisiones técnicas impactan el negocio. Priorizar solidez sobre features.

### Dónde viven las reglas

Este archivo (`CLAUDE.md` en la raíz) es la **única fuente de reglas compartidas** del proyecto: está versionado y lo recibe cualquiera que clone el repositorio.

`.claude/` está en `.gitignore`. Es configuración local de cada máquina. Una regla escrita ahí no la hereda nadie más, así que no pongas ahí nada que el equipo deba cumplir.

---

## Supabase

### Proyecto único

Este repositorio solo puede conectarse al proyecto **`adnvzdcqcneqjemxneht`** (`Datzon`, sa-east-1).

La organización contiene además `thwotgoldsncfsgndlii` (`datzon_company`, pausado). **Está prohibido usarlo.** No migrar datos ahí, no apuntar variables de entorno ahí, no crear tablas ahí.

La regla está respaldada por dos barreras técnicas, no solo por este texto:

- `.mcp.json` acota el servidor MCP con `project_ref`, lo que desactiva las herramientas de cuenta. Requiere que el conector de Supabase de claude.ai esté **desactivado**; si está activo, es una vía sin acotar en paralelo.
- `lib/supabase/project.ts` valida `SUPABASE_URL` y falla al arranque. Todo cliente nuevo de Supabase debe llamar a `assertDatzonProject` antes de conectarse.

### Credenciales

Dos clientes, nunca intercambiables:

| Cliente | Credencial | Dónde | Frente a RLS |
|---|---|---|---|
| App en runtime | `sb_publishable_…` (o legacy `anon`) | Route Handlers, Server Components | **Sujeto a RLS** |
| Scripts locales | `sb_secret_…` (o legacy `service_role`) | Solo `scripts/*.ts`, leyendo `.env.local` | Lo bypasea |

La credencial secreta **nunca** aparece en código de la aplicación. Usarla en el servidor "porque es más fácil" deja el RLS de adorno.

### Base de datos

- **Todas las tablas de este proyecto van en el schema `landing`.** Ninguna en `public`.
- Toda tabla lleva RLS habilitado, con grants explícitos y mínimos por rol. Desde el 2026-10-30 Supabase deja de auto-exponer tablas al Data API en todos los proyectos, así que los grants explícitos son obligatorios de todos modos.
- La tabla `landing.leads` (leads del formulario de contacto) es un **buzón de
  solo escritura** para `anon`: solo tiene INSERT y nada más. No añadir
  grants de lectura a `anon`. Los leads se leen desde el dashboard de
  Supabase **o con la credencial secreta en scripts locales** (`service_role`
  tiene `usage` sobre el schema y `select` sobre la tabla por migración; sin
  `update`/`delete` — editar o borrar sigue siendo del dashboard). El Route
  Handler usa la clave publishable (`SUPABASE_PUBLISHABLE_KEY`, sin
  `NEXT_PUBLIC_`) vía `lib/supabase/client.ts`.
- `SECURITY DEFINER` está prohibido salvo justificación escrita en el propio archivo SQL.
- Los cambios de schema van por migraciones del CLI en `supabase/migrations/`, versionadas. No se aplica DDL suelto: `.mcp.json` usa `read_only=true` justamente para impedirlo.
- El CLI de Supabase está instalado, inicializado y **enlazado** al proyecto.
  Las migraciones viven en `supabase/migrations/` y se aplican con
  `supabase db push --linked` (requiere un personal access token con sesión
  iniciada).

### Storage

Todos los objetos van al bucket **`landing`**. Su contenido vive bajo estos prefijos de primer nivel:

| Prefijo | Contenido |
|---|---|
| `project/<slug>/` | Fotos de las galerías de proyectos. Un slug por proyecto, generado por `pnpm optimize-images` a partir del nombre de la carpeta. |
| `site/` | Todo lo demás: retratos del equipo, imágenes de páginas y logos. |
| `raw/` | **No es un prefijo de contenido.** Es el destino de descarte de `scripts/optimize-upload.ts` cuando en `scripts/images-to-upload/` hay imágenes sueltas (sin subcarpetas) y no se indica un proyecto por argumento. No lo uses para nada que el sitio referencie. Está previsto eliminarlo cuando se revise ese script en otro sub-proyecto. |

No crees prefijos nuevos de primer nivel sin actualizar esta tabla. No antepongas `landing/` dentro del bucket: sería redundante con su nombre. Si en el futuro este proyecto Supabase aloja otra aplicación, va en **otro bucket**, no en una carpeta de este.

El bucket tiene un límite de **2 MB por archivo** (`file_size_limit`), más estricto que el del plan. Cualquier asset que lo supere tras optimizar será rechazado.

El estado real de RLS del bucket está documentado en `scripts/supabase-storage-rls.sql`. Ese archivo **no se ejecuta**: describe la configuración vigente y por qué es correcta.

## Referencias de Notion

Cuando se mencione "Notion", "el roadmap", "las tareas" o "el backlog", consultar:

- **Hub del proyecto:** Datzon Web Page
  `36eac27a-4ba4-81f8-8cfc-e5562b63e0b9`
- **Task List (13 tareas con contexto y to-do):** base de datos
  `9399f78c-16ba-4ee6-be80-2b83398fc78e`
  (data source: `560875d9-3bba-482a-9f52-f3d8ec1c23c0`)

Cada tarea es una página dentro de esa base de datos, con propiedades:
Categoría, Estado, Prioridad, Herramientas, Referencia estándar.
Para leer una tarea, usar el fetch de Notion con el ID o URL de la página.

---

<!-- SPECKIT START -->
<!-- Esta sección la gestiona Spec Kit automáticamente al correr `specify init`. No editar a mano. -->
<!-- SPECKIT END -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
