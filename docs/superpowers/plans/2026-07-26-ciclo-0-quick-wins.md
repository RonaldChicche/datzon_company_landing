# Ciclo 0 — Quick wins: Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seis remates pequeños: título de pestaña, WhatsApp (burbuja + footer), CTA contextual del modal, `fetchPriority` del hero, proporción real de los logos y lectura de leads para `service_role`.

**Architecture:** Cambios quirúrgicos sobre componentes existentes más dos archivos nuevos (`lib/contact-links.ts`, `components/WhatsAppButton.tsx`) y una migración SQL. Sin dependencias nuevas.

**Tech Stack:** Next.js 16, Tailwind v4, Vitest, Supabase CLI (migraciones).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-26-ciclo-0-quick-wins-design.md` — sus decisiones son ley.
- Número de WhatsApp: `+51 956 956 778` → `wa.me/51956956778`. Mensaje exacto: `"Hola, quiero cotizar un proyecto con Datzon."` (el test de la Task 2 lo fija byte a byte).
- Links externos: `target="_blank"` siempre con `rel="noopener noreferrer"`.
- TypeScript estricto; sin `any`. Estilos solo Tailwind (o las clases CSS globales ya existentes del sitio).
- El gate visual de la Task 2 es bloqueante: captura al usuario ANTES del commit de la burbuja.
- Migraciones solo vía `supabase db push --linked`. `anon` debe conservar SOLO INSERT sobre `landing.leads`.

---

### Task 1: La pestaña hereda el título con Datzon

**Files:**
- Modify: `app/page.tsx:4-6`

**Interfaces:** ninguna.

- [ ] **Step 1: Eliminar el override**

En `app/page.tsx`, el bloque actual:

```ts
export const metadata: Metadata = {
  title: "Inicio",
  ...
};
```

Eliminar **solo** la propiedad `title: "Inicio",`. Si `metadata` queda sin propiedades, eliminar el export completo y el import de `Metadata` si queda sin uso.

- [ ] **Step 2: Verificar**

Run: `pnpm exec tsc --noEmit && grep -c '"Inicio"' app/page.tsx || true`
Expected: tsc limpio; el grep devuelve 0 coincidencias.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "fix: la home hereda el título por defecto (Datzon | Ingeniería y Automatización Industrial)"
```

---

### Task 2: WhatsApp — constante, burbuja y footer (con gate visual)

**Files:**
- Create: `lib/contact-links.ts`
- Test: `lib/contact-links.test.ts`
- Create: `components/WhatsAppButton.tsx`
- Modify: `app/layout.tsx` (montar la burbuja dentro de `<body>`)
- Modify: `components/Footer.tsx` (enlace junto al bloque de correo)

**Interfaces:**
- Produces: `WHATSAPP_URL: string` desde `@/lib/contact-links` (la consumen la burbuja y el footer).

- [ ] **Step 1: Write the failing test**

```ts
// lib/contact-links.test.ts
import { describe, it, expect } from "vitest";
import { WHATSAPP_URL } from "./contact-links";

describe("WHATSAPP_URL", () => {
  it("apunta al número confirmado por wa.me", () => {
    expect(WHATSAPP_URL.startsWith("https://wa.me/51956956778?text=")).toBe(true);
  });

  it("lleva el mensaje exacto, URL-encoded", () => {
    const text = new URL(WHATSAPP_URL).searchParams.get("text");
    expect(text).toBe("Hola, quiero cotizar un proyecto con Datzon.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/contact-links.test.ts`
Expected: FAIL — `Cannot find module './contact-links'`.

- [ ] **Step 3: Implementar la constante**

```ts
// lib/contact-links.ts
/** Enlace de WhatsApp de Datzon con mensaje pre-armado. Número confirmado 2026-07-26. */
export const WHATSAPP_URL =
  "https://wa.me/51956956778?text=" +
  encodeURIComponent("Hola, quiero cotizar un proyecto con Datzon.");
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run lib/contact-links.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: La burbuja**

```tsx
// components/WhatsAppButton.tsx
import { WHATSAPP_URL } from "@/lib/contact-links";

