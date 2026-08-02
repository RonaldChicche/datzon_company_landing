# Formulario de contacto: entrega real de leads, Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir el `console.log` de `app/api/contact/route.ts` por persistencia en `landing.leads` (Supabase, clave publishable + RLS) y notificación por Resend, con un contrato de formulario unificado entre `ContactForm`, `ContactModal` y el servidor.

**Architecture:** Un schema Zod canónico en `lib/contact-schema.ts` importado por los dos formularios y el Route Handler. El handler valida → descarta honeypot → inserta en `landing.leads` (buzón de solo escritura: `anon` solo INSERT) → notifica por Resend (fallo no bloquea) → responde. Spec: `docs/superpowers/specs/2026-07-25-formulario-contacto-leads-design.md`.

**Tech Stack:** Next.js 16 (App Router), Zod 4, react-hook-form + @hookform/resolvers, @supabase/supabase-js 2, Resend SDK, Vitest 4, Supabase CLI (migraciones).

## Global Constraints

- TypeScript estricto; sin `any`.
- La clave publishable va en `SUPABASE_PUBLISHABLE_KEY` **sin** prefijo `NEXT_PUBLIC_` (no debe llegar al navegador).
- `SUPABASE_SERVICE_ROLE_KEY` **nunca** se importa en código de aplicación; solo `scripts/`.
- Todas las tablas en el schema `landing`, nunca `public`. Cambios de schema solo por migraciones del CLI en `supabase/migrations/`.
- Ningún `console.log` de datos de usuario. Los `console.error` de este plan registran códigos y mensajes de error, nunca el contenido del lead.
- Estilos solo Tailwind v4; `ContactModal` mantiene sus clases y patrón de iconos existentes.
- Gestor de paquetes: `pnpm`.
- Todo componente nuevo o campo nuevo con `label` asociado por `htmlFor`/`id` y ARIA correcto.
- Los mensajes de validación en español, idénticos a los existentes donde ya había.

---

### Task 1: Schema compartido `lib/contact-schema.ts`

**Files:**
- Create: `lib/contact-schema.ts`
- Test: `lib/contact-schema.test.ts`

**Interfaces:**
- Consumes: nada (solo `zod`).
- Produces:
  - `contactFieldsSchema`, ZodObject con `nombre` (min 2), `email`, `mensaje` (min 10) obligatorios; `empresa`, `telefono`, `industria`, `website` opcionales. `website` es el honeypot y **no** lleva `max(0)`: su contenido se evalúa en el servidor.
  - `contactPayloadSchema`, `contactFieldsSchema.extend({ source: z.enum(["home", "modal"]) })`.
  - `type ContactFields = z.infer<typeof contactFieldsSchema>`
  - `type ContactPayload = z.infer<typeof contactPayloadSchema>`
  - `INDUSTRIES: readonly string[]`, la lista que hoy vive en `ContactForm.tsx`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/contact-schema.test.ts
import { describe, it, expect } from "vitest";
import {
  contactFieldsSchema,
  contactPayloadSchema,
  INDUSTRIES,
} from "./contact-schema";

const minimoValido = {
  nombre: "Ana",
  email: "ana@empresa.com",
  mensaje: "Necesito automatizar una línea de envasado.",
};

describe("contactFieldsSchema", () => {
  it("acepta el mínimo válido (solo obligatorios)", () => {
    expect(contactFieldsSchema.safeParse(minimoValido).success).toBe(true);
  });

  it("acepta los opcionales presentes", () => {
    const conOpcionales = {
      ...minimoValido,
      empresa: "Acme SAC",
      telefono: "+51 999 888 777",
      industria: "Minería",
    };
    expect(contactFieldsSchema.safeParse(conOpcionales).success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, email: "no-es-email" });
    expect(r.success).toBe(false);
  });

  it("rechaza nombre de 1 carácter", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, nombre: "A" });
    expect(r.success).toBe(false);
  });

  it("rechaza mensaje de menos de 10 caracteres", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, mensaje: "corto" });
    expect(r.success).toBe(false);
  });

  it("el honeypot relleno PASA la validación (se evalúa en el servidor)", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, website: "spam.com" });
    expect(r.success).toBe(true);
  });

  it("no conoce el campo disponibilidad (contrato unificado)", () => {
    expect("disponibilidad" in contactFieldsSchema.shape).toBe(false);
  });
});

