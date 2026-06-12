-- ============================================================
-- RLS para el bucket "landing" en Supabase Storage
-- Ejecutar en: Dashboard Datzon → SQL Editor
--
-- Modelo de seguridad:
--   LECTURA  → pública (bucket public: true — cualquier visitante ve las fotos)
--   ESCRITURA → solo service role (script local con .env.local)
--
-- Por qué no necesitamos políticas para el service role:
--   El service role bypasea RLS por diseño de Supabase/PostgreSQL.
--   Las políticas de abajo protegen contra que el rol `anon` o `authenticated`
--   puedan escribir o borrar archivos (por ejemplo, alguien usando el anon key).
-- ============================================================

-- ── LECTURA: cualquier visitante puede ver las imágenes ───────────────────────
-- (Redundante si el bucket ya es public: true, pero explícito es mejor.)
CREATE POLICY "landing_lectura_publica"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'landing');

-- ── ESCRITURA: bloqueada para anon y authenticated ────────────────────────────
-- Sin estas políticas, por defecto RLS deniega todo de todas formas.
-- Las dejamos comentadas como documentación explícita de la intención.
-- Si en el futuro querés dar acceso de escritura a un usuario autenticado,
-- agregás una política aquí en lugar de tocar el service role.

-- CREATE POLICY "landing_upload_denegado_anon"
-- ON storage.objects FOR INSERT TO anon WITH CHECK (false);

-- CREATE POLICY "landing_upload_denegado_authenticated"
-- ON storage.objects FOR INSERT TO authenticated WITH CHECK (false);

-- ── RATE LIMITING (futuro) ────────────────────────────────────────────────────
-- Proteger contra abuso de peticiones de lectura se maneja a nivel de
-- infraestructura (Vercel CDN cache, Supabase plan limits), no de RLS.
-- RLS no es el lugar para rate limiting.
