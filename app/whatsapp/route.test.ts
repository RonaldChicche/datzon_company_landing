import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /whatsapp", () => {
  it("redirige 302 al chat de wa.me con el mensaje pre-armado", () => {
    const res = GET();
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("location") ?? "");
    expect(location.origin + location.pathname).toBe("https://wa.me/51956956778");
    expect(location.searchParams.get("text")).toBe("Hola, quiero cotizar un proyecto con Datzon.");
  });

  it("no se cachea ni se indexa", () => {
    const res = GET();
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });
});
