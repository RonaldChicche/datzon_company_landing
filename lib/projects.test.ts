// lib/projects.test.ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FEATURED, PROJECTS, imageAlt } from "./projects";

const manifest = (slug: string): string[] =>
  JSON.parse(readFileSync(`scripts/photos/manifests/${slug}.json`, "utf8")).map((e: { out: string }) => `${e.out}.webp`);

describe("datos de proyectos", () => {
  it("quedan los tres proyectos, en orden, sin la celda antigua", () => {
    expect(PROJECTS.map((p) => p.slug)).toEqual([
      "elevadores-hidraulicos",
      "plataforma-giratoria",
      "proyecto-de-investigacion-marina-y-sni-pathfinder-velero",
    ]);
  });
  it("la demo destacada usa el vídeo y las 6 fotos", () => {
    expect(FEATURED.slug).toBe("soldadura-robotizada");
    expect(FEATURED.youtubeId).toBe("zvhX8jre5Nk");
    expect(FEATURED.images.map((i) => i.file)).toEqual([
      "01-taller.webp", "02-operario.webp", "03-guiado.webp", "04-tableta.webp", "05-cordon.webp", "06-tubo.webp",
    ]);
    expect(FEATURED.poster).toBe("poster.webp");
  });
  it("cada archivo referenciado sale de su manifiesto", () => {
    for (const p of [FEATURED, ...PROJECTS]) {
      const files = manifest(p.slug);
      for (const img of p.images) expect(files).toContain(img.file);
    }
    expect(manifest(FEATURED.slug)).toContain(FEATURED.poster);
  });
  it("los focos son valores válidos de object-position", () => {
    for (const p of [FEATURED, ...PROJECTS])
      for (const img of p.images) if (img.focus) expect(img.focus).toMatch(/^\d{1,3}% \d{1,3}%$/);
  });
  it("ningún texto lleva raya larga ni el modelo del robot", () => {
    const text = JSON.stringify([FEATURED, PROJECTS]);
    expect(text).not.toContain(String.fromCharCode(0x2014)); // raya larga, escrita sin el carácter literal
    expect(text).not.toMatch(/fairino|fr\s?-?\s?10|fr-hmi/i);
  });
  it("alt por defecto numerado", () => {
    expect(imageAlt(PROJECTS[0], 0)).toBe(`${PROJECTS[0].title}, foto 1 de ${PROJECTS[0].images.length}`);
  });
});
