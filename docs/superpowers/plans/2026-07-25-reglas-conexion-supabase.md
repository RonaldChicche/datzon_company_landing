# Reglas y guardias de conexión a Supabase, Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que este repositorio solo pueda conectarse al proyecto Supabase `adnvzdcqcneqjemxneht`, confinar las credenciales que bypasean RLS a scripts locales, y que la documentación del repo describa el estado real de la base de datos.

**Architecture:** Tres capas de enforcement de proyecto único: un `.mcp.json` versionado que acota el servidor MCP, un guardia en código que valida `SUPABASE_URL` al arranque y falla ruidosamente, y reglas escritas en `CLAUDE.md`. Se establece además un workflow de migraciones por CLI, estrenado con el borrado de una función huérfana.

**Tech Stack:** Next.js 16 (App Router), TypeScript estricto, pnpm 10, tsx, `@supabase/supabase-js`, Supabase CLI, vitest.

**Spec:** [`docs/superpowers/specs/2026-07-25-reglas-conexion-supabase-design.md`](../specs/2026-07-25-reglas-conexion-supabase-design.md) (commit `53b6aec`)

**Rama:** `feat/rediseno-deep-space`

## Global Constraints

- **Proyecto Supabase único:** `adnvzdcqcneqjemxneht`. Ningún archivo de este repo puede referenciar otro ref. El otro proyecto de la organización, `thwotgoldsncfsgndlii` (`datzon_company`), está prohibido.
- **TypeScript estricto.** Sin `any` explícitos.
- **Imports con alias `@/`** siempre que resuelva en el contexto de ejecución.
- **Tailwind CSS v4 únicamente.** Ninguna tarea de este plan toca estilos.
- **La credencial secreta (`service_role` / `sb_secret_…`) nunca aparece en código de la aplicación.** Solo en scripts que corren en la máquina del desarrollador leyendo `.env.local`.
- **`SECURITY DEFINER` prohibido** salvo justificación escrita en el propio archivo SQL.
- **Idioma:** comentarios, mensajes de error y documentación en español neutro (forma «tú», no voseo), consistente con el resto del repo.
- **Commits en español**, con prefijo convencional (`feat:`, `fix:`, `docs:`, `chore:`).
- **Toda operación destructiva sobre la base de producción requiere confirmación explícita del usuario** antes de ejecutarse.

## Nota sobre una adición al spec

El spec aprobado describe verificación **manual** del guardia (apuntar `SUPABASE_URL` a un ref falso a mano). Este plan añade **vitest** y un paso de tests en CI, porque `assertDatzonProject` es una función pura y es la única lógica real del sub-proyecto. Es una desviación deliberada del spec, acotada a las Tareas 2 y 3. Si se descarta, la Tarea 2 se reduce a escribir la función y verificarla con el método manual del spec.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `.mcp.json` | Acota el servidor MCP de Supabase a un proyecto, en modo solo lectura. Versionado para que lo herede quien clone. |
| `.gitignore` | Añade `graphify-out/` para que la salida generada no entre al historial. |
| `lib/supabase/project.ts` | Única fuente de verdad del ref esperado y la validación. Sin dependencias, sin I/O. |
| `lib/supabase/project.test.ts` | Tests de la validación. |
| `scripts/optimize-upload.ts` | Consume el guardia antes de crear el cliente de Supabase. |
| `scripts/supabase-storage-rls.sql` | Documenta el estado real de RLS en Storage y por qué es correcto. |
| `supabase/` | Configuración y migraciones del CLI. Generado. |
| `CLAUDE.md` | Reglas de conexión, credenciales y ubicación de tablas. |
| `.github/workflows/ci.yml` | Paso de tests. |

---

### Task 1: Guardrails de repositorio

Config a nivel repo que restringe las herramientas antes de tocar código. Va primero porque `graphify-out/` sin ignorar contamina cualquier commit posterior.

**Files:**
- Modify: `.gitignore`
- Create: `.mcp.json`

