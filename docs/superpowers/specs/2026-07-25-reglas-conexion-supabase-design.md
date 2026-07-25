# Reglas y guardias de conexión a Supabase

**Fecha:** 2026-07-25
**Rama:** `feat/rediseno-deep-space`
**Sub-proyecto:** A (de tres — ver "Fuera de alcance")

---

## Contexto

La landing usa Supabase Storage para las imágenes de proyectos. Durante una auditoría del repositorio y del proyecto Supabase aparecieron varias divergencias entre lo que el código dice y lo que realmente está configurado:

- El conector MCP de Supabase apuntaba a una organización que no contiene el proyecto de Datzon. Al reautorizar, quedó visible que existen **dos** proyectos: `Datzon` (`adnvzdcqcneqjemxneht`, activo, el que usa el código) y `datzon_company` (`thwotgoldsncfsgndlii`, pausado, sin uso conocido). Nada impide que una herramienta o una persona escriba en el equivocado.
- `scripts/supabase-storage-rls.sql` **nunca se ejecutó**. `pg_policies` sobre `storage.objects` devuelve cero filas. El archivo describe un estado que no existe.
- El schema `public` del proyecto `Datzon` no tiene tablas, pero sí una función huérfana `public.actualizar_saldo`: un trigger de una aplicación de finanzas personales (tabla `cuentas`, columnas `saldo_actual`, `monto`, `tipo`) que ya no existe. Es el único hallazgo del security advisor.
- No hay reglas escritas sobre dónde viven las tablas ni sobre qué credencial usa cada tipo de acceso.

Este documento define esas reglas y, sobre todo, **cómo hacerlas cumplir** para que no dependan de que alguien las recuerde.

## Objetivo

Que este repositorio solo pueda conectarse al proyecto Supabase `adnvzdcqcneqjemxneht`, que las credenciales que bypasean RLS estén confinadas a scripts locales, y que la documentación del repo describa el estado real de la base de datos.

## Estado verificado de partida

Medido el 2026-07-25 contra el proyecto `adnvzdcqcneqjemxneht`:

| Aspecto | Estado real |
|---|---|
| Schema `public` | Cero tablas. Una función huérfana `actualizar_saldo`. |
| Bucket `landing` | Público, 19 objetos, 2.06 MB, todos bajo `project/<slug>/`, subidos el 2026-06-12. |
| Políticas RLS en `storage.objects` | **Ninguna.** RLS habilitado, sin políticas. |
| Lectura pública de imágenes | Funciona por `public: true` del bucket, no por política. |
| Escritura de `anon` / `authenticated` | Denegada por defecto (RLS activo sin políticas). |
| Security advisor | 1 WARN: `function_search_path_mutable` en `actualizar_saldo`. |
| `@supabase/supabase-js` | En `devDependencies` (correcto hoy: solo lo usa el script). |
| Workflow de migraciones | No existe. Sin CLI, sin carpeta `supabase/`. |

---

## Diseño

### 1. Enforcement de proyecto único

Tres capas. Solo las dos primeras son barreras reales; la tercera es documentación.

#### 1.1 `.mcp.json` versionado

Se crea en la raíz del repositorio y **se commitea**, para que cualquiera que clone herede la restricción:

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

Qué hace cada parámetro:

- `project_ref` — acota el servidor a un proyecto y **desactiva las herramientas de gestión de cuenta**. Con esto `list_projects` deja de existir: no hay forma de descubrir ni alcanzar otro proyecto.
- `read_only=true` — todas las consultas corren como usuario de solo lectura. Es el default deliberado: hoy hay cero tablas y prácticamente todo el uso será inspección. El DDL es raro y debe pasar por un archivo de migración revisado, no por una llamada suelta.
- `features=database,docs,storage` — reduce la superficie a lo que este proyecto usa. Quedan fuera `branching`, `edge functions` y `debugging`.

**Requisito para que esto sirva:** hay que desactivar el conector de Supabase de claude.ai. Si sigue activo, es una vía paralela sin acotar y las demás capas no lo tapan. Esta es una acción manual del usuario, fuera del repositorio.

**Consecuencia aceptada:** con `read_only=true`, `apply_migration` y cualquier DDL vía MCP fallarán. Es intencional. El DDL va por el CLI (sección 2.3).

#### 1.2 Guardia en código

Archivo nuevo `lib/supabase/project.ts`:

```ts
/**
 * Este repositorio solo puede hablar con el proyecto Supabase de Datzon.
 * El ref no es un secreto: ya aparece en lib/projects.ts y en next.config.ts.
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
      `Este repositorio solo puede conectarse al proyecto Datzon.`
    );
  }

  return rawUrl;
}
```

Se invoca en `scripts/optimize-upload.ts` inmediatamente después de leer las variables de entorno y antes de crear el cliente. Cualquier factory de cliente que se agregue en el futuro debe llamarla también.

El script corre bajo `tsx`, no bajo el bundler de Next, así que la implementación debe confirmar que el alias `@/` resuelve en ese contexto. Si no resuelve, se importa con ruta relativa (`../lib/supabase/project`) en lugar de cambiar la configuración de TypeScript.

