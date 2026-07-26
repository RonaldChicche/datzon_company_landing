-- service_role tiene BYPASSRLS, pero eso exime de políticas, no de grants:
-- sin USAGE sobre el schema y SELECT sobre la tabla, los scripts locales con
-- la credencial secreta no pueden leer leads (pendiente documentado en
-- CLAUDE.md desde la final review del ciclo del formulario).
-- Solo lectura a propósito: borrar/editar leads sigue siendo del dashboard.

grant usage on schema landing to service_role;
grant select on landing.leads to service_role;