**Interfaces:**
- Consumes: nada.
- Produces: `.mcp.json` con el servidor MCP `supabase` acotado a `adnvzdcqcneqjemxneht`. Ninguna tarea posterior importa código de aquí.

- [ ] **Step 1: Confirmar que `graphify-out/` está sin ignorar**

Run: `git status --short`
Expected: aparece `?? graphify-out/` en la salida.

- [ ] **Step 2: Añadir `graphify-out/` al `.gitignore`**

Añadir al final del archivo:

```gitignore

# salida generada por graphify (grafo de conocimiento, no es fuente)
graphify-out/
```

- [ ] **Step 3: Verificar que desapareció del estado de git**

Run: `git status --short`
Expected: `graphify-out/` ya no aparece.

- [ ] **Step 4: Crear `.mcp.json`**

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=adnvzdcqcneqjemxneht&read_only=true&features=database,docs,storage"
    }
  }
}
```

`project_ref` acota el servidor a un proyecto y desactiva las herramientas de gestión de cuenta, de modo que `list_projects` deja de existir. `read_only=true` hace que toda consulta corra como usuario de solo lectura: es intencional que bloquee el DDL vía MCP, porque el DDL va por migraciones (Tarea 5). `features` reduce la superficie a lo que este proyecto usa.

- [ ] **Step 5: Verificar que es JSON válido**

Run: `node -e "JSON.parse(require('fs').readFileSync('.mcp.json','utf8')); console.log('JSON válido')"`
Expected: imprime `JSON válido`.

- [ ] **Step 6: Commit**

```bash
git add .gitignore .mcp.json
git commit -m "chore: acota el servidor MCP al proyecto Datzon e ignora graphify-out"
```

- [ ] **Step 7: Acción manual del usuario, desactivar el conector de claude.ai**

Este paso no lo puede hacer un agente. El usuario debe ir a claude.ai → Configuración → Conectores y **desactivar el conector de Supabase**. Mientras siga activo, es una vía paralela sin acotar y el `.mcp.json` no protege de nada.

Después, recargar la sesión y verificar que `list_projects` ya no está disponible. Si sigue disponible, el conector no se desactivó o la sesión no se recargó.

---

### Task 2: Guardia de proyecto, con tests

La única lógica real del sub-proyecto. Función pura, sin I/O, testeable de forma aislada.

**Files:**
- Create: `lib/supabase/project.ts`
- Create: `lib/supabase/project.test.ts`
- Modify: `package.json` (devDependency `vitest`, script `test`)
- Modify: `.github/workflows/ci.yml` (paso de tests)

**Interfaces:**
- Consumes: nada.
- Produces:
  - `export const EXPECTED_PROJECT_REF: string`, el literal `"adnvzdcqcneqjemxneht"`.
  - `export function assertDatzonProject(rawUrl: string | undefined): string`, devuelve `rawUrl` sin modificar si el ref del hostname coincide con `EXPECTED_PROJECT_REF`; lanza `Error` en cualquier otro caso. La Tarea 3 la consume.

- [ ] **Step 1: Instalar vitest**

Run: `pnpm add -D vitest`

- [ ] **Step 2: Añadir el script de tests a `package.json`**

En el bloque `"scripts"`, después de `"lint": "eslint",`:

```json
    "test": "vitest run",
```

- [ ] **Step 3: Escribir el test que falla**

Crear `lib/supabase/project.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { assertDatzonProject, EXPECTED_PROJECT_REF } from "./project";

