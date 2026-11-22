// scripts/photos/hlg.ts
// HLG (BT.2100) a SDR sRGB, por píxel. ffmpeg no trae zscale, así que se hace a mano.

const A = 0.17883277;
const B = 0.28466892;
const C = 0.55991073;
const GAMMA_MINUS_1 = 1.2 - 1;
const SHOULDER_KNEE = 0.8;

const BT2020_TO_709 = [
  [1.6605, -0.5876, -0.0728],
  [-0.1246, 1.1329, -0.0083],
  [-0.0182, -0.1006, 1.1187],
] as const;

/** OETF inversa de HLG: señal codificada a luz de escena. */
function inverseOetf(e: number): number {
  return e <= 0.5 ? (e * e) / 3 : (Math.exp((e - C) / A) + B) / 12;
}

/** OOTF de HLG (gamma 1.2 sobre la luminancia): luz de escena a luz de pantalla. */
function ootf(r: number, g: number, b: number): [number, number, number] {
  const ys = 0.2627 * r + 0.678 * g + 0.0593 * b;
  if (ys === 0) return [0, 0, 0];
  const k = Math.pow(ys, GAMMA_MINUS_1);
  return [r * k, g * k, b * k];
}

// Valor de la luz de pantalla para el blanco de referencia HLG (E' = 0.75), unos 0.2032.
const REFERENCE_WHITE = ootf(inverseOetf(0.75), inverseOetf(0.75), inverseOetf(0.75))[0];

/** Hombro suave: comprime las altas luces por encima de `k` hacia 1. */
function shoulder(x: number): number {
  const k = SHOULDER_KNEE;
  return k + (1 - k) * (1 - Math.exp(-(x - k) / (1 - k)));
}

function srgbEncode(v: number): number {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

/** Entrada HLG normalizada 0 a 1 (BT.2020), salida sRGB codificada 0 a 1. */
export function hlgToSdr(r: number, g: number, b: number): [number, number, number] {
  const [lr, lg, lb] = ootf(inverseOetf(r), inverseOetf(g), inverseOetf(b)).map(
    (v) => v / REFERENCE_WHITE,
  );
  const lin = BT2020_TO_709.map((row) => Math.max(0, row[0] * lr + row[1] * lg + row[2] * lb));
  const m = Math.max(lin[0], lin[1], lin[2]);
  const f = m > SHOULDER_KNEE ? shoulder(m) / m : 1;
  const out = lin.map((v) => clamp01(srgbEncode(v * f)));
  return [out[0], out[1], out[2]];
}
