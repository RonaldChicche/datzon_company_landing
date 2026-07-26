import { describe, it, expect, beforeEach, vi } from "vitest";
import { EXPECTED_PROJECT_REF } from "./project";
import { getSupabaseClient, _resetSupabaseClient } from "./client";

const URL_VALIDA = `https://${EXPECTED_PROJECT_REF}.supabase.co`;

describe("getSupabaseClient", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    _resetSupabaseClient();
  });

  it("devuelve un cliente cuando el entorno está completo", () => {
    vi.stubEnv("SUPABASE_URL", URL_VALIDA);
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    const client = getSupabaseClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
  });

  it("es un singleton: dos llamadas devuelven la misma instancia", () => {
    vi.stubEnv("SUPABASE_URL", URL_VALIDA);
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(getSupabaseClient()).toBe(getSupabaseClient());
  });

  it("lanza si falta SUPABASE_PUBLISHABLE_KEY", () => {
    vi.stubEnv("SUPABASE_URL", URL_VALIDA);
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
    expect(() => getSupabaseClient()).toThrow("SUPABASE_PUBLISHABLE_KEY");
  });

  it("lanza si la URL es de otro proyecto (guardia assertDatzonProject)", () => {
    vi.stubEnv("SUPABASE_URL", "https://proyectoajeno.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(() => getSupabaseClient()).toThrow("proyectoajeno");
  });
});
