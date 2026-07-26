# Formulario de contacto: entrega real de leads

**Fecha:** 2026-07-25
**Rama:** `feat/rediseno-deep-space`
**Sub-proyecto:** D — anterior en prioridad a B (imágenes) y C (CSP)

---

## Contexto

`app/api/contact/route.ts` valida el envío, lo escribe con `console.log` y devuelve 200. **Todo lead que entra por la web hoy se pierde.** El sitio está en producción en https://www.datzoncompany.com, así que el costo es continuo.

La auditoría encontró tres problemas más, todos en el mismo camino:

1. **Dos formularios con payloads incompatibles apuntan al mismo endpoint.**
   - `components/ContactForm.tsx` (sección de la home) envía `nombre, empresa, email, telefono, industria, mensaje`.
   - `components/ContactModal.tsx` (modal global, montado en `app/ClientLayout.tsx`) envía `nombre, email, telefono, disponibilidad, mensaje`.

   El schema del servidor solo conoce los campos del primero. Zod descarta claves desconocidas en lugar de fallar, así que los envíos del modal **pasan la validación y pierden `disponibilidad` en silencio**. El contrato está escrito tres veces (dos componentes + el handler) y ya divergió.

2. **El rate limiting no funciona en producción.** Es un `Map` en memoria del proceso. En Vercel cada invocación puede caer en una instancia distinta y efímera, así que el contador se reinicia solo.

3. **El honeypot del servidor es código muerto.** El schema declara `website: z.string().max(0).optional()`, de modo que un bot que rellene el campo falla la validación con 422 antes de llegar al chequeo de honeypot.

Estado previo aprovechable: `.env.example` y `.github/workflows/ci.yml` ya declaran `RESEND_API_KEY` y `CONTACT_EMAIL`; el CLI de Supabase está enlazado al proyecto `adnvzdcqcneqjemxneht`.

## Objetivo

Que ningún lead se pierda, aunque el email falle. Que el contrato del formulario exista una sola vez. Que el envío por correo quede cableado y se active sin tocar código en cuanto exista la cuenta de Resend.

## Decisiones tomadas (todas con el usuario, 2026-07-25)

| Decisión | Valor |
|---|---|
| Destino de los leads | **Persistir en `landing.leads` y luego notificar por email.** La base es la fuente de verdad; el correo es solo un aviso |
| Contrato del formulario | **Unificado.** Un solo schema para ambos formularios y el servidor |
| Campos canónicos | `nombre*`, `email*`, `mensaje*` obligatorios; `empresa`, `telefono`, `industria` opcionales. **Fuera `disponibilidad`** |
| Estado de Resend | **No hay cuenta todavía.** Se implementa igual: la persistencia funciona desde el primer deploy y el envío queda inerte hasta que exista la key |
| Credencial del Route Handler | **Publishable, sujeta a RLS** (respeta la regla de `CLAUDE.md`). Sin `service_role` en código de aplicación |
| Modelo de acceso a la tabla | **Buzón de solo escritura:** `anon` inserta, no lee ni actualiza ni borra |

Descartado y por qué (para no repetir la discusión):

- **Solo email**, sin base: un fallo de Resend, un rebote o una carpeta de spam vuelven a perder el lead sin dejar rastro. Es el modo de fallo que se está sufriendo hoy.
- **Superset de campos con `disponibilidad` nullable**: mantiene dos formas de lead vivas. Se prefirió unificar, aun sabiendo que obliga a tocar la UI del modal.
- **`service_role` en el Route Handler**: defendible (un Route Handler es servidor), pero contradice una regla escrita del proyecto y obligaría a distinguir "servidor bueno" de "servidor malo" en cada revisión futura. El peor caso de la opción elegida es basura en una tabla, nunca una fuga: RLS impide leer leads pase lo que pase.

## Capa de datos

Primera migración del proyecto. Crea `supabase/migrations/`, que hoy no existe.

```sql
create table landing.leads (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre     text not null,
  email      text not null,
  mensaje    text not null,
  empresa    text,
  telefono   text,
  industria  text,
  source     text not null check (source in ('home','modal')),
  ip_hash    text
);

alter table landing.leads enable row level security;

grant insert on landing.leads to anon;

create policy leads_anon_insert on landing.leads
  for insert to anon with check (true);
```

Sin `grant select`, `update` ni `delete` para `anon`. Los leads se leen desde el dashboard de Supabase o con la credencial secreta en scripts locales.

Notas de diseño:

- **`source`** identifica el punto de entrada (`'home'` o `'modal'`) y permite saber qué CTA convierte. Como ambos formularios llaman al mismo endpoint, el servidor no puede deducirlo: **lo envía el cliente** y se valida contra un enum cerrado, de modo que un valor arbitrario da 422. No es un campo del formulario, así que no añade fricción; lo fija el componente, no el usuario.
- **No hay columna `notified_at`.** El modelo de buzón impide el UPDATE que haría falta para marcarla, y no aporta: la tabla es la fuente de verdad y toda fila es un lead, se haya enviado el correo o no.
- **`ip_hash`** es SHA-256 de la IP con una sal de entorno, nunca la IP en claro. Sirve para investigar abuso a posteriori. No habilita rate limiting (ver más abajo).

## Rate limiting: limitación conocida, no resuelta

**No se arregla en este ciclo, y el spec no pretende lo contrario.** Contar envíos previos por IP exigiría permiso de lectura sobre `landing.leads`, que es exactamente lo que el modelo de buzón niega. Un rate limit real necesita estado compartido: Vercel Firewall o Upstash Redis.

Lo que sí se hace:

