# Ciclo 0 — Quick wins: pestaña, WhatsApp, CTA del modal y remates de auditoría

**Fecha:** 2026-07-26
**Rama:** `feat/ciclo-0-quick-wins` (desde `main` en `5d900a9`, post-merge del rediseño)

---

## Contexto

Con el formulario entregando leads en producción (verificado: fila en `landing.leads` + correo por Resend recibidos el 2026-07-26), quedan seis remates pequeños: cuatro follow-ups de la final review y la auditoría de rendimiento, más dos pedidos nuevos del usuario (título de pestaña y WhatsApp). Todos caben en un ciclo corto.

## Decisiones tomadas (con el usuario, 2026-07-26)

| Decisión | Valor |
|---|---|
| Título de la pestaña | **"Datzon \| Ingeniería y Automatización Industrial"** — el default que `app/layout.tsx` ya define. Decisión final del usuario tras evaluar "DatzonCompany" a secas y su costo SEO. Subpáginas: `"%s \| Datzon"` (template existente) |
| Número de WhatsApp | **+51 956 956 778** (confirmado por el usuario) |
| Mensaje pre-armado | **"Hola, quiero cotizar un proyecto con Datzon."** |
| Ubicación del WhatsApp | **Ambos**: burbuja flotante global + enlace en el footer. La burbuja se muestra en captura de dev **antes** de commitear; si no convence, se ajusta |
| CTA del modal | **"Cotizar" según página**: en `/` ancla a `/#cotizar` (formulario largo); en el resto de páginas abre el modal (`open-contact-modal`) |
| Grants a `service_role` | **Solo lectura** (`usage` + `select`). Borrar leads sigue siendo del dashboard — YAGNI |

## Cambios

### 1. Título de pestaña — `app/page.tsx`

- `app/page.tsx`: eliminar el override `title: "Inicio"`. La home hereda el default de `app/layout.tsx`, que ya es exactamente el título elegido: `"Datzon | Ingeniería y Automatización Industrial"`.
- `app/layout.tsx` **no se toca**: default, template, description y openGraph ya están correctos.
- `app/equipo/page.tsx` conserva `title: "Equipo"` → pestaña "Equipo | Datzon".

### 2. WhatsApp — constante única + dos consumidores

**`lib/contact-links.ts` (nuevo):**

```ts
/** Enlace de WhatsApp de Datzon con mensaje pre-armado. Número confirmado 2026-07-26. */
export const WHATSAPP_URL =
  "https://wa.me/51956956778?text=" +
  encodeURIComponent("Hola, quiero cotizar un proyecto con Datzon.");
```

**`components/WhatsAppButton.tsx` (nuevo):** burbuja fija abajo-derecha.
- Server Component (un `<a>`, sin hooks). `target="_blank"` + `rel="noopener noreferrer"` (regla de CLAUDE.md). `aria-label="Escríbenos por WhatsApp"`.
- Icono de WhatsApp como SVG inline (path oficial, `fill="currentColor"`); estilo con Tailwind: círculo ~56px, verde WhatsApp (#25D366), sombra suave, `fixed bottom-5 right-5`, `z-[150]` (debajo del modal, que usa `z-[200]/[201]`, para que el modal lo cubra al abrirse).
- Montado en `app/layout.tsx` para que exista en todas las páginas.

**`components/Footer.tsx`:** enlace "WhatsApp" con `WHATSAPP_URL` junto al correo de contacto, mismo estilo de los enlaces existentes.

**Gate visual:** captura en dev de la burbuja (desktop y 375px) presentada al usuario antes del commit del componente; se itera si no convence.

### 3. "Cotizar" según página — `components/Header.tsx`

El header ya es Client Component (usa `usePathname`). El CTA:

- `pathname === "/"` → `<Link href="/#cotizar">` (como hoy).
- Cualquier otra ruta → `<button>` con los mismos estilos (`btn btn-primary`) que hace `window.dispatchEvent(new CustomEvent("open-contact-modal"))`.

El listener ya existe en `app/ClientLayout.tsx:17`; no se toca. Con esto `source='modal'` en `landing.leads` empieza a registrar conversiones reales.

### 4. `fetchPriority="high"` — `components/HomeContent.tsx`

Añadir la prop al `<Image>` del hero (mantiene `priority`, `fill`, `sizes`). Respaldo: recomendación oficial de web.dev para imágenes LCP; la auditoría midió que hoy el navegador la pide con prioridad Low.

### 5. Dimensiones intrínsecas del logo — `components/Header.tsx` y `components/Footer.tsx`

`width`/`height` explícitos en los logos (proporción real de cada SVG, medida de los archivos al implementar). El CSS visible no cambia; solo se declara la proporción para que el navegador reserve el espacio (elimina el shift de 0.0028 medido en la auditoría).

### 6. Migración: `service_role` puede leer leads

**`supabase/migrations/<timestamp>_leads_service_role_select.sql`:**

```sql
-- service_role BYPASSRLS exime de políticas, no de grants: sin esto,
-- los scripts locales con la credencial secreta no pueden leer leads
-- (CLAUDE.md lo documenta como pendiente desde la final review del ciclo D).
grant usage on schema landing to service_role;
grant select on landing.leads to service_role;
```

- Aplicar con `supabase db push --linked` (el CLI tiene sesión desde el 2026-07-25).
- Verificar: `has_table_privilege('service_role','landing.leads','select')` = true; `anon` sigue teniendo **solo** INSERT (mismas queries de verificación del ciclo D).
- `CLAUDE.md`: quitar la frase "es una migración pendiente" — pasa a describir el estado real (dashboard **o** scripts con la secreta).

## Verificación del ciclo

1. `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` en verde.
2. Dev visual: pestaña dice "DatzonCompany"; burbuja visible y clicable (abre wa.me con el texto correcto); en `/solutions` el botón Cotizar abre el modal; en `/` sigue anclando al formulario.
3. Queries de privilegios de la migración (arriba).
4. El shift del logo: trace rápido de carga en dev tools sin el culprit `logo_datzon.svg`.

## Fuera de alcance

Todo lo demás del roadmap: ciclos 1–5 (bucket, copy en español, hero con video, celda 3D, demo de visión artificial), footer AA, dieta de JS, `pnpm lint`, CSP, rate limit real.
