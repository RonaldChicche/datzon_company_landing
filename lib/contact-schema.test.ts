import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  contactFieldsSchema,
  contactPayloadSchema,
  INDUSTRIES,
} from "./contact-schema";

const minimoValido = {
  nombre: "Ana",
  email: "ana@empresa.com",
  mensaje: "Necesito automatizar una línea de envasado.",
};

describe("contactFieldsSchema", () => {
  it("acepta el mínimo válido (solo obligatorios)", () => {
    expect(contactFieldsSchema.safeParse(minimoValido).success).toBe(true);
  });

  it("acepta los opcionales presentes", () => {
    const conOpcionales = {
      ...minimoValido,
      empresa: "Acme SAC",
      telefono: "+51 999 888 777",
      industria: "Minería",
    };
    expect(contactFieldsSchema.safeParse(conOpcionales).success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, email: "no-es-email" });
    expect(r.success).toBe(false);
  });

  it("rechaza nombre de 1 carácter", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, nombre: "A" });
    expect(r.success).toBe(false);
  });

  it("rechaza mensaje de menos de 10 caracteres", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, mensaje: "corto" });
    expect(r.success).toBe(false);
  });

  it("rechaza nombre de 121 caracteres", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, nombre: "A".repeat(121) });
    expect(r.success).toBe(false);
  });

  it("rechaza mensaje de 5001 caracteres", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, mensaje: "A".repeat(5001) });
    expect(r.success).toBe(false);
  });

  it("acepta mensaje de exactamente 5000 caracteres", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, mensaje: "A".repeat(5000) });
    expect(r.success).toBe(true);
  });

  it("el honeypot relleno PASA la validación (se evalúa en el servidor)", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, website: "spam.com" });
    expect(r.success).toBe(true);
  });

  // Nombre y empresa van al asunto del email: un salto de línea ahí podría
  // colar cabeceras nuevas (p. ej. "Bcc:"). Ver auditoría run-1.
  it.each(["nombre", "empresa", "telefono", "industria"])(
    "rechaza saltos de línea y caracteres de control en %s",
    (campo) => {
      for (const malo of ["Ana\r\nBcc: x@ejemplo.com", "Ana\nTorres", "Ana\rTorres", "Ana\u0000"]) {
        const r = contactFieldsSchema.safeParse({ ...minimoValido, [campo]: malo });
        expect(r.success, `${campo}=${JSON.stringify(malo)}`).toBe(false);
      }
    }
  );

  // Caracteres invisibles o de formato: no inyectan cabeceras, pero U+202E
  // invierte el texto y U+2028/U+2029 rompen la línea en algunos clientes de
  // correo, así que pueden falsear lo que el operador lee en el asunto.
  it.each(["nombre", "empresa"])("rechaza caracteres de formato y separadores Unicode en %s", (campo) => {
    for (const malo of ["Ana‮txe", "Ana​Torres", "Ana Torres", "Ana Torres", "﻿Ana"]) {
      const r = contactFieldsSchema.safeParse({ ...minimoValido, [campo]: malo });
      expect(r.success, `${campo}=${JSON.stringify(malo)}`).toBe(false);
    }
  });

  it("industria solo acepta las del catálogo, o vacío cuando no se elige", () => {
    for (const ok of [...INDUSTRIES, "", undefined]) {
      expect(contactFieldsSchema.safeParse({ ...minimoValido, industria: ok }).success, String(ok)).toBe(true);
    }
    for (const malo of ["Aeroespacial", "minería", "Minería "]) {
      expect(contactFieldsSchema.safeParse({ ...minimoValido, industria: malo }).success, malo).toBe(false);
    }
  });

  it("el mensaje sí admite saltos de línea (va al cuerpo, no a una cabecera)", () => {
    const r = contactFieldsSchema.safeParse({ ...minimoValido, mensaje: "Línea uno\nLínea dos larga" });
    expect(r.success).toBe(true);
  });

  it("acepta acentos, eñes y signos habituales en campos de una línea", () => {
    const r = contactFieldsSchema.safeParse({
      ...minimoValido,
      nombre: "María Núñez-O'Brien",
      empresa: "Peñoles & Cía. S.A.C.",
      telefono: "+51 (1) 999-888-777",
    });
    expect(r.success).toBe(true);
  });

  it("no conoce el campo disponibilidad (contrato unificado)", () => {
    expect("disponibilidad" in contactFieldsSchema.shape).toBe(false);
  });
});

describe("contactPayloadSchema", () => {
  it("acepta source home y modal", () => {
    expect(contactPayloadSchema.safeParse({ ...minimoValido, source: "home" }).success).toBe(true);
    expect(contactPayloadSchema.safeParse({ ...minimoValido, source: "modal" }).success).toBe(true);
  });

  it("rechaza source fuera del enum y source ausente", () => {
    expect(contactPayloadSchema.safeParse({ ...minimoValido, source: "admin" }).success).toBe(false);
    expect(contactPayloadSchema.safeParse(minimoValido).success).toBe(false);
  });
});

describe("INDUSTRIES", () => {
  it("contiene las 7 industrias del formulario actual", () => {
    expect(INDUSTRIES).toHaveLength(7);
    expect(INDUSTRIES).toContain("Minería");
    expect(INDUSTRIES).toContain("Otra");
  });
});

// La base repite estos topes y el catálogo como CHECK en landing.leads. Si
// divergen, Zod acepta algo que el insert rechaza y el visitante ve un 500.
// Se lee la migración más reciente que define cada restricción.
describe("coherencia con los CHECK de landing.leads", () => {
  const dir = join(process.cwd(), "supabase", "migrations");
  const sqls = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(dir, f), "utf8"));
  const ultimaQueDefine = (nombre: string) => {
    const sql = sqls.filter((s) => s.includes(nombre)).at(-1);
    if (!sql) throw new Error(`Ninguna migración define ${nombre}`);
    return sql.slice(sql.indexOf(`add constraint ${nombre}`));
  };

  it("el catálogo de industrias coincide (más '' de «Selecciona»)", () => {
    const sql = ultimaQueDefine("leads_industria_check");
    const lista = sql.slice(sql.indexOf("industria in ("), sql.indexOf(")", sql.indexOf("industria in (")));
    const valores = [...lista.matchAll(/'([^']*)'/g)].map((m) => m[1]);
    expect(valores.sort()).toEqual(["", ...INDUSTRIES].sort());
  });

  it.each([
    ["nombre", "leads_nombre_check", /between 1 and (\d+)/],
    ["mensaje", "leads_mensaje_check", /between 1 and (\d+)/],
    ["empresa", "leads_empresa_check", /<= (\d+)/],
    ["telefono", "leads_telefono_check", /<= (\d+)/],
  ] as const)("el tope de %s coincide con el de la base", (campo, restriccion, patron) => {
    const tope = Number(ultimaQueDefine(restriccion).match(patron)?.[1]);
    expect(tope).toBeGreaterThan(0);
    const base = { ...minimoValido, mensaje: "x".repeat(10) };
    expect(contactFieldsSchema.safeParse({ ...base, [campo]: "x".repeat(tope) }).success).toBe(true);
    expect(contactFieldsSchema.safeParse({ ...base, [campo]: "x".repeat(tope + 1) }).success).toBe(false);
  });
});
