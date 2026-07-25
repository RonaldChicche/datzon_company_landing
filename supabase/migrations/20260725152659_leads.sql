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