Falla ruidosamente y en el arranque, así que alguien que clone el repo con credenciales de otro proyecto lo descubre de inmediato en lugar de escribir en la base equivocada.

#### 1.3 Regla en `CLAUDE.md`

Sección nueva que declara la restricción de proyecto único, el modelo de credenciales de la sección 2 y la ubicación de las tablas. Es advisory: sirve para orientar a agentes y personas, no bloquea nada por sí sola.

En la misma edición se deja constancia de que `.claude/` está en `.gitignore` (línea 38) y por lo tanto es configuración **local, no versionada**. Hoy `.claude/CLAUDE.md` contiene una regla de graphify que nadie que clone el repositorio recibe. Dado que todo este sub-proyecto trata de reglas que deben sobrevivir a un clon, conviene que el `CLAUDE.md` de la raíz diga explícitamente que es la única fuente de reglas compartidas.

### 2. Modelo de acceso a datos

#### 2.1 Todas las tablas en el schema `landing`

Ninguna tabla del proyecto va en `public`. La documentación de Supabase lo respalda: *"A dedicated schema adds another boundary around your Data API"*. Además separa las tablas de Datzon del residuo que ya vive en `public`.

**A no crea el schema ni ninguna tabla**, porque no introduce ninguna. La regla aplica a la primera tabla que se cree.

Contexto con fecha: desde el 2026-04-28 las tablas ya no se auto-exponen al Data API. Rige para proyectos nuevos desde el 2026-05-30 y **para todos los proyectos desde el 2026-10-30**. `Datzon` es de enero de 2026, así que le aplica en octubre. El diseño de grants explícitos no es una preferencia: es hacia donde va Supabase.

#### 2.2 Dos clientes, nunca intercambiables

| Cliente | Credencial | Dónde se usa | Frente a RLS |
|---|---|---|---|
| App en runtime | `sb_publishable_…` (o legacy `anon`) | Route Handlers, Server Components | **Sujeto a RLS** |
| Scripts locales | `sb_secret_…` (o legacy `service_role`) | Solo `scripts/optimize-upload.ts` | Lo bypasea |

Reglas duras:

- La credencial secreta **nunca** aparece en código de la aplicación, solo en scripts que corren en la máquina del desarrollador con `.env.local`.
- Toda tabla en `landing` lleva RLS habilitado, con grants explícitos y mínimos por rol.
- `SECURITY DEFINER` está prohibido salvo justificación escrita en el propio archivo SQL.

La documentación de Supabase es explícita en que las secret keys *"provide full access to your project's data, bypassing Row Level Security"* y en que no son la vía recomendada para todo el trabajo de servidor. Usarlas en todos lados dejaría el RLS de adorno.

Ilustración de a dónde lleva la regla, para una tabla futura de leads: `grant insert` a `anon` y **ningún** `select`. Aunque se filtrara la publishable key, nadie podría leer los contactos. Con `service_role` esa garantía no existe.

**Nota de implementación:** `@supabase/supabase-js` está hoy en `devDependencies`, lo cual es correcto porque solo lo consume el script. En cuanto exista un cliente de runtime hay que moverlo a `dependencies` o el build de producción fallará.

#### 2.3 Workflow de migraciones

Se adopta el flujo imperativo del CLI, versionado en git:

1. Instalar el Supabase CLI (hoy no está instalado).
2. `supabase init` — crea `supabase/config.toml` y su `.gitignore`.
3. `supabase link --project-ref adnvzdcqcneqjemxneht` — requiere la contraseña de la base de datos, que es una acción manual del usuario.
4. Las migraciones se crean con `supabase migration new <nombre>` y se commitean.

Así el schema es reproducible por quien clone el repositorio, y el DDL queda revisable en un diff en lugar de ejecutarse suelto.

### 3. Corrección del estado real

#### 3.1 Reescribir `scripts/supabase-storage-rls.sql`

El archivo pasa de describir una intención a documentar el estado real y por qué es correcto:

- El bucket `landing` es `public: true`, y por eso las lecturas anónimas funcionan.
- `storage.objects` tiene RLS habilitado y **cero políticas**, por lo que las escrituras de `anon` y `authenticated` ya están denegadas por defecto.
- El script de subida funciona porque `service_role` tiene `BYPASSRLS`.

**Decisión: no se aplica la política `landing_lectura_publica` del archivo actual.** Es redundante con `public: true` y sería una política más que mantener y auditar. El archivo debe dejar escrito por qué se decidió no aplicarla, para que nadie la "arregle" más adelante.

Se conserva la nota existente sobre rate limiting, que sigue siendo correcta.

#### 3.2 Borrar la función huérfana

Primero verificar que ningún trigger dependa de ella:

```sql
select tgname, tgrelid::regclass as tabla
from pg_trigger
where tgfoid = 'public.actualizar_saldo'::regproc;
```

Si devuelve cero filas, ejecutar:

```sql
drop function public.actualizar_saldo();
```

