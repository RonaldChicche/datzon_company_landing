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
import { lstatSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";

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
  assertSafeAncestors(dir);
}

/**
 * Las carpetas superiores tampoco pueden ser escribibles por cualquiera,
 * salvo que tengan el bit sticky (como /tmp): sin él, otra cuenta podría
 * renombrar el staging ya comprobado y poner otro en su lugar antes de que
 * el script lo lea. Se usa stat (sigue enlaces) porque aquí importa la
 * carpeta real: en Linux un enlace simbólico siempre reporta modo 777.
 */
function assertSafeAncestors(dir: string): void {
  let current = dirname(resolve(dir));
  for (;;) {
    const mode = statSync(current).mode;
    const worldWritable = (mode & 0o002) !== 0;
    const sticky = (mode & 0o1000) !== 0;
    if (worldWritable && !sticky) {
      throw new Error(
        `Una carpeta superior del staging (${current}) la puede escribir cualquiera y no tiene bit sticky. ` +
          "Mueve el staging a una carpeta tuya."
      );
    }
    const parent = dirname(current);
    if (parent === current) return;
    current = parent;
  }
}

/**
 * Resuelve `rel` contra `root` y falla si el resultado queda fuera de `root`
 * (por "../" o por una ruta absoluta). Para manifiestos y argumentos que solo
 * deben elegir archivos dentro de una carpeta concreta.
 */
export function resolveInside(root: string, rel: string): string {
  const base = resolve(root);
  const abs = resolve(base, rel);
  const r = relative(base, abs);
  if (r === "" || r === ".." || r.startsWith(`..${sep}`) || isAbsolute(r)) {
    throw new Error(`"${rel}" queda fuera de ${base}`);
  }
  return abs;
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
