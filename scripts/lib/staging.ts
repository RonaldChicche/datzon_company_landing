// scripts/lib/staging.ts
/**
 * Lectura segura de una carpeta de staging antes de subir su contenido al
 * bucket público con la clave service_role.
 *
 * Dos riesgos que esto cierra (auditoría de seguridad run-1):
 * - Un enlace simbólico dentro del staging haría que el script leyera y
 *   publicara el archivo al que apunta (p. ej. .env.local). Por eso se usa
 *   lstat, que mira el enlace en sí, en vez de stat, que lo sigue.
 * - Una carpeta que otra cuenta de la máquina puede escribir permitiría
 *   colar archivos que luego se publican como si fueran nuestros.
 */
import { lstatSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

/** Falla si `dir` no es una carpeta real, propia y sin escritura para grupo ni otros. */
export function assertPrivateDir(dir: string): void {
  let st;
  try {
    st = lstatSync(dir);
  } catch {
    throw new Error(`La carpeta de staging no existe: ${dir}`);
  }
  if (!st.isDirectory()) {
    throw new Error(`El staging debe ser una carpeta real, no un enlace ni un archivo: ${dir}`);
  }
  if (typeof process.getuid === "function" && st.uid !== process.getuid()) {
    throw new Error(`La carpeta de staging pertenece a otro usuario: ${dir}`);
  }
  if ((st.mode & 0o022) !== 0) {
    throw new Error(
      `Otros usuarios pueden escribir en la carpeta de staging (${dir}). Ejecuta: chmod go-w "${dir}"`
    );
  }
}

/**
 * Nombres de los archivos regulares de `dir` cuya extensión está en
 * `allowedExts` (sin distinguir mayúsculas), ordenados. Se saltan
 * subcarpetas, enlaces simbólicos y cualquier otro tipo de entrada.
 */
export function listStagedFiles(dir: string, allowedExts: readonly string[]): string[] {
  const exts = new Set(allowedExts.map((e) => e.toLowerCase()));
  return readdirSync(dir)
    .filter((name) => {
      const st = lstatSync(join(dir, name));
      return st.isFile() && exts.has(extname(name).toLowerCase());
    })
    .sort();
}
