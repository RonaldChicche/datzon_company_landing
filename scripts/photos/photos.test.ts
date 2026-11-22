// scripts/photos/photos.test.ts
import { describe, expect, it } from "vitest";
import { cropBox, inscribedSize } from "./geometry";
import { hlgToSdr } from "./hlg";
import { wbGains, GRADE } from "./grade";

describe("cropBox", () => {
  it("3:2 centrado en un fotograma 16:9 de la GoPro", () => {
    expect(cropBox(5312, 2988, 3 / 2, [0.5, 0.5])).toEqual({ left: 415, top: 0, width: 4482, height: 2988 });
  });
  it("1:1 en vertical con foco bajo, sin salirse", () => {
    expect(cropBox(4590, 8160, 1, [0.5, 0.95])).toEqual({ left: 0, top: 3570, width: 4590, height: 4590 });
  });
  it("foco en el borde izquierdo se pega a 0", () => {
    expect(cropBox(5312, 2988, 3 / 2, [0, 0.5]).left).toBe(0);
  });
});

describe("inscribedSize", () => {
  it("sin giro devuelve el tamaño original", () => {
    expect(inscribedSize(900, 900, 0)).toEqual({ width: 900, height: 900 });
  });
  it("girar un cuadrado 45° deja un cuadrado de lado/√2", () => {
    const s = inscribedSize(900, 900, 45);
    expect(s.width).toBe(s.height);
    expect(s.width).toBeGreaterThanOrEqual(636);
    expect(s.width).toBeLessThanOrEqual(637);
  });
  it("es simétrico en el signo del ángulo", () => {
    expect(inscribedSize(900, 1600, 3)).toEqual(inscribedSize(900, 1600, -3));
  });
});

describe("hlgToSdr", () => {
  it("negro queda negro", () => expect(hlgToSdr(0, 0, 0)).toEqual([0, 0, 0]));
  it("un gris sigue siendo gris", () => {
    // Las filas de la matriz BT.2020→BT.709 suman 1 ± 1e-4, de ahí la tolerancia.
    const [r, g, b] = hlgToSdr(0.5, 0.5, 0.5);
    expect(Math.abs(r - g)).toBeLessThan(1e-3);
    expect(Math.abs(g - b)).toBeLessThan(1e-3);
  });
  it("el blanco de referencia HLG (75 %) cae entre 0.93 y 1", () => {
    const [r] = hlgToSdr(0.75, 0.75, 0.75);
    expect(r).toBeGreaterThan(0.93);
    expect(r).toBeLessThanOrEqual(1);
  });
  it("es monótona y no sale de [0, 1]", () => {
    let prev = -1;
    for (let v = 0; v <= 1; v += 0.05) {
      const [r] = hlgToSdr(v, v, v);
      expect(r).toBeGreaterThanOrEqual(prev);
      expect(r).toBeLessThanOrEqual(1);
      prev = r;
    }
  });
});

describe("wbGains", () => {
  it("una imagen neutra no se toca", () => expect(wbGains({ r: 120, g: 120, b: 120 })).toEqual([1, 1, 1]));
  it("una dominante fuerte se corrige a medias y con tope", () => {
    const [gr, , gb] = wbGains({ r: 200, g: 120, b: 60 });
    expect(gr).toBe(GRADE.wbClamp[0]);
    expect(gb).toBe(GRADE.wbClamp[1]);
  });
});
