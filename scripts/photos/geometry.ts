// scripts/photos/geometry.ts
// Geometría pura del recorte y del enderezado. Sin dependencias.

export type Box = { left: number; top: number; width: number; height: number };

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);

/**
 * La caja más grande con width/height = ratio, centrada en `focus` (0 a 1 en
 * cada eje) y desplazada lo justo para no salirse de la imagen.
 */
export function cropBox(w: number, h: number, ratio: number, focus: [number, number]): Box {
  let width = w;
  let height = Math.round(w / ratio);
  if (height > h) {
    height = h;
    width = Math.round(h * ratio);
  }
  const left = clamp(Math.round(focus[0] * w - width / 2), 0, w - width);
  const top = clamp(Math.round(focus[1] * h - height / 2), 0, h - height);
  return { left, top, width, height };
}

/**
 * El mayor rectángulo con la proporción de w×h, alineado a los ejes y
 * centrado, que cabe dentro de la imagen tras rotarla `deg` grados.
 * Las esquinas del rectángulo escalado (s·w, s·h), giradas -deg, deben caer
 * dentro de w×h: s·(w·cos + h·|sin|) <= w  y  s·(w·|sin| + h·cos) <= h.
 */
export function inscribedSize(w: number, h: number, deg: number): { width: number; height: number } {
  const rad = (Math.abs(deg) * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const s = Math.min(w / (w * cos + h * sin), h / (w * sin + h * cos), 1);
  return { width: Math.floor(w * s), height: Math.floor(h * s) };
}
