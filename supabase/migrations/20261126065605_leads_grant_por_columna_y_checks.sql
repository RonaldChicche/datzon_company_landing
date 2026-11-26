-- Defensa en profundidad para landing.leads (auditoría de seguridad run-2).
--
-- El Route Handler ya valida con Zod antes de insertar, pero la clave
-- publishable no es un secreto fuerte: quien la obtenga puede insertar
-- directo por el Data API, sin pasar por esa validación. Esta migración
-- hace que la propia base imponga lo mínimo:
--
-- 1. anon solo puede escribir las columnas que el formulario rellena.
--    id y created_at quedan siempre con su valor por defecto: nadie puede
--    fechar un lead en el pasado ni elegir su id.
-- 2. CHECK con los mismos topes que lib/contact-schema.ts. Los mínimos son
--    "no vacío" y no los de Zod a propósito: Zod cuenta unidades UTF-16 y
--    Postgres caracteres, así que un emoji vale 2 para Zod y 1 aquí. Con el
--    mínimo de Zod, la base podría rechazar algo que el formulario aceptó.
--    Los máximos sí coinciden: Postgres nunca cuenta más que Zod.
--
-- Las restricciones van NOT VALID: se aplican a toda fila nueva sin revisar
-- las existentes (no se pueden consultar desde aquí con read_only y no deben
-- bloquear el despliegue). Para comprobarlas también sobre las antiguas,
-- después: alter table landing.leads validate constraint <nombre>;
--
-- Sin SECURITY DEFINER, sin cambios de RLS: la política leads_anon_insert
-- sigue igual.

-- 1. Grant por columna -------------------------------------------------------

revoke insert on landing.leads from anon;
grant insert (nombre, email, mensaje, empresa, telefono, industria, source, ip_hash)
  on landing.leads to anon;

-- authenticated no usa esta tabla (el sitio no tiene login). Se revoca por si
-- algún default privilege del proyecto le hubiera dado acceso.
revoke all on landing.leads from authenticated;

-- 2. CHECK -------------------------------------------------------------------
-- [[:cntrl:]] equivale al \p{Cc} de Zod: CR/LF en nombre o empresa llegarían
-- al asunto del email, que es una cabecera.

alter table landing.leads
  add constraint leads_nombre_check
    check (char_length(nombre) between 1 and 120 and nombre !~ '[[:cntrl:]]')
    not valid,
  add constraint leads_email_check
    check (char_length(email) <= 320 and email ~ '^[^@[:space:]]+@[^@[:space:]]+$')
    not valid,
  add constraint leads_mensaje_check
    check (char_length(mensaje) between 1 and 5000)
    not valid,
  add constraint leads_empresa_check
    check (empresa is null or (char_length(empresa) <= 160 and empresa !~ '[[:cntrl:]]'))
    not valid,
  add constraint leads_telefono_check
    check (telefono is null or (char_length(telefono) <= 40 and telefono !~ '[[:cntrl:]]'))
    not valid,
  -- Catálogo de INDUSTRIES en lib/contact-schema.ts; '' es "Selecciona".
  -- Si cambia el catálogo, cambia también esta lista con otra migración.
  add constraint leads_industria_check
    check (industria is null or industria in (
      '', 'Minería', 'Energía & utilities', 'Manufactura', 'Alimentos & bebidas',
      'Logística & retail', 'Agroindustria', 'Otra'
    ))
    not valid,
  -- hashIp() en app/api/contact/route.ts: SHA-256 en hex, o null sin sal.
  add constraint leads_ip_hash_check
    check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$')
    not valid;