describe("assertDatzonProject", () => {
  const urlValida = `https://${EXPECTED_PROJECT_REF}.supabase.co`;

  it("devuelve la URL sin modificar cuando el ref es el de Datzon", () => {
    expect(assertDatzonProject(urlValida)).toBe(urlValida);
  });

  it("acepta la URL con barra final", () => {
    const conBarra = `${urlValida}/`;
    expect(assertDatzonProject(conBarra)).toBe(conBarra);
  });

  it("lanza error cuando SUPABASE_URL no está definida", () => {
    expect(() => assertDatzonProject(undefined)).toThrow("SUPABASE_URL no está definida");
  });

  it("lanza error cuando SUPABASE_URL está vacía", () => {
    expect(() => assertDatzonProject("")).toThrow("SUPABASE_URL no está definida");
  });

  it("lanza error cuando la URL es inválida", () => {
    expect(() => assertDatzonProject("no-es-una-url")).toThrow("no es una URL válida");
  });

  it("rechaza el otro proyecto de la organización", () => {
    const otroProyecto = "https://thwotgoldsncfsgndlii.supabase.co";
    expect(() => assertDatzonProject(otroProyecto)).toThrow("thwotgoldsncfsgndlii");
  });

  it("el mensaje de error nombra el ref esperado y el recibido", () => {
    const ajeno = "https://proyectoajeno.supabase.co";
    expect(() => assertDatzonProject(ajeno)).toThrow(EXPECTED_PROJECT_REF);
    expect(() => assertDatzonProject(ajeno)).toThrow("proyectoajeno");
  });
});
```

- [ ] **Step 4: Correr los tests y confirmar que fallan**

Run: `pnpm test`
Expected: FALLA. El error es de resolución de módulo ( `Failed to resolve import "./project"` ) porque `lib/supabase/project.ts` todavía no existe.

- [ ] **Step 5: Escribir la implementación mínima**

Crear `lib/supabase/project.ts`:

```ts
/**
 * Este repositorio solo puede hablar con el proyecto Supabase de Datzon.
 *
 * El ref no es un secreto: ya aparece en lib/projects.ts (URL pública del
 * bucket) y en next.config.ts (remotePatterns). Lo que aporta este módulo es
 * un punto único donde se valida, para que una credencial de otro proyecto
 * falle al arranque en lugar de escribir en la base equivocada.
 */
export const EXPECTED_PROJECT_REF = "adnvzdcqcneqjemxneht";