- **Arreglar el honeypot.** `website` pasa de `z.string().max(0).optional()` a `z.string().optional()`, de modo que un bot que lo rellene supere la validación y llegue al descarte silencioso (respuesta 200 sin guardar nada), que es el comportamiento correcto de un honeypot.
- **Conservar el limitador en memoria**, documentado en el propio archivo como paliativo: frena ráfagas rápidas dentro de una misma instancia caliente y no cuesta nada, pero no es una garantía.

Alternativa registrada para el futuro: una función `SECURITY DEFINER` en Postgres que valide, cuente y inserte de forma atómica, con `EXECUTE` para `anon` y cero grants sobre la tabla. Es más segura que el diseño actual, pero `CLAUDE.md` exige justificación escrita para `SECURITY DEFINER` y añade complejidad de prueba. Fuera de alcance.

## Route Handler

Flujo: `validar (Zod) → honeypot → insertar → notificar → responder`.

| Situación | Respuesta | Razón |
|---|---|---|
| Body inválido | 400 | — |
| Datos que no pasan el schema | 422 | — |
| Honeypot relleno | 200, sin guardar | Descarte silencioso: el bot no debe distinguirlo del éxito |
| **Falla el insert** | **500**, con mensaje al usuario de escribir a `contacto@datzoncompany.com` | Es la red de seguridad; falla ruidosamente |
| **Falla el email** | **200** | El lead ya está guardado. No hay nada que el visitante pueda hacer |
| Sin `RESEND_API_KEY` | 200, envío omitido sin excepción | Permite desplegar hoy y activar el correo después sin tocar código |

El insert se hace **sin `.select()`**: devolver la fila insertada requeriría permiso de lectura y rompería el modelo de buzón.

El correo de notificación lleva **`reply_to` con el email del lead**, para que responder sea pulsar "Responder".

## Cambios de código

### Nuevos

- **`lib/contact-schema.ts`** — única definición del contrato. Exporta dos schemas para no obligar a los formularios a declarar un campo que no es suyo:
  - `contactFieldsSchema` — los seis campos visibles más el honeypot. Lo usan los dos formularios con `zodResolver`.
  - `contactPayloadSchema` — `contactFieldsSchema.extend({ source: z.enum(["home", "modal"]) })`. Lo usa el Route Handler.
- **`lib/supabase/client.ts`** — cliente de runtime con la clave publishable, que llama a `assertDatzonProject` antes de conectarse (regla de `CLAUDE.md`).
- **`supabase/migrations/<timestamp>_leads.sql`** — la migración de arriba.

### Modificados

- **`app/api/contact/route.ts`** — importa el schema compartido, inserta en Supabase, notifica por Resend, aplica la tabla de respuestas de arriba. Se elimina el `console.log` del contacto.
- **`components/ContactModal.tsx`** — usa el schema compartido. Pierde el campo `disponibilidad`; gana `empresa` y el select de `industria`; `telefono` deja de ser obligatorio. Envía `source: 'modal'`. Es el componente más estilizado del sitio: los campos nuevos deben seguir sus clases y patrón de iconos existentes.
- **`components/ContactForm.tsx`** — usa el schema compartido (sus campos no cambian). Envía `source: 'home'`.
- **`package.json`** — `@supabase/supabase-js` pasa de `devDependencies` a `dependencies` (hoy solo lo usan scripts; el build de producción de Vercel poda devDeps y fallaría). Se añade `resend`.
- **`.env.example`** — se añaden `SUPABASE_PUBLISHABLE_KEY` y `LEAD_IP_SALT`.
- **`CLAUDE.md`** — se documenta la tabla `landing.leads` y su modelo de buzón de solo escritura.

## Pruebas

Vitest ya está configurado (`lib/supabase/project.test.ts` es el precedente). Supabase y Resend se mockean.

1. El schema acepta el mínimo válido y rechaza email inválido, nombre corto y mensaje corto.
2. Honeypot relleno → 200 y **cero** llamadas al insert.
3. Insert falla → 500.
4. Email falla → 200 y el lead quedó insertado.
5. Sin `RESEND_API_KEY` → 200, sin excepción y sin llamada a Resend.
6. Un `source` fuera del enum (`"admin"`, vacío, ausente) → 422, y cero llamadas al insert.

## Verificación

1. `pnpm exec tsc --noEmit` y `pnpm test` en verde.
2. `pnpm build` en verde con las env vars presentes.
3. Envío real desde `pnpm dev` por **ambos** formularios: aparecen dos filas en `landing.leads` con `source` distinto.
4. Con la clave publishable, un `select` directo sobre `landing.leads` **debe fallar** — confirma el buzón.
5. Búsqueda de `disponibilidad` en `components/` no devuelve nada.
6. Ningún `console.log` de datos de contacto en el repo.

## Riesgos

- **La tabla es escribible por quien tenga la clave publishable.** Sin rate limit real, alguien podría insertar basura. No puede leer nada. Mitigación si ocurre: rotar la clave y evaluar la vía `SECURITY DEFINER`.
- **`SUPABASE_PUBLISHABLE_KEY` no lleva prefijo `NEXT_PUBLIC_`**, a propósito: no debe llegar al navegador. Un renombrado descuidado la expondría.
- **El correo no funciona hasta que exista la cuenta de Resend con dominio verificado** (SPF y DKIM en el DNS de `datzoncompany.com`). Hasta entonces los leads se consultan en el dashboard de Supabase. Es una tarea de operaciones, no de código.

## Fuera de alcance

- Rate limiting real (Vercel Firewall o Upstash).
- Autorespuesta al lead. El mensaje de éxito ya promete respuesta en 1 día hábil.
- Panel de administración para ver leads. Se usa el dashboard de Supabase.
- Unificar visualmente los dos formularios: siguen siendo dos componentes con estéticas distintas. Solo se unifica el contrato de datos.
- Sub-proyecto B (imágenes al bucket) y C (CSP).
