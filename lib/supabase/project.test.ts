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

  it("el mensaje de error nombra el ref esperado y el recibido", () => {
    const ajeno = "https://proyectoajeno.supabase.co";
    expect(() => assertDatzonProject(ajeno)).toThrow(EXPECTED_PROJECT_REF);
    expect(() => assertDatzonProject(ajeno)).toThrow("proyectoajeno");
  });
});