/**
 * Burbuja flotante de WhatsApp, visible en todas las páginas.
 * Server Component: un enlace puro, sin JS de cliente.
 * z-[150]: por debajo del modal de contacto (z-[200]) para que este la cubra.
 */
export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-[150] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    </a>
  );
}
```

- [ ] **Step 6: Montarla en el layout**

En `app/layout.tsx`: `import WhatsAppButton from "@/components/WhatsAppButton";` y renderizar `<WhatsAppButton />` dentro de `<body>`, como hermano posterior del contenido principal (junto a donde se renderiza `<Analytics />` o el wrapper del children).

- [ ] **Step 7: Enlace en el footer**

En `components/Footer.tsx`, dentro del bloque de contacto donde está el correo (`contacto@datzoncompany.com`), añadir debajo un enlace con el estilo de los enlaces existentes de esa sección:

```tsx
<a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
  WhatsApp · +51 956 956 778
</a>
```

con `import { WHATSAPP_URL } from "@/lib/contact-links";` arriba. Ajustar el markup exacto al patrón del bloque (respetar clases/etiquetas vecinas tipo `CORREO`/`OFICINA`).

- [ ] **Step 8: GATE VISUAL — captura al usuario antes de commitear**

1. `pnpm dev` en background.
2. Captura de la home con la burbuja en desktop (1280px) y móvil (375px), y del footer con el enlace.
3. Mostrar las capturas al usuario y ESPERAR su aprobación. Si pide cambios (tamaño, posición, quitar burbuja), iterar antes de seguir.

- [ ] **Step 9: Commit (solo tras el OK del gate)**

```bash
git add lib/contact-links.ts lib/contact-links.test.ts components/WhatsAppButton.tsx app/layout.tsx components/Footer.tsx
git commit -m "feat: enlace de WhatsApp con mensaje pre-armado (burbuja global + footer)"
```

---

### Task 3: "Cotizar" abre el modal fuera de la home

**Files:**
- Modify: `components/Header.tsx:62-64`

**Interfaces:**
- Consumes: el evento `open-contact-modal` que `app/ClientLayout.tsx:17` ya escucha. `usePathname` ya está importado en el Header.

- [ ] **Step 1: CTA contextual**

Reemplazar el CTA actual:

```tsx
<Link href="/#cotizar" className="btn btn-primary">
  Cotizar
</Link>
```

por:

```tsx
{pathname === "/" ? (
  <Link href="/#cotizar" className="btn btn-primary">
    Cotizar
  </Link>
) : (
  <button
    type="button"
    className="btn btn-primary"
    onClick={() => window.dispatchEvent(new CustomEvent("open-contact-modal"))}
  >
    Cotizar
  </button>
)}
```

usando la variable de pathname que el componente ya tiene (verificar su nombre real — es la que alimenta `isActive`).

- [ ] **Step 2: Verificar**

Run: `pnpm exec tsc --noEmit`
Expected: limpio. En dev (`pnpm dev`): en `/solutions` el botón abre el modal; en `/` sigue anclando al formulario. (La verificación en navegador puede hacerse junto con el gate de la Task 2 si el dev server ya está arriba.)

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: Cotizar abre el modal de contacto fuera de la home"
```

---

### Task 4: Remates de la auditoría — fetchPriority y proporción de los logos

**Files:**
- Modify: `components/HomeContent.tsx` (el `<Image>` del hero, junto a la prop `priority` existente)
- Modify: `components/Header.tsx:38-44` y `components/Footer.tsx:13-19`

**Interfaces:** ninguna.

- [ ] **Step 1: fetchPriority en el hero**

En el `<Image>` del hero de `HomeContent.tsx` (el que tiene `priority` y `fill`), añadir la prop:

```tsx
fetchPriority="high"
```

- [ ] **Step 2: Proporción real de los logos**

`public/logo_datzon.svg` tiene `viewBox="0 0 614 120"` (proporción 5.12:1). Header y Footer declaran hoy `140×48` y `110×38` (~2.9:1) — proporción equivocada: el navegador reserva un ancho incorrecto y reajusta al cargar el SVG (el layout shift de 0.0028 de la auditoría). En **ambos** componentes, cambiar a la proporción intrínseca exacta:

