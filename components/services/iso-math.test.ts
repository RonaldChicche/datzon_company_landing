import { describe, it, expect } from "vitest";
import { isoProjector, armIK, gearOutline, lin, poseAt } from "./iso-math";

describe("isoProjector", () => {
  const P = isoProjector(100, 50, 2);

  it("el origen cae en el punto de anclaje", () => {
    expect(P(0, 0, 0)).toEqual([100, 50]);
  });

  it("x baja a la derecha, y baja a la izquierda y z sube", () => {
    const [x1, y1] = P(10, 0, 0);
    const [x2, y2] = P(0, 10, 0);
    const [x3, y3] = P(0, 0, 10);
    expect(x1).toBeGreaterThan(100);
    expect(y1).toBeGreaterThan(50);
    expect(x2).toBeLessThan(100);
    expect(y2).toBeGreaterThan(50);
    expect(x3).toBe(100);
    expect(y3).toBe(30);
  });
});

describe("armIK", () => {
  const L1 = 46, L2 = 42;

  it("los eslabones miden lo que deben y el codo queda por encima", () => {
    const target: [number, number] = [60, 10];
    const [er, ez] = armIK(target[0], target[1], L1, L2);
    expect(Math.hypot(er, ez)).toBeCloseTo(L1, 6);
    expect(Math.hypot(target[0] - er, target[1] - ez)).toBeCloseTo(L2, 6);
    // Codo arriba: por encima de la recta hombro-muñeca.
    expect(ez).toBeGreaterThan((target[1] / target[0]) * er);
  });

  it("si el objetivo está fuera de alcance, estira el brazo sin dar NaN", () => {
    const [er, ez] = armIK(500, 0, L1, L2);
    expect(Number.isFinite(er) && Number.isFinite(ez)).toBe(true);
    expect(Math.hypot(er, ez)).toBeCloseTo(L1, 3);
  });
});

describe("gearOutline", () => {
  it("da 4 puntos por diente, entre el radio de raíz y el exterior", () => {
    const pts = gearOutline(12, 34, 28);
    expect(pts).toHaveLength(48);
    for (const [x, y] of pts) {
      const r = Math.hypot(x, y);
      expect(r).toBeGreaterThanOrEqual(28 - 1e-9);
      expect(r).toBeLessThanOrEqual(34 + 1e-9);
    }
  });
});

describe("lin y poseAt", () => {
  it("lin recorta a [0, 1]", () => {
    expect(lin(-1, 0, 1)).toBe(0);
    expect(lin(0.5, 0, 1)).toBe(0.5);
    expect(lin(2, 0, 1)).toBe(1);
  });

  it("poseAt pasa exactamente por cada pose clave", () => {
    const poses = [[0, 0, 10], [0.5, 100, 20], [1, 0, 10]];
    expect(poseAt(poses, 0)).toEqual([0, 0, 10]);
    expect(poseAt(poses, 0.5)).toEqual([0.5, 100, 20]);
    expect(poseAt(poses, 1)).toEqual([1, 0, 10]);
  });
});
