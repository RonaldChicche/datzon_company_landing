import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

describe("buildCsp", () => {
  const csp = buildCsp("abc", false);
  it("permite solo el reproductor sin cookies", () => {
    expect(csp).toContain("frame-src https://www.youtube-nocookie.com;");
    expect(csp).not.toMatch(/frame-src[^;]*\/\/(www\.)?youtube\.com/);
  });
  it("mantiene lo que ya había", () => {
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic' https://va.vercel-scripts.com");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-eval");
  });
  it("en desarrollo añade unsafe-eval", () => expect(buildCsp("abc", true)).toContain("'unsafe-eval'"));
});