```tsx
width={614}
height={120}
```

Las clases CSS (`h-7 w-auto`, `h-[26px] w-auto mb-[18px]`) no se tocan — siguen mandando sobre el tamaño visible; los atributos solo declaran la proporción para la reserva de espacio.

- [ ] **Step 3: Verificar**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: limpio. En dev: los logos se ven idénticos (mismo tamaño visible); el HTML del hero lleva `fetchpriority="high"` (verificar con `curl -s localhost:3000 | grep -o 'fetchpriority="high"' | head -1`).

- [ ] **Step 4: Commit**

```bash
git add components/HomeContent.tsx components/Header.tsx components/Footer.tsx
git commit -m "fix: fetchPriority alto para la imagen LCP y proporción real de los logos"
```

---

### Task 5: `service_role` puede leer leads

**Files:**
- Create: `supabase/migrations/$(date +%Y%m%d%H%M%S)_leads_service_role_select.sql`
- Modify: `CLAUDE.md` (la frase "es una migración pendiente" del bullet de `landing.leads`)

**Interfaces:** ninguna en código; cambia el estado remoto de la base.

- [ ] **Step 1: Crear la migración**

```sql
-- service_role tiene BYPASSRLS, pero eso exime de políticas, no de grants:
-- sin USAGE sobre el schema y SELECT sobre la tabla, los scripts locales con
-- la credencial secreta no pueden leer leads (pendiente documentado en
-- CLAUDE.md desde la final review del ciclo del formulario).
-- Solo lectura a propósito: borrar/editar leads sigue siendo del dashboard.

grant usage on schema landing to service_role;
grant select on landing.leads to service_role;
```

- [ ] **Step 2: Aplicar**

Run: `echo Y | npx supabase db push --linked`
Expected: "Finished supabase db push." (el CLI tiene sesión desde el 2026-07-25). Si pide credenciales que no están: PARAR y avisar al usuario.

- [ ] **Step 3: Verificar el estado remoto**

Con la tool MCP `mcp__supabase__execute_sql`:

```sql
select
  has_schema_privilege('service_role', 'landing', 'usage')        as sr_usage,
  has_table_privilege('service_role', 'landing.leads', 'select')  as sr_select,
  has_table_privilege('service_role', 'landing.leads', 'delete')  as sr_delete,
  has_table_privilege('anon', 'landing.leads', 'insert')          as anon_insert,
  has_table_privilege('anon', 'landing.leads', 'select')          as anon_select;
```

Expected: `sr_usage=t, sr_select=t, sr_delete=f, anon_insert=t, anon_select=f`. Cualquier otra combinación es fallo: corregir antes de seguir.

- [ ] **Step 4: Actualizar CLAUDE.md**

En el bullet de `landing.leads` (sección Base de datos), reemplazar la frase que dice que dar los grants a `service_role` "es una migración pendiente" por la descripción del estado real: los leads se leen desde el dashboard **o con la credencial secreta en scripts locales** (grants `usage`+`select` aplicados; sin `update`/`delete` — eso sigue siendo del dashboard).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/ CLAUDE.md
git commit -m "feat: service_role puede leer landing.leads (usage + select)"
```

---

### Verificación final del ciclo

- [ ] `pnpm exec tsc --noEmit && pnpm test && pnpm build` — todo verde (38 tests: 36 + 2 nuevos).
- [ ] Dev: pestaña "Datzon | Ingeniería y Automatización Industrial"; burbuja aprobada por el usuario; modal desde `/solutions`; wa.me con el texto correcto.
- [ ] Queries de privilegios de la Task 5 en verde.

## Self-review (hecho al escribir)

- **Cobertura del spec:** los 6 ítems → Tasks 1–5 (fetchPriority y logos comparten la Task 4). El gate visual del spec está como Step 8 bloqueante de la Task 2. ✓
- **Placeholders:** ninguno; todos los valores son exactos (número, mensaje, viewBox 614×120, queries de verificación).
- **Consistencia:** `WHATSAPP_URL` mismo nombre en Tasks 2 (produce) y consumidores; `open-contact-modal` idéntico al listener existente. ✓
