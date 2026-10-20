import { describe, it, expect } from "vitest";
import { WHATSAPP_HREF } from "./contact-links";

describe("WHATSAPP_HREF", () => {
  it("es una ruta interna y no expone el número", () => {
    expect(WHATSAPP_HREF).toBe("/whatsapp");
    expect(WHATSAPP_HREF).not.toMatch(/\d{9}/);
  });
});
