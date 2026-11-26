import { describe, it, expect } from "vitest";
import { assertDatzonProject, EXPECTED_PROJECT_REF } from "./project";

describe("assertDatzonProject", () => {
  const urlValida = `https://${EXPECTED_PROJECT_REF}.supabase.co`;

  it("devuelve la URL sin modificar cuando el ref es el de Datzon", () => {
    expect(assertDatzonProject(urlValida)).toBe(urlValida);
  });

  it("acepta la URL con barra final", () => {
    const conBarra = `${urlValida}/`;
    expect(assertDatzonProject(conBarra)).toBe(conBarra);
  });

  it("lanza error cuando SUPABASE_URL no está definida", () => {
    expect(() => assertDatzonProject(undefined)).toThrow("SUPABASE_URL no está definida");
  });

  it("lanza error cuando SUPABASE_URL está vacía", () => {
    expect(() => assertDatzonProject("")).toThrow("SUPABASE_URL no está definida");
  });

  it("lanza error cuando la URL es inválida", () => {
    expect(() => assertDatzonProject("no-es-una-url")).toThrow("no es una URL válida");
  });

  it("rechaza el otro proyecto de la organización", () => {
    const otroProyecto = "https://thwotgoldsncfsgndlii.supabase.co";
    expect(() => assertDatzonProject(otroProyecto)).toThrow("thwotgoldsncfsgndlii");
  });

  // Antes solo se miraba el primer subdominio: un dominio ajeno que empezara
  // con el ref pasaba el control (auditoría run-2).
  it("rechaza un dominio ajeno que empieza con el ref de Datzon", () => {
    expect(() => assertDatzonProject(`https://${EXPECTED_PROJECT_REF}.ejemplo-ajeno.com`)).toThrow();
    expect(() => assertDatzonProject(`https://${EXPECTED_PROJECT_REF}.supabase.co.ejemplo-ajeno.com`)).toThrow();
  });

  it("rechaza http sin cifrar", () => {
    expect(() => assertDatzonProject(`http://${EXPECTED_PROJECT_REF}.supabase.co`)).toThrow("https");
  });

  it("acepta el host en mayúsculas (los hosts no distinguen mayúsculas)", () => {
    const mayus = `https://${EXPECTED_PROJECT_REF.toUpperCase()}.SUPABASE.CO`;
    expect(assertDatzonProject(mayus)).toBe(mayus);
  });

  it("el mensaje de error nombra el ref esperado y el recibido", () => {
    const ajeno = "https://proyectoajeno.supabase.co";
    expect(() => assertDatzonProject(ajeno)).toThrow(EXPECTED_PROJECT_REF);
    expect(() => assertDatzonProject(ajeno)).toThrow("proyectoajeno");
  });
});