export function assertDatzonProject(rawUrl: string | undefined): string {
  if (!rawUrl) {
    throw new Error(
      "SUPABASE_URL no está definida. Copia .env.example a .env.local y complétala."
    );
  }

  let hostname: string;
  try {
    hostname = new URL(rawUrl).hostname;
  } catch {
    throw new Error(`SUPABASE_URL no es una URL válida: ${rawUrl}`);
  }

  const ref = hostname.split(".")[0];
  if (ref !== EXPECTED_PROJECT_REF) {
    throw new Error(
      `Proyecto Supabase incorrecto: se esperaba "${EXPECTED_PROJECT_REF}" y se recibió "${ref}". ` +
        "Este repositorio solo puede conectarse al proyecto Datzon."
    );
  }

  return rawUrl;
}
```

- [ ] **Step 6: Correr los tests y confirmar que pasan**

Run: `pnpm test`
Expected: PASA. 7 tests en `lib/supabase/project.test.ts`.

- [ ] **Step 7: Confirmar que el type check sigue limpio**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores. El archivo de test entra en `tsc` porque `tsconfig.json` incluye `**/*.ts`; los imports explícitos de `vitest` hacen que type-checkee sin tocar la configuración.

- [ ] **Step 8: Añadir el paso de tests al CI**

En `.github/workflows/ci.yml`, entre el paso `Type check` y el paso `Build`:

```yaml
      - name: Tests
        run: pnpm test
```

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml lib/supabase/project.ts lib/supabase/project.test.ts .github/workflows/ci.yml
git commit -m "feat: guardia que restringe el repo al proyecto Supabase de Datzon"
```

---

### Task 3: Cablear el guardia en el script de subida

El script es hoy el único consumidor de credenciales de Supabase. Sin este cableado, la Tarea 2 es código muerto.

**Files:**
- Modify: `scripts/optimize-upload.ts:41-54`

**Interfaces:**
- Consumes: `assertDatzonProject` de `lib/supabase/project.ts` (Tarea 2).
- Produces: nada que consuman tareas posteriores.

- [ ] **Step 1: Añadir el import**

En `scripts/optimize-upload.ts`, junto a los demás imports (líneas 20-25), añadir:

```ts
import { assertDatzonProject } from "@/lib/supabase/project";
```

- [ ] **Step 2: Invocar el guardia antes de crear el cliente**

Reemplazar el bloque de validación de variables de entorno y creación del cliente (líneas 41-54) por:

```ts
// ── Validar vars de entorno ───────────────────────────────────────────────────
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "\n❌  Faltan variables en .env.local:\n\n" +
    "    SUPABASE_URL=https://adnvzdcqcneqjemxneht.supabase.co\n" +
    "    SUPABASE_SERVICE_ROLE_KEY=<Settings → API → service_role secret>\n"
  );
  process.exit(1);
}

// ── Restricción de proyecto único ─────────────────────────────────────────────
// Este script usa la service_role key, que bypasea RLS. Fallar acá evita
// escribir en un proyecto que no es el de Datzon.
try {
  assertDatzonProject(SUPABASE_URL);
} catch (err) {
  console.error(`\n❌  ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
```

- [ ] **Step 3: Verificar que el alias `@/` resuelve bajo tsx**

Run: `pnpm optimize-images`
Expected: el script arranca y llega a imprimir `ℹ️   Sin imágenes en scripts/images-to-upload/` (la carpeta solo tiene `.gitkeep`).

Si en cambio falla con un error de resolución de módulo (`Cannot find module '@/lib/supabase/project'`), cambiar el import a ruta relativa y volver a correr:

```ts
import { assertDatzonProject } from "../lib/supabase/project";
```

No modificar `tsconfig.json` para resolver esto.

- [ ] **Step 4: Verificar que el guardia rechaza otro proyecto**

Correr el script forzando el ref del otro proyecto de la organización, sin tocar `.env.local`:

Run: `SUPABASE_URL=https://thwotgoldsncfsgndlii.supabase.co pnpm optimize-images`
Expected: sale con código distinto de cero e imprime `Proyecto Supabase incorrecto: se esperaba "adnvzdcqcneqjemxneht" y se recibió "thwotgoldsncfsgndlii"`.

Nota: `scripts/optimize-upload.ts` llama a `process.loadEnvFile(".env.local")` antes de leer `process.env`. Confirmar que la variable del shell efectivamente gana; si `.env.local` la sobrescribe, el test no prueba nada. En ese caso, verificar comentando temporalmente la línea `SUPABASE_URL` de `.env.local`, y restaurarla después.

- [ ] **Step 5: Confirmar que el camino feliz sigue funcionando**

Run: `pnpm optimize-images`
Expected: vuelve a arrancar sin error de proyecto.

- [ ] **Step 6: Type check y tests**

Run: `pnpm exec tsc --noEmit && pnpm test`
Expected: ambos limpios.

- [ ] **Step 7: Commit**

```bash
git add scripts/optimize-upload.ts
git commit -m "feat: el script de subida valida el proyecto Supabase antes de conectarse"
```

---

### Task 4: Reescribir la documentación de RLS de Storage

`scripts/supabase-storage-rls.sql` describe políticas que nunca se ejecutaron. Se convierte en documentación del estado real.

**Files:**
- Modify: `scripts/supabase-storage-rls.sql` (reescritura completa)

**Interfaces:**
- Consumes: nada.
- Produces: nada.

- [ ] **Step 1: Verificar el estado real antes de documentarlo**

No documentar de memoria. Confirmar con el MCP (funciona en modo solo lectura) que siguen sin existir políticas:

```sql
select policyname, cmd, roles::text
from pg_policies
where schemaname = 'storage' and tablename = 'objects';
```

Expected: cero filas. Si devolviera filas, **detenerse** y reportar: el estado cambió respecto a lo medido el 2026-07-25 y el spec necesita revisión.

- [ ] **Step 2: Confirmar que el bucket es público**

```sql
select id, public from storage.buckets where id = 'landing';
```

Expected: una fila, `public = true`.

- [ ] **Step 3: Reescribir el archivo completo**

Reemplazar todo el contenido de `scripts/supabase-storage-rls.sql` por:

```sql
-- ============================================================
-- Estado de RLS del bucket "landing", proyecto Datzon
-- (adnvzdcqcneqjemxneht)
--
-- ESTE ARCHIVO NO SE EJECUTA. Documenta la configuración real,
-- verificada el 2026-07-25. Ver el spec en
-- docs/superpowers/specs/2026-07-25-reglas-conexion-supabase-design.md
-- ============================================================

-- ── Estado actual ─────────────────────────────────────────────────────────────
--
--   Bucket "landing"        → public = true
--   storage.objects         → RLS habilitado, CERO políticas
--
-- Consecuencias, y por qué esto es correcto:
--
--   LECTURA   Las imágenes se sirven por la URL pública del bucket. Funciona
--             porque el bucket es public, no por una política de RLS.
--
--   ESCRITURA Denegada para anon y authenticated. Con RLS habilitado y sin
--             políticas, Postgres deniega por defecto: no hace falta escribir
--             una política de denegación explícita.
--
--   SCRIPTS   scripts/optimize-upload.ts sube con la service_role key, que
--             tiene BYPASSRLS. Por eso funciona sin ninguna política.

-- ── Por qué NO hay una política de lectura pública ────────────────────────────
--
-- Una versión anterior de este archivo proponía:
--
--   CREATE POLICY "landing_lectura_publica"
--   ON storage.objects FOR SELECT TO public
--   USING (bucket_id = 'landing');
--
-- Nunca se ejecutó, y se decidió NO ejecutarla. Es redundante con
-- public = true, y sería una política más que mantener y auditar sin que
-- cambie el comportamiento observable.
--
-- No la agregues "para que quede explícito". Si en algún momento el bucket
-- pasa a private, entonces sí hará falta una política de lectura, y este
-- comentario deja de aplicar.

-- ── Si en el futuro hace falta escritura desde el cliente ─────────────────────
--
-- Agregar una política acotada acá, en lugar de repartir la service_role key.
-- La regla del proyecto (CLAUDE.md) es que la credencial secreta vive solo en
-- scripts locales.

-- ── Rate limiting ─────────────────────────────────────────────────────────────
--
-- Proteger contra abuso de peticiones de lectura se maneja a nivel de
-- infraestructura (Vercel CDN cache, límites del plan de Supabase), no de RLS.
-- RLS no es el lugar para rate limiting.
```

- [ ] **Step 4: Commit**

```bash
git add scripts/supabase-storage-rls.sql
git commit -m "docs: el SQL de RLS documenta el estado real del bucket landing"
```

---

### Task 5: Workflow de migraciones y borrado de la función huérfana

Establece el flujo de migraciones versionadas y lo estrena con un cambio de riesgo bajo. **Incluye una operación destructiva sobre producción.**

**Files:**
- Create: `supabase/config.toml` y `supabase/.gitignore` (generados por `supabase init`)
- Create: `supabase/migrations/<timestamp>_drop_orphan_actualizar_saldo.sql`

**Interfaces:**
- Consumes: la restricción de proyecto único (`adnvzdcqcneqjemxneht`) de las Constraints globales.
- Produces: el directorio `supabase/` como ubicación canónica de las migraciones futuras.

- [ ] **Step 1: Instalar el CLI como devDependency**

Se instala como dependencia del proyecto, no global, para que la versión quede fijada en el lockfile y sea reproducible por quien clone.

Run: `pnpm add -D supabase`

- [ ] **Step 2: Verificar que el binario quedó utilizable**

Run: `pnpm exec supabase --version`
Expected: imprime un número de versión.

Si falla porque pnpm omitió el script de instalación (este repo ya usa `ignoredBuiltDependencies` para `sharp` y `unrs-resolver`), aprobar el build de `supabase`:

Run: `pnpm approve-builds`

y volver a verificar. Si tras ese intento sigue fallando, no insistir: instalar por Homebrew con `brew install supabase/tap/supabase`, desinstalar la devDependency con `pnpm remove supabase`, y anotar en el commit que el CLI queda como herramienta local en lugar de dependencia fijada.

- [ ] **Step 3: Inicializar el proyecto**

Run: `pnpm exec supabase init`
Expected: crea `supabase/config.toml` y `supabase/.gitignore`.

- [ ] **Step 4: Enlazar al proyecto Datzon, requiere acción del usuario**

Run: `pnpm exec supabase link --project-ref adnvzdcqcneqjemxneht`

El comando pide la contraseña de la base de datos. **La tiene que ingresar el usuario**; un agente no puede obtenerla. Si no está disponible, detener la tarea aquí y reportarlo.

Verificar que se enlazó al proyecto correcto y no a otro:

Run: `pnpm exec supabase projects list`
Expected: `adnvzdcqcneqjemxneht` aparece marcado como enlazado.

- [ ] **Step 5: Verificar que ningún trigger depende de la función**

Antes de borrar nada, comprobar que es realmente código muerto. Vía MCP (solo lectura basta):

```sql
select tgname, tgrelid::regclass as tabla
from pg_trigger
where tgfoid = 'public.actualizar_saldo'::regproc;
```

Expected: cero filas.

Si devuelve alguna fila, **detenerse y no borrar**. Significa que hay un trigger activo y el supuesto del spec (código muerto) es falso.

- [ ] **Step 6: Crear el archivo de migración**

Run: `pnpm exec supabase migration new drop_orphan_actualizar_saldo`
Expected: crea `supabase/migrations/<timestamp>_drop_orphan_actualizar_saldo.sql`, vacío.

- [ ] **Step 7: Escribir la migración**

Contenido del archivo generado:

```sql
-- Borra una función huérfana que quedó de otra aplicación.
--
-- public.actualizar_saldo es un trigger de una app de finanzas personales:
-- actualiza una tabla "cuentas" con saldo_actual / monto / tipo. Esa tabla no
-- existe en este proyecto y ningún trigger referencia la función (verificado
-- contra pg_trigger antes de escribir esta migración).
--
-- Era el único hallazgo del security advisor
-- (function_search_path_mutable, WARN).

drop function if exists public.actualizar_saldo();
```

- [ ] **Step 8: Confirmación explícita del usuario antes de tocar producción**

El siguiente paso escribe en la base de datos de producción. Pedir confirmación explícita al usuario, mostrándole el contenido de la migración. No continuar sin un sí.

- [ ] **Step 9: Aplicar la migración**

Run: `pnpm exec supabase db push`
Expected: aplica una migración pendiente y termina sin error.

- [ ] **Step 10: Verificar que la función ya no existe**

```sql
select proname
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public';
```

Expected: cero filas.

- [ ] **Step 11: Verificar que el security advisor quedó limpio**

Correr el advisor de seguridad sobre `adnvzdcqcneqjemxneht`.
Expected: sin hallazgos. En particular, desapareció `function_search_path_mutable`.

- [ ] **Step 12: Verificar que el bucket quedó intacto**

Ninguna parte de esta tarea debía tocar datos. Confirmarlo:

```sql
select count(*) as objetos,
       round(sum((metadata->>'size')::bigint)/1024.0/1024.0, 2) as mb
from storage.objects
where bucket_id = 'landing';
```

Expected: 19 objetos, 2.06 MB, los mismos valores medidos el 2026-07-25.

- [ ] **Step 13: Commit**

```bash
git add package.json pnpm-lock.yaml supabase/
git commit -m "chore: workflow de migraciones por CLI y borrado de función huérfana"
```

---

### Task 6: Reglas en CLAUDE.md

Documenta las reglas para agentes y personas, y corrige una afirmación falsa del archivo.

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: `EXPECTED_PROJECT_REF` y el modelo de credenciales de las tareas anteriores, solo como referencia textual.
- Produces: nada.

- [ ] **Step 1: Añadir la sección de reglas de Supabase**

Insertar antes de la sección `## Referencias de Notion`:

```markdown
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
- `SECURITY DEFINER` está prohibido salvo justificación escrita en el propio archivo SQL.
- Los cambios de schema van por migraciones del CLI en `supabase/migrations/`, versionadas. No se aplica DDL suelto: `.mcp.json` usa `read_only=true` justamente para impedirlo.

### Storage

- **Todos los objetos van al bucket `landing`**, organizados por prefijo según su tipo.
- El estado real de RLS del bucket está documentado en `scripts/supabase-storage-rls.sql`. Ese archivo **no se ejecuta**: describe la configuración vigente y por qué es correcta.
```

- [ ] **Step 2: Declarar que `.claude/` es local y no versionado**

`.claude/` está en `.gitignore` (línea 38), así que `.claude/CLAUDE.md` **no lo recibe quien clone el repositorio**. Hoy ese archivo local contiene una regla de graphify que nadie más hereda. Como todo este sub-proyecto trata de reglas que deben sobrevivir a un clon, conviene dejarlo escrito.

Añadir al final de la sección `## Modo de trabajo` de `CLAUDE.md`:

```markdown
### Dónde viven las reglas

Este archivo (`CLAUDE.md` en la raíz) es la **única fuente de reglas compartidas** del proyecto: está versionado y lo recibe cualquiera que clone el repositorio.

`.claude/` está en `.gitignore`. Es configuración local de cada máquina. Una regla escrita ahí no la hereda nadie más, así que no pongas ahí nada que el equipo deba cumplir.
```

- [ ] **Step 3: Verificar el supuesto antes de dar el paso por bueno**

Run: `git check-ignore -v .claude/CLAUDE.md`
Expected: confirma que `.gitignore` lo ignora.

Si el comando no devuelve nada, `.claude/` dejó de estar ignorado desde el 2026-07-25 y el texto del paso anterior es falso: corregirlo antes de commitear.

- [ ] **Step 4: Verificar que el repo sigue limpio**

Run: `pnpm exec tsc --noEmit && pnpm test && pnpm lint`
Expected: los tres limpios.

- [ ] **Step 5: Commit**

`CLAUDE.md` ya tiene cambios sin commitear previos a este plan (una sección de graphify). Revisar el diff completo antes de añadir, para no arrastrar nada inesperado:

```bash
git diff CLAUDE.md
git add CLAUDE.md
git commit -m "docs: reglas de conexión, credenciales y schema de Supabase"
```

---

## Verificación final del sub-proyecto

Después de la Tarea 6, comprobar la lista de verificación del spec de punta a punta:

- [ ] El guardia rechaza un ref ajeno y acepta el correcto (Tarea 3, pasos 4 y 5).
- [ ] `list_projects` ya no está disponible y las escrituras vía MCP son rechazadas (Tarea 1, paso 7, depende de que el usuario haya desactivado el conector de claude.ai).
- [ ] El security advisor no reporta hallazgos (Tarea 5, paso 11).
- [ ] El bucket `landing` conserva 19 objetos y 2.06 MB (Tarea 5, paso 12).
- [ ] `pnpm build` y `pnpm lint` en verde.
- [ ] `git status --short` no lista `graphify-out/`.

## Lo que este plan deliberadamente NO hace

- No crea el schema `landing` ni ninguna tabla. A no introduce tablas; la regla queda escrita para la primera que aparezca.
- No mueve `@supabase/supabase-js` a `dependencies`. Sigue siendo correcto que esté en `devDependencies` porque solo lo consume el script. El movimiento corresponde a la tarea que introduzca el primer cliente de runtime.
- No toca imágenes, assets ni `next.config.ts`, eso es el sub-proyecto B.
- No implementa CSP, eso es el sub-proyecto C.
