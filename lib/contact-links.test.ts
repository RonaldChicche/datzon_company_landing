import { describe, it, expect } from "vitest";
import { WHATSAPP_URL } from "./contact-links";

describe("WHATSAPP_URL", () => {
  it("apunta al número confirmado por wa.me", () => {
    expect(WHATSAPP_URL.startsWith("https://wa.me/51956956778?text=")).toBe(true);
  });

  it("lleva el mensaje exacto, URL-encoded", () => {
    const text = new URL(WHATSAPP_URL).searchParams.get("text");
    expect(text).toBe("Hola, quiero cotizar un proyecto con Datzon.");
  });
});
