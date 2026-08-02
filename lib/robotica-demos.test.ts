import { describe, expect, it } from "vitest";
import { DEMOS, APLICACIONES } from "./robotica-demos";

const textos = () =>
  [
    ...DEMOS.flatMap((d) => [d.nombre, d.aplicacion, d.etiqueta, d.gancho, d.parrafo, d.variantesTitulo, ...d.variantes]),
    ...APLICACIONES.flatMap((a) => [a.nombre, a.linea]),
  ].join(" ");

describe("robotica-demos", () => {
  it("tiene 3 demos en el orden del spec y 10 aplicaciones", () => {
    expect(DEMOS.map((d) => d.id)).toEqual(["paletizado", "soldadura", "servicio"]);
    expect(APLICACIONES).toHaveLength(10);
  });

  it("cada demo apunta a assets del bucket bajo site/robotica/", () => {
    for (const d of DEMOS) {
      expect(d.video).toContain("/site/robotica/");
      expect(d.video).toMatch(/\.mp4$/);
      expect(d.poster).toContain("/site/robotica/");
    }
    for (const a of APLICACIONES) expect(a.imagen).toContain("/site/robotica/apps/");
  });

  it("cada demo cierra sus variantes con el chip de contacto", () => {
    for (const d of DEMOS) expect(d.variantes.at(-1)).toBe("¿El tuyo?");
  });

  it("reglas duras: sin raya larga, sin EN CICLO, sin modelos de robot", () => {
    const t = textos();
    expect(t).not.toContain("\u2014"); // raya larga (escape para no escribirla)
    expect(t.toUpperCase()).not.toContain("EN CICLO");
    for (const prohibido of ["FR10", "FAIRINO", "seis articulaciones"]) {
      expect(t).not.toContain(prohibido);
    }
  });
});
