# CLAUDE.md — Datzon Landing Page

> Constitución del proyecto. Claude Code debe respetar estas reglas en todas las tareas.
> Lo que ya está en `package.json`, `tsconfig.json` y `next.config.ts` NO se repite aquí.

---

## Proyecto

Landing page corporativa de **Datzon**, empresa peruana de ingeniería y automatización industrial.

- **Producción:** https://www.datzoncompany.com
- **Hosting / CI-CD:** Vercel
- **Estado:** funcional pero incompleto. Varias secciones son demos estáticas. El formulario de contacto aún no envía datos reales. No hay i18n real.

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