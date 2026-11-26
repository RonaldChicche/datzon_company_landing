// scripts/lib/staging.test.ts
import { chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertPrivateDir, listStagedFiles } from "./staging";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "staging-test-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("listStagedFiles", () => {
  it("devuelve solo archivos regulares con extensión permitida, ordenados", () => {
    writeFileSync(join(dir, "b.mp4"), "v");
    writeFileSync(join(dir, "a.jpg"), "i");
    writeFileSync(join(dir, "notas.txt"), "x");
    mkdirSync(join(dir, "apps"));
    expect(listStagedFiles(dir, [".jpg", ".mp4"])).toEqual(["a.jpg", "b.mp4"]);
  });

  it("ignora enlaces simbólicos aunque apunten a un archivo regular", () => {
    const secreto = join(dir, "secreto.txt");
    writeFileSync(secreto, "CANARY");
    symlinkSync(secreto, join(dir, "trampa.jpg"));
    writeFileSync(join(dir, "real.jpg"), "i");
    expect(listStagedFiles(dir, [".jpg"])).toEqual(["real.jpg"]);
  });

  it("la extensión se compara sin distinguir mayúsculas", () => {
    writeFileSync(join(dir, "FOTO.JPG"), "i");
    expect(listStagedFiles(dir, [".jpg"])).toEqual(["FOTO.JPG"]);
  });
});

describe("assertPrivateDir", () => {
  it("acepta una carpeta propia sin escritura para grupo ni otros", () => {
    chmodSync(dir, 0o700);
    expect(() => assertPrivateDir(dir)).not.toThrow();
  });

  it("rechaza una carpeta que otros pueden escribir", () => {
    chmodSync(dir, 0o777);
    expect(() => assertPrivateDir(dir)).toThrow(/escribir/);
  });

  it("rechaza un enlace simbólico en lugar de la carpeta", () => {
    const real = join(dir, "real");
    mkdirSync(real, { mode: 0o700 });
    const enlace = join(dir, "enlace");
    symlinkSync(real, enlace);
    expect(() => assertPrivateDir(enlace)).toThrow(/carpeta real/);
  });

  it("rechaza una ruta que no existe con un mensaje claro", () => {
    expect(() => assertPrivateDir(join(dir, "no-existe"))).toThrow(/no existe/);
  });
});