Es una operación destructiva sobre un proyecto de producción, pero sobre código muerto: la tabla `cuentas` que manipula no existe en el proyecto. Requiere confirmación explícita del usuario en el momento de ejecutarla.

Como `read_only=true` bloquea el DDL vía MCP, esto va como **la primera migración** del workflow que establece la sección 2.3, creada con `supabase migration new drop_orphan_actualizar_saldo` y commiteada. Eso deja el borrado reproducible y auditable en un diff, y de paso valida el workflow de migraciones de punta a punta con un cambio de riesgo bajo — que es la razón por la que 2.3 entra en A pese a que A no crea tablas.

#### 3.3 Añadir `graphify-out/` a `.gitignore`

`graphify-out/` son ~405 KB de salida generada, hoy sin ignorar. Se incluye en A porque este mismo spec crea `docs/` y se va a commitear: sin la regla, un `git add .` arrastra el directorio generado al historial.

---

## Archivos afectados

| Archivo | Acción |
|---|---|
| `.mcp.json` | Nuevo. Servidor MCP acotado al proyecto Datzon. |
| `lib/supabase/project.ts` | Nuevo. `EXPECTED_PROJECT_REF` y `assertDatzonProject`. |
| `scripts/optimize-upload.ts` | Editar. Llamar a `assertDatzonProject` antes de crear el cliente. |
| `scripts/supabase-storage-rls.sql` | Reescribir. Documentar el estado real. |
| `CLAUDE.md` | Editar. Sección de reglas de Supabase; nota de que `.claude/` es local y no versionado. |
| `.gitignore` | Editar. Añadir `graphify-out/`. |
| `supabase/` | Nuevo, generado por `supabase init`. |

## Verificación

Cada punto se comprueba, no se asume:

1. **Guardia en código** — apuntar `SUPABASE_URL` a un ref falso en un `.env.local` temporal y confirmar que `pnpm optimize-images` aborta con el mensaje de proyecto incorrecto. Restaurar el valor real y confirmar que vuelve a funcionar.
2. **`.mcp.json`** — tras recargar la sesión, confirmar que `list_projects` ya no está disponible y que las consultas de escritura son rechazadas por el modo de solo lectura.
3. **Función borrada** — reejecutar el security advisor y confirmar que el WARN `function_search_path_mutable` desapareció y que no quedan hallazgos.
4. **Bucket intacto** — reconsultar el conteo de objetos de `landing` y confirmar que siguen siendo 19 objetos y 2.06 MB, es decir que nada de A tocó los datos.
5. **Build** — `pnpm build` y `pnpm lint` en verde.
6. **`.gitignore`** — `git status --short` no debe listar `graphify-out/`.

## Riesgos y decisiones registradas

- **`read_only=true` bloquea el DDL vía MCP.** Aceptado a conciencia: empuja el DDL hacia migraciones revisadas. Si resulta molesto, se quita el flag deliberadamente y se documenta el cambio.
- **El `.mcp.json` no protege si el conector de claude.ai sigue activo.** Es la debilidad principal del diseño y depende de una acción manual del usuario que el repositorio no puede forzar.
- **`supabase link` pide la contraseña de la base de datos.** Acción manual; el plan de implementación no puede automatizarla.
- **Borrar `actualizar_saldo` es irreversible.** Mitigado con la verificación previa de triggers y la confirmación explícita del usuario.
- **El ref del proyecto queda hardcodeado en tres lugares** (`lib/projects.ts`, `next.config.ts`, `lib/supabase/project.ts`). Consolidarlo en una sola constante es tentador, pero `next.config.ts` se evalúa fuera del grafo de módulos de la app y `remotePatterns` necesita un literal. Se acepta la duplicación y el guardia queda como la fuente de verdad que detecta cualquier divergencia.

## Fuera de alcance

**Sub-proyecto B — Migración de imágenes y limpieza de assets.** Subir todas las imágenes al bucket `landing` bajo prefijos por tipo; borrar `industrial-robot.jpg` (307 KB, contiene autos estacionados, sin referencias); reemplazar la imagen del hero buscando una alternativa con licencia comercial, porque `hero_v2.webp` se veía con mala calidad en móvil; recortar la marca de agua de IA del retrato de Danilo Luque a 540×540; normalizar y comprimir `Ronald_Chicche.jpg` (423 KB frente a 34–45 KB del resto, y 3:4 frente a 1:1); resolver el isotipo SVG duplicado en tres archivos; quitar `images.unsplash.com` de `remotePatterns`; activar `dangerouslyAllowSVG` si los logos terminan en el bucket.

**Sub-proyecto C — CSP.** `next.config.ts` afirma que `middleware.ts` maneja un CSP con nonce por request. Ese archivo no existe y no hay CSP.

**Tabla `contact_submissions`.** `app/api/contact/route.ts` hace `console.log` del lead y devuelve 200: los contactos se pierden y quedan datos personales en los logs de Vercel, contra la regla de seguridad de `CLAUDE.md`. Es más urgente que A, B y C, pero es un proyecto propio y arrastra la integración con Resend.
