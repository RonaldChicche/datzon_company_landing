// scripts/photos/grade.ts
// Parámetros de la gradación común y balance de blancos gray-world.

export const GRADE = {
  normaliseLower: 0.5,
  normaliseUpper: 99.5,
  contrast: 1.05,
  saturation: 0.95,
  wbStrength: 0.5,
  wbClamp: [0.88, 1.12],
} as const;

/** Ganancias [r, g, b] que acercan la media de cada canal a la media gris, a medias y con tope. */
export function wbGains(mean: { r: number; g: number; b: number }): [number, number, number] {
  const gray = (mean.r + mean.g + mean.b) / 3;
  const [lo, hi] = GRADE.wbClamp;
  const gain = (channel: number): number => {
    const g = 1 + GRADE.wbStrength * (gray / channel - 1);
    return Math.round(Math.min(Math.max(g, lo), hi) * 10000) / 10000;
  };
  return [gain(mean.r), gain(mean.g), gain(mean.b)];
}
