import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));
/** Indirección para poder variar el comportamiento (incluso lanzar) por test. */
const getSupabaseClientMock = vi.fn(() => ({ from: fromMock }));
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: () => getSupabaseClientMock(),
}));

const sendMock = vi.fn();
vi.mock("resend", () => {
  class ResendMock {
    emails = { send: sendMock };
  }
  return {
    Resend: ResendMock,
  };
});

import { POST } from "./route";

let ipCounter = 0;
/** IP única por test: el rate limiter en memoria del route es módulo-global. */
function requestWith(body: unknown): NextRequest {
  ipCounter++;
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `10.0.0.${ipCounter}`,
    },
    body: JSON.stringify(body),
  });
}

const leadValido = {
  nombre: "Ana Torres",
  email: "ana@acme.com",
  mensaje: "Quiero automatizar el empaquetado de mi planta.",
  empresa: "Acme SAC",
  source: "home",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    insertMock.mockReset().mockResolvedValue({ error: null });
    fromMock.mockClear();
    getSupabaseClientMock.mockReset().mockImplementation(() => ({ from: fromMock }));
    sendMock.mockReset().mockResolvedValue({ data: { id: "email_1" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_EMAIL", "contacto@datzoncompany.com");
    vi.stubEnv("LEAD_IP_SALT", "sal-de-prueba");
  });

  it("lead válido → 200, insertado en leads con source y sin website", async () => {
    const res = await POST(requestWith({ ...leadValido }));
    expect(res.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith("leads");
    const row = insertMock.mock.calls[0][0];
    expect(row.source).toBe("home");
    expect(row.nombre).toBe("Ana Torres");
    expect(row).not.toHaveProperty("website");
    expect(typeof row.ip_hash).toBe("string");
  });

  it("body no-JSON → 400", async () => {
    const req = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: { "x-forwarded-for": "10.9.9.9" },
      body: "esto no es json",
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("email inválido → 422 y cero inserts", async () => {
    const res = await POST(requestWith({ ...leadValido, email: "nope" }));
    expect(res.status).toBe(422);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("source fuera del enum → 422 y cero inserts", async () => {
    const res = await POST(requestWith({ ...leadValido, source: "admin" }));
    expect(res.status).toBe(422);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("honeypot relleno → 200 silencioso, cero inserts, cero emails", async () => {
    const res = await POST(requestWith({ ...leadValido, website: "spam.com" }));
    expect(res.status).toBe(200);
    expect(insertMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("insert falla → 500 con mensaje que incluye el correo de contacto", async () => {
    insertMock.mockResolvedValue({ error: { message: "boom", code: "XX000" } });
    const res = await POST(requestWith({ ...leadValido }));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("contacto@datzoncompany.com");
  });

  it("getSupabaseClient lanza (env ausente en el host) → 500 JSON con el correo de contacto", async () => {
    getSupabaseClientMock.mockImplementationOnce(() => {
      throw new Error("Missing SUPABASE_URL");
    });
    const res = await POST(requestWith({ ...leadValido }));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("contacto@datzoncompany.com");
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("email falla → 200 igual (el lead ya está guardado)", async () => {
    sendMock.mockRejectedValue(new Error("resend caído"));
    const res = await POST(requestWith({ ...leadValido }));
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it("sin RESEND_API_KEY → 200, inserta y no intenta enviar", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await POST(requestWith({ ...leadValido }));
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledOnce();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sin LEAD_IP_SALT → inserta con ip_hash null (nunca IP en claro)", async () => {
    vi.stubEnv("LEAD_IP_SALT", "");
    await POST(requestWith({ ...leadValido }));
    expect(insertMock.mock.calls[0][0].ip_hash).toBeNull();
  });

  it("el email de notificación lleva replyTo del lead", async () => {
    await POST(requestWith({ ...leadValido }));
    expect(sendMock.mock.calls[0][0].replyTo).toBe("ana@acme.com");
  });

  it("rate limit: la 6.ª petición de la misma IP → 429", async () => {
    const fija = () =>
      new NextRequest("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "10.200.0.1" },
        body: JSON.stringify(leadValido),
      });
    for (let i = 0; i < 5; i++) {
      expect((await POST(fija())).status).toBe(200);
    }
    expect((await POST(fija())).status).toBe(429);
  });
});
