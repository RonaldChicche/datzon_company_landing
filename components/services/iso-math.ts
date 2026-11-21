/**
 * Matemática pura de las animaciones isométricas de la sección de servicios.
 * Sin DOM: se puede testear en Node (ver iso-math.test.ts).
 */

export type Point = [number, number];
export type Projector = (x: number, y: number, z: number) => Point;

export const TAU = Math.PI * 2;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Curva de aceleración suave (entra y sale despacio). */
export const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/** Progreso lineal de `f` dentro del tramo [a, b], recortado a [0, 1]. */
export const lin = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
/** Igual que `lin`, pero con aceleración suave. */
export const seg = (f: number, a: number, b: number) => ease(lin(f, a, b));
/** Onda triangular 0 → 1 → 0 con periodo 1. */
export const tri = (u: number) => 1 - Math.abs(2 * (((u % 1) + 1) % 1) - 1);

/**
 * Proyección isométrica: el eje x baja hacia la derecha, el y baja hacia la
 * izquierda y el z sube. (ox, oy) es dónde cae el origen y s la escala.
 */
export function isoProjector(ox: number, oy: number, s: number): Projector {
  return (x, y, z) => [ox + (x - y) * 0.866 * s, oy + ((x + y) * 0.5 - z) * s];
}

/**
 * Brazo de dos eslabones en un plano vertical, con el codo hacia arriba.
 * Recibe la muñeca (r, z) relativa al hombro y devuelve el codo (r, z).
 * Si la muñeca queda fuera de alcance, estira el brazo en su dirección.
 */
export function armIK(r: number, z: number, L1: number, L2: number): Point {
  const d = Math.max(1e-6, Math.min(Math.hypot(r, z), L1 + L2 - 1e-6));
  const len = Math.hypot(r, z) || 1e-6;
  const ur = r / len, uz = z / len;
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  return [a * ur - h * uz, a * uz + h * ur];
}

/** Contorno de un engranaje: 4 puntos por diente, centrado en el origen. */
export function gearOutline(teeth: number, outer: number, root: number): Point[] {
  const pts: Point[] = [];
  const p = TAU / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * p - Math.PI / 2;
    for (const [r, ang] of [[root, a], [outer, a + 0.18 * p], [outer, a + 0.48 * p], [root, a + 0.66 * p]]) {
      pts.push([r * Math.cos(ang), r * Math.sin(ang)]);
    }
  }
  return pts;
}

/** Polígono circular de `k` lados (para los agujeros del engranaje). */
export function circlePoints(cx: number, cy: number, r: number, k = 20): Point[] {
  return Array.from({ length: k }, (_, i) => [cx + r * Math.cos((i * TAU) / k), cy + r * Math.sin((i * TAU) / k)] as Point);
}

/**
 * Interpola entre poses clave. Cada pose es [fracción del ciclo, ...valores];
 * devuelve [f, ...valores interpolados] con aceleración suave entre poses.
 */
export function poseAt(poses: number[][], f: number): number[] {
  let i = 0;
  while (i < poses.length - 2 && f > poses[i + 1][0]) i++;
  const A = poses[i], B = poses[i + 1];
  const p = seg(f, A[0], B[0]);
  return A.map((v, k) => (k === 0 ? f : lerp(v, B[k], p)));
}
