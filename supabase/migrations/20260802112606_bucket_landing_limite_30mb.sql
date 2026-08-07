-- Sube el limite por archivo del bucket landing de 2 MB a 30 MB.
-- Motivo: los videos MP4 de las demos de /robotica (site/robotica/) pesan
-- hasta 23 MB. La convencion para imagenes no cambia: se siguen optimizando
-- por debajo de 2 MB antes de subirlas.
update storage.buckets set file_size_limit = 31457280 where id = 'landing';