describe("contactPayloadSchema", () => {
  it("acepta source home y modal", () => {
    expect(contactPayloadSchema.safeParse({ ...minimoValido, source: "home" }).success).toBe(true);
    expect(contactPayloadSchema.safeParse({ ...minimoValido, source: "modal" }).success).toBe(true);
  });

  it("rechaza source fuera del enum y source ausente", () => {
    expect(contactPayloadSchema.safeParse({ ...minimoValido, source: "admin" }).success).toBe(false);
    expect(contactPayloadSchema.safeParse(minimoValido).success).toBe(false);
  });
});

describe("INDUSTRIES", () => {
  it("contiene las 7 industrias del formulario actual", () => {
    expect(INDUSTRIES).toHaveLength(7);
    expect(INDUSTRIES).toContain("Minería");
    expect(INDUSTRIES).toContain("Otra");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/contact-schema.test.ts`
Expected: FAIL, `Cannot find module './contact-schema'` (o equivalente).

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/contact-schema.ts
import { z } from "zod";

/**
 * Contrato canónico del formulario de contacto. Única definición: la
 * importan ContactForm, ContactModal y el Route Handler. Antes estaba
 * triplicado y divergió (el modal enviaba `disponibilidad`, que el
 * servidor descartaba en silencio).
 */

export const INDUSTRIES = [
  "Minería",
  "Energía & utilities",
  "Manufactura",
  "Alimentos & bebidas",
  "Logística & retail",
  "Agroindustria",
  "Otra",
] as const;

export const contactFieldsSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido (mín. 2 caracteres)"),
  email: z.email("Correo electrónico inválido"),
  mensaje: z.string().min(10, "Describe brevemente tu necesidad (mín. 10 caracteres)"),
  empresa: z.string().optional(),
  telefono: z.string().optional(),
  industria: z.string().optional(),
  // Honeypot: invisible para humanos. Sin max(0) a propósito, si un bot lo
  // rellena debe PASAR la validación para llegar al descarte silencioso del
  // servidor (con max(0) el bot recibía 422 y el honeypot era código muerto).
  website: z.string().optional(),
});

export const contactPayloadSchema = contactFieldsSchema.extend({
  source: z.enum(["home", "modal"]),
});

export type ContactFields = z.infer<typeof contactFieldsSchema>;
export type ContactPayload = z.infer<typeof contactPayloadSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run lib/contact-schema.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/contact-schema.ts lib/contact-schema.test.ts
git commit -m "feat: schema canónico del formulario de contacto en lib/contact-schema"
```

---

### Task 2: Cliente Supabase de runtime `lib/supabase/client.ts`

**Files:**
- Create: `lib/supabase/client.ts`
- Test: `lib/supabase/client.test.ts`
- Modify: `package.json` (mover `@supabase/supabase-js` de devDependencies a dependencies)

**Interfaces:**
- Consumes: `assertDatzonProject(rawUrl: string | undefined): string` de `lib/supabase/project.ts` (lanza si la URL no es del proyecto Datzon).
- Produces:
  - `getSupabaseClient(): SupabaseClient`, singleton perezoso con la clave publishable, schema `landing`, sin sesión persistente.
  - `_resetSupabaseClient(): void`, solo para tests.

- [ ] **Step 1: Mover la dependencia a producción**

`@supabase/supabase-js` está en `devDependencies` (solo lo usaban scripts). El build de producción de Vercel poda devDeps: si el Route Handler lo importara desde ahí, el deploy fallaría.

```bash
pnpm remove -D @supabase/supabase-js && pnpm add @supabase/supabase-js
```

Verificar: en `package.json`, `@supabase/supabase-js` aparece en `dependencies` y ya no en `devDependencies`.

- [ ] **Step 2: Write the failing test**

```ts
// lib/supabase/client.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { EXPECTED_PROJECT_REF } from "./project";
import { getSupabaseClient, _resetSupabaseClient } from "./client";

const URL_VALIDA = `https://${EXPECTED_PROJECT_REF}.supabase.co`;

describe("getSupabaseClient", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    _resetSupabaseClient();
  });

  it("devuelve un cliente cuando el entorno está completo", () => {
    vi.stubEnv("SUPABASE_URL", URL_VALIDA);
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    const client = getSupabaseClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
  });

  it("es un singleton: dos llamadas devuelven la misma instancia", () => {
    vi.stubEnv("SUPABASE_URL", URL_VALIDA);
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(getSupabaseClient()).toBe(getSupabaseClient());
  });

  it("lanza si falta SUPABASE_PUBLISHABLE_KEY", () => {
    vi.stubEnv("SUPABASE_URL", URL_VALIDA);
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
    expect(() => getSupabaseClient()).toThrow("SUPABASE_PUBLISHABLE_KEY");
  });

  it("lanza si la URL es de otro proyecto (guardia assertDatzonProject)", () => {
    vi.stubEnv("SUPABASE_URL", "https://proyectoajeno.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(() => getSupabaseClient()).toThrow("proyectoajeno");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run lib/supabase/client.test.ts`
Expected: FAIL, `Cannot find module './client'`.

- [ ] **Step 4: Write minimal implementation**

```ts
// lib/supabase/client.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertDatzonProject } from "./project";

/**
 * Cliente Supabase de la APLICACIÓN en runtime. Usa la clave publishable,
 * sujeta a RLS, la credencial secreta vive solo en scripts/ (CLAUDE.md).
 * Las tablas del proyecto están en el schema `landing`, no en `public`.
 *
 * La clave NO lleva prefijo NEXT_PUBLIC_ a propósito: solo se usa en el
 * servidor (Route Handlers) y no debe empaquetarse hacia el navegador.
 */
let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = assertDatzonProject(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY no está definida. Copia .env.example a .env.local y complétala."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: "landing" },
  });
  return client;
}

/** Solo para tests: descarta el singleton para poder variar el entorno. */
export function _resetSupabaseClient(): void {
  client = null;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm exec vitest run lib/supabase/client.test.ts && pnpm exec tsc --noEmit`
Expected: PASS (4 tests) y tsc sin errores.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/client.test.ts package.json pnpm-lock.yaml
git commit -m "feat: cliente Supabase de runtime con clave publishable y schema landing"
```

---

### Task 3: Migración `landing.leads` (primera migración del proyecto)

**Files:**
- Create: `supabase/migrations/<timestamp>_leads.sql` (timestamp con `date +%Y%m%d%H%M%S`)

**Interfaces:**
- Consumes: nada.
- Produces: tabla `landing.leads` en la base remota, con RLS y modelo buzón. El Route Handler de la Task 4 hace `.from("leads").insert(...)` contra ella (el schema `landing` va en la config del cliente, Task 2).

- [ ] **Step 1: Crear el archivo de migración**

```bash
mkdir -p supabase/migrations
touch "supabase/migrations/$(date +%Y%m%d%H%M%S)_leads.sql"
```

Contenido del archivo:

```sql
-- Tabla de leads del formulario de contacto.
--
-- Modelo "buzón de solo escritura": anon puede insertar y nada más.
-- Sin grant de SELECT/UPDATE/DELETE, quien tenga la clave publishable
-- no puede leer ni alterar leads pase lo que pase; el peor caso de una
-- clave filtrada es basura en la tabla, nunca una fuga.
-- Los leads se leen desde el dashboard de Supabase o con la credencial
-- secreta en scripts locales.
--
-- Diseño y decisiones: docs/superpowers/specs/2026-07-25-formulario-contacto-leads-design.md

create schema if not exists landing;

create table landing.leads (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre     text not null,
  email      text not null,
  mensaje    text not null,
  empresa    text,
  telefono   text,
  industria  text,
  -- Qué CTA convirtió: sección de la home o modal global.
  source     text not null check (source in ('home', 'modal')),
  -- SHA-256 de la IP con sal (LEAD_IP_SALT); nunca la IP en claro.
  ip_hash    text
);

alter table landing.leads enable row level security;

-- PostgREST necesita USAGE sobre el schema además del grant de tabla.
-- OJO: el Data API solo ve schemas listados en "Exposed schemas"
-- (Dashboard → Settings → API); añadir "landing" ahí es un paso manual.
grant usage on schema landing to anon;
grant insert on landing.leads to anon;

create policy leads_anon_insert on landing.leads
  for insert to anon with check (true);
```

- [ ] **Step 2: Aplicar la migración**

Run: `supabase db push --linked`

El proyecto ya está enlazado a `adnvzdcqcneqjemxneht` (verificado en `supabase/.temp/`). Si el comando pide la contraseña de la base y no está disponible de forma no interactiva: **PARAR y preguntar al usuario**, no aplicar el SQL por otra vía sin su OK. (Vía alternativa con su OK: la tool `apply_migration` del conector de Supabase de claude.ai, con el mismo SQL y nombre `leads`; el servidor MCP local del repo es read-only a propósito y no sirve para esto.)

- [ ] **Step 3: Verificar el estado remoto**

Con la tool MCP `execute_sql` (o `supabase migration list` para lo primero):

```sql
-- 1. RLS habilitado (esperado: t)
select relrowsecurity from pg_class c
join pg_namespace n on c.relnamespace = n.oid
where n.nspname = 'landing' and c.relname = 'leads';

-- 2. Grants de anon (esperado: SOLO INSERT)
select grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'landing' and table_name = 'leads' and grantee = 'anon';

-- 3. Policy (esperado: leads_anon_insert, {anon}, INSERT)
select policyname, roles, cmd from pg_policies
where schemaname = 'landing' and tablename = 'leads';
```

Si `anon` tuviera más privilegios que INSERT, la migración está mal: corregir antes de seguir.

- [ ] **Step 4: Registrar el paso manual pendiente**

Añadir `landing` a los schemas expuestos del Data API es un ajuste de config de PostgREST que se hace en el dashboard (Settings → API → "Exposed schemas") y **no puede ir en la migración**. Anotarlo como pendiente para la verificación final (Task 7 lo comprueba con un insert real). Si el ejecutor tiene acceso al usuario, pedirle que lo haga en este punto.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: migración de landing.leads con RLS y modelo buzón de solo escritura"
```

---

### Task 4: Route Handler, persistir y notificar

**Files:**
- Create: `vitest.config.ts` (los tests de esta task importan el route, que usa el alias `@/`; vitest no lee los paths de tsconfig sin esto)
- Modify: `app/api/contact/route.ts` (reescritura completa)
- Test: `app/api/contact/route.test.ts`
- Modify: `package.json` (añadir `resend`)

**Interfaces:**
- Consumes:
  - `contactPayloadSchema`, `type ContactPayload` de `@/lib/contact-schema` (Task 1).
  - `getSupabaseClient()` de `@/lib/supabase/client` (Task 2), en tests se mockea el módulo completo.
- Produces: `POST /api/contact` con el contrato de respuestas del spec (tabla en el propio código).

- [ ] **Step 1: Instalar Resend y crear vitest.config.ts**

```bash
pnpm add resend
```

```ts
// vitest.config.ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // El código de la app usa el alias "@/" (tsconfig paths); vitest no lee
    // tsconfig, así que se declara aquí también.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
```

Verificar que los tests existentes siguen pasando con la config nueva: `pnpm test` → los suites de Tasks 1–2 y `lib/supabase/project.test.ts` en verde.

- [ ] **Step 2: Write the failing tests**

```ts
// app/api/contact/route.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: () => ({ from: fromMock }),
}));

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}));

import { POST } from "./route";

let ipCounter = 0;
/** IP única por test: el rate limiter en memoria del route es módulo-global. */
function requestWith(body: unknown): NextRequest {
  ipCounter++;
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `10.0.0.${ipCounter}`,
    },
    body: JSON.stringify(body),
  });
}

const leadValido = {
  nombre: "Ana Torres",
  email: "ana@acme.com",
  mensaje: "Quiero automatizar el empaquetado de mi planta.",
  empresa: "Acme SAC",
  source: "home",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    insertMock.mockReset().mockResolvedValue({ error: null });
    fromMock.mockClear();
    sendMock.mockReset().mockResolvedValue({ data: { id: "email_1" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_EMAIL", "contacto@datzoncompany.com");
    vi.stubEnv("LEAD_IP_SALT", "sal-de-prueba");
  });

  it("lead válido → 200, insertado en leads con source y sin website", async () => {
    const res = await POST(requestWith({ ...leadValido }));
    expect(res.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith("leads");
    const row = insertMock.mock.calls[0][0];
    expect(row.source).toBe("home");
    expect(row.nombre).toBe("Ana Torres");
    expect(row).not.toHaveProperty("website");
    expect(typeof row.ip_hash).toBe("string");
  });

  it("body no-JSON → 400", async () => {
    const req = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: { "x-forwarded-for": "10.9.9.9" },
      body: "esto no es json",
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("email inválido → 422 y cero inserts", async () => {
    const res = await POST(requestWith({ ...leadValido, email: "nope" }));
    expect(res.status).toBe(422);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("source fuera del enum → 422 y cero inserts", async () => {
    const res = await POST(requestWith({ ...leadValido, source: "admin" }));
    expect(res.status).toBe(422);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("honeypot relleno → 200 silencioso, cero inserts, cero emails", async () => {
    const res = await POST(requestWith({ ...leadValido, website: "spam.com" }));
    expect(res.status).toBe(200);
    expect(insertMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("insert falla → 500 con mensaje que incluye el correo de contacto", async () => {
    insertMock.mockResolvedValue({ error: { message: "boom", code: "XX000" } });
    const res = await POST(requestWith({ ...leadValido }));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("contacto@datzoncompany.com");
  });

  it("email falla → 200 igual (el lead ya está guardado)", async () => {
    sendMock.mockRejectedValue(new Error("resend caído"));
    const res = await POST(requestWith({ ...leadValido }));
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it("sin RESEND_API_KEY → 200, inserta y no intenta enviar", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await POST(requestWith({ ...leadValido }));
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledOnce();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sin LEAD_IP_SALT → inserta con ip_hash null (nunca IP en claro)", async () => {
    vi.stubEnv("LEAD_IP_SALT", "");
    await POST(requestWith({ ...leadValido }));
    expect(insertMock.mock.calls[0][0].ip_hash).toBeNull();
  });

  it("el email de notificación lleva replyTo del lead", async () => {
    await POST(requestWith({ ...leadValido }));
    expect(sendMock.mock.calls[0][0].replyTo).toBe("ana@acme.com");
  });

  it("rate limit: la 6.ª petición de la misma IP → 429", async () => {
    const fija = () =>
      new NextRequest("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "10.200.0.1" },
        body: JSON.stringify(leadValido),
      });
    for (let i = 0; i < 5; i++) {
      expect((await POST(fija())).status).toBe(200);
    }
    expect((await POST(fija())).status).toBe(429);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm exec vitest run app/api/contact/route.test.ts`
Expected: FAIL, el route actual no inserta nada (`fromMock` sin llamadas), el honeypot devuelve 422, no existe `replyTo`, etc.

- [ ] **Step 4: Reescribir el route**

```ts
// app/api/contact/route.ts
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { contactPayloadSchema, type ContactPayload } from "@/lib/contact-schema";
import { getSupabaseClient } from "@/lib/supabase/client";

// PALIATIVO, no garantía: este Map vive en la instancia serverless y muere
// con ella; en Vercel cada invocación puede caer en una instancia distinta.
// Frena ráfagas dentro de una instancia caliente y nada más. El rate limit
// real (estado compartido: Vercel Firewall / Upstash) está fuera de alcance
//, ver el spec 2026-07-25-formulario-contacto-leads-design.md.
const rateMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || entry.reset < now) {
    rateMap.set(ip, { count: 1, reset: now + 3_600_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

/** SHA-256 con sal de la IP; nunca la IP en claro. Sin sal no se guarda nada. */
function hashIp(ip: string): string | null {
  const salt = process.env.LEAD_IP_SALT;
  if (!salt || ip === "unknown") return null;
  return createHash("sha256").update(salt + ip).digest("hex");
}

/**
 * Notifica el lead por email. El lead YA está guardado en la base cuando
 * esto corre: cualquier fallo aquí se registra y no cambia la respuesta.
 * Sin RESEND_API_KEY (cuenta de Resend aún no creada) se omite en silencio.
 */
async function sendNotification(lead: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;
  if (!apiKey || !to) return;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const lines = [
    `Nombre: ${lead.nombre}`,
    lead.empresa ? `Empresa: ${lead.empresa}` : null,
    `Email: ${lead.email}`,
    lead.telefono ? `Teléfono: ${lead.telefono}` : null,
    lead.industria ? `Industria: ${lead.industria}` : null,
    `Origen: ${lead.source === "home" ? "formulario de la home" : "modal de contacto"}`,
    "",
    lead.mensaje,
  ].filter((l): l is string => l !== null);

  await resend.emails.send({
    from: "Datzon Landing <noreply@datzoncompany.com>",
    to,
    replyTo: lead.email,
    subject: `Nuevo lead: ${lead.nombre}${lead.empresa ? `, ${lead.empresa}` : ""}`,
    text: lines.join("\n"),
  });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intente más tarde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const result = contactPayloadSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 422 });
  }

  // Honeypot: descarte silencioso. El bot recibe el mismo 200 que un humano
  // para que no pueda distinguir que fue detectado.
  if (result.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { website: _website, ...lead } = result.data;

  // Insert SIN .select(): devolver la fila exigiría permiso de lectura y
  // rompería el modelo de buzón (anon solo tiene INSERT).
  const { error } = await getSupabaseClient()
    .from("leads")
    .insert({ ...lead, ip_hash: hashIp(ip) });

  if (error) {
    // Solo código y mensaje del error; nunca el contenido del lead.
    console.error("[contact] insert falló:", error.code, error.message);
    return NextResponse.json(
      {
        error:
          "No pudimos registrar tu solicitud. Escríbenos directamente a contacto@datzoncompany.com.",
      },
      { status: 500 }
    );
  }

  try {
    await sendNotification(result.data);
  } catch (err) {
    console.error(
      "[contact] notificación falló (lead ya guardado):",
      err instanceof Error ? err.message : String(err)
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm exec vitest run app/api/contact/route.test.ts && pnpm exec tsc --noEmit`
Expected: PASS (11 tests) y tsc sin errores.

- [ ] **Step 6: Commit**

```bash
git add app/api/contact/route.ts app/api/contact/route.test.ts vitest.config.ts package.json pnpm-lock.yaml
git commit -m "feat: el formulario de contacto persiste en landing.leads y notifica por Resend"
```

---

### Task 5: `ContactForm.tsx` usa el schema compartido

**Files:**
- Modify: `components/ContactForm.tsx`

**Interfaces:**
- Consumes: `contactFieldsSchema`, `type ContactFields`, `INDUSTRIES` de `@/lib/contact-schema` (Task 1).
- Produces: nada nuevo; el POST ahora incluye `source: "home"`.

- [ ] **Step 1: Sustituir el contrato local por el compartido**

En `components/ContactForm.tsx`:

1. Eliminar el bloque local `const schema = z.object({...})`, el `type FormData = z.infer<typeof schema>` y la constante local `INDUSTRIES`. Eliminar el import de `zod` (ya no se usa directamente).
2. Añadir:
   ```ts
   import { contactFieldsSchema, type ContactFields, INDUSTRIES } from "@/lib/contact-schema";
   ```
3. Cambiar `useForm<FormData>({ resolver: zodResolver(schema) })` por `useForm<ContactFields>({ resolver: zodResolver(contactFieldsSchema) })`, y la firma `const onSubmit = async (data: FormData)` por `(data: ContactFields)`.
4. En el `fetch`, enviar el `source`:
   ```ts
   body: JSON.stringify({ ...data, source: "home" }),
   ```

Los campos visibles no cambian: este formulario ya pedía exactamente el contrato canónico.

- [ ] **Step 2: Verificar**

Run: `pnpm exec tsc --noEmit && pnpm test`
Expected: sin errores de tipos; todos los suites en verde.

Comprobar además: `grep -n "z.object" components/ContactForm.tsx` no devuelve nada (el contrato ya no está duplicado aquí).

- [ ] **Step 3: Commit**

```bash
git add components/ContactForm.tsx
git commit -m "refactor: ContactForm usa el schema compartido y envía source home"
```

---

### Task 6: `ContactModal.tsx`, contrato unificado

**Files:**
- Modify: `components/ContactModal.tsx`

**Interfaces:**
- Consumes: `contactFieldsSchema`, `type ContactFields`, `INDUSTRIES` de `@/lib/contact-schema` (Task 1).
- Produces: nada nuevo; el POST ahora incluye `source: "modal"`.

Cambio de producto ya decidido en el spec: el modal **pierde** `disponibilidad`, **gana** `empresa` (opcional) y el select de `industria` (opcional), y `telefono` deja de ser obligatorio. Es el componente más estilizado del sitio: los campos nuevos copian las clases y el patrón de iconos de los existentes.

- [ ] **Step 1: Sustituir el contrato**

1. Eliminar el `contactSchema` local y `type ContactFormData`. Eliminar el import de `zod`.
2. Añadir `import { contactFieldsSchema, type ContactFields, INDUSTRIES } from "@/lib/contact-schema";`
3. `useForm<ContactFields>({ resolver: zodResolver(contactFieldsSchema) })`; la firma de `onSubmit` pasa a `(data: ContactFields)`.
4. En el `fetch`: `body: JSON.stringify({ ...data, source: "modal" })`.
5. En el import de `lucide-react`: quitar `Clock`, añadir `Building2` y `Factory`. Queda: `import { X, Send, User, Mail, MessageSquare, Phone, Building2, Factory } from "lucide-react";`

- [ ] **Step 2: Reemplazar el campo "VENTANA DE DISPONIBILIDAD"**

Eliminar por completo el bloque `{/* Availability */}` (el `div.group` con el icono `Clock` y `{...register("disponibilidad")}`).

En su lugar (y manteniendo el grid de dos columnas donde están email/teléfono) añadir después de ese grid un segundo grid con empresa e industria:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Empresa (opcional) */}
  <div className="group">
    <label
      htmlFor="cm-empresa"
      className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors"
    >
      EMPRESA_
    </label>
    <div className="relative">
      <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
      <input
        id="cm-empresa"
        {...register("empresa")}
        type="text"
        placeholder="ORGANIZACIÓN (OPCIONAL)"
        className={inputClass}
      />
    </div>
  </div>

  {/* Industria (opcional) */}
  <div className="group">
    <label
      htmlFor="cm-industria"
      className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors"
    >
      INDUSTRIA_
    </label>
    <div className="relative">
      <Factory size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
      <select
        id="cm-industria"
        {...register("industria")}
        className={`${inputClass} appearance-none cursor-pointer`}
        defaultValue=""
      >
        <option value="">SELECCIONA (OPCIONAL)</option>
        {INDUSTRIES.map((ind) => (
          <option key={ind} value={ind}>
            {ind.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>
```

Nota: los inputs existentes del modal no tienen `id`/`htmlFor` (sus labels no están asociados). Los campos nuevos sí lo llevan (regla de accesibilidad del proyecto); añadir también `id` + `htmlFor` a los cuatro campos existentes del modal (`cm-nombre`, `cm-email`, `cm-telefono`, `cm-mensaje`) ya que se está tocando el archivo.

- [ ] **Step 3: Teléfono deja de ser obligatorio**

En el campo teléfono: cambiar el placeholder a `"+51 ... (OPCIONAL)"`. El mensaje de error `{errors.telefono && ...}` puede quedarse, con el schema compartido ya no se dispara por omisión.

- [ ] **Step 4: Verificar**

Run: `pnpm exec tsc --noEmit && pnpm test`
Expected: verde. Además:

```bash
grep -rn "disponibilidad" components/ app/
```

Expected: **cero** resultados.

- [ ] **Step 5: Commit**

```bash
git add components/ContactModal.tsx
git commit -m "refactor: ContactModal adopta el contrato unificado (fuera disponibilidad, entra empresa/industria)"
```

---

### Task 7: Entorno, documentación y verificación de punta a punta

**Files:**
- Modify: `.env.example`
- Modify: `.env.local` (solo añadir claves; NO tocar las existentes)
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: entorno completo y verificación final del spec.

- [ ] **Step 1: `.env.example`**

Añadir al final del bloque de Supabase:

```bash
# Publishable Key, cliente de la app en runtime (Route Handlers). Sujeta a
# RLS. SIN prefijo NEXT_PUBLIC_: solo se usa en el servidor.
# Dashboard → Settings → API Keys → "Publishable key"
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx

# Sal para el hash SHA-256 de la IP en landing.leads (nunca la IP en claro).
# Cualquier string aleatorio largo: `openssl rand -hex 16`
LEAD_IP_SALT=xxxxxxxxxxxxxxxx
```

- [ ] **Step 2: `.env.local`**

Obtener la clave publishable con la tool MCP `get_publishable_keys` del conector de Supabase (o pedirla al usuario del dashboard). Generar la sal con `openssl rand -hex 16`. **Añadir** ambas líneas a `.env.local` sin modificar las existentes (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

Recordar al usuario que estas dos mismas variables (más `RESEND_API_KEY` y `CONTACT_EMAIL` cuando exista la cuenta) deben crearse en Vercel → Settings → Environment Variables para Production y Preview.

- [ ] **Step 3: `CLAUDE.md`**

1. En la sección **Base de datos**, añadir tras la regla de RLS:

```markdown
- La tabla `landing.leads` (leads del formulario de contacto) es un **buzón de
  solo escritura**: `anon` tiene INSERT y nada más. No añadir grants de
  lectura; los leads se consultan en el dashboard o con la credencial secreta
  en scripts. El Route Handler usa la clave publishable
  (`SUPABASE_PUBLISHABLE_KEY`, sin `NEXT_PUBLIC_`) vía `lib/supabase/client.ts`.
```

2. En la misma sección, corregir la frase sobre el CLI: dice que `supabase link` está **pendiente**, pero el enlace ya se hizo (existe `supabase/.temp/project-ref` con el ref correcto) y `supabase/migrations/` ya existe desde la Task 3. Reescribirla como:

```markdown
- El CLI de Supabase está instalado, inicializado y **enlazado** al proyecto.
  Las migraciones viven en `supabase/migrations/` y se aplican con
  `supabase db push --linked`.
```

3. En la sección **Proyecto** (línea "El formulario de contacto aún no envía datos reales"), actualizar a: el formulario persiste en `landing.leads`; la notificación por email queda inerte hasta configurar `RESEND_API_KEY` (cuenta de Resend con dominio verificado, pendiente de operaciones).

- [ ] **Step 4: Verificación completa del spec**

```bash
pnpm exec tsc --noEmit && pnpm test && pnpm build
```

Expected: todo verde (para `pnpm build`, con `.env.local` completo del Step 2).

```bash
grep -rn "disponibilidad" components/ app/ lib/        # esperado: nada
grep -rn "console.log" app/api/ components/ lib/       # esperado: nada con datos de contacto
```

- [ ] **Step 5: Prueba real de punta a punta (requiere el paso manual de Task 3)**

Precondición: `landing` añadido a "Exposed schemas" en el dashboard. Si el usuario aún no lo hizo, pedírselo ahora, sin eso el insert desde la app devuelve `PGRST106` y esta prueba falla.

1. `pnpm dev` y enviar el formulario de la home y el del modal con datos de prueba distinguibles (p. ej. nombre "PRUEBA HOME" / "PRUEBA MODAL").
2. Verificar con la tool MCP `execute_sql`:
   ```sql
   select nombre, source, ip_hash is not null as tiene_hash
   from landing.leads order by created_at desc limit 5;
   ```
   Expected: dos filas nuevas, `source` = `home` y `modal`.
3. Confirmar el buzón, con la clave publishable un SELECT debe fallar:
   ```bash
   curl -s "https://adnvzdcqcneqjemxneht.supabase.co/rest/v1/leads?select=*" \
     -H "apikey: $SUPABASE_PUBLISHABLE_KEY" \
     -H "Accept-Profile: landing"
   ```
   Expected: error de permisos (`42501`) o lista vacía; **nunca** las filas insertadas.
4. Borrar las filas de prueba vía `execute_sql`:
   ```sql
   delete from landing.leads where nombre in ('PRUEBA HOME', 'PRUEBA MODAL');
   ```

- [ ] **Step 6: Commit final**

```bash
git add .env.example CLAUDE.md
git commit -m "docs: entorno y reglas de landing.leads; el formulario ya entrega leads"
```

---

## Self-review (hecho al escribir el plan)

- **Cobertura del spec:** contrato unificado (T1, T5, T6), clave publishable + guardia (T2), migración con buzón (T3), tabla de respuestas del handler (T4), honeypot arreglado (T1 + T4), rate limit documentado como paliativo (T4), `reply_to` (T4), env y docs (T7), las 6 verificaciones del spec (T4 tests + T7). Sin huecos detectados.
- **Riesgo señalado, no resuelto por código:** exponer `landing` en el Data API es config de PostgREST (dashboard), no SQL; está en T3/T7 como paso manual explícito.
- **Consistencia de tipos:** `ContactFields`/`ContactPayload` definidos en T1 y usados con esos nombres en T4–T6; `getSupabaseClient`/`_resetSupabaseClient` consistentes entre T2 y T4.
