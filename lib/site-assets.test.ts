import { describe, it, expect } from "vitest";
import { STORAGE_PUBLIC_BASE, siteAssetUrl } from "./site-assets";
import { projectImageUrl } from "./projects";

const BASE =
  "https://adnvzdcqcneqjemxneht.supabase.co/storage/v1/object/public/landing";

describe("siteAssetUrl", () => {
  it("arma la URL pública bajo site/", () => {
    expect(siteAssetUrl("hero.webp")).toBe(`${BASE}/site/hero.webp`);
  });

  it("respeta subcarpetas bajo site/", () => {
    expect(siteAssetUrl("equipo/danilo-luque.webp")).toBe(
      `${BASE}/site/equipo/danilo-luque.webp`
    );
  });
});

describe("base compartida", () => {
  it("STORAGE_PUBLIC_BASE es la base del bucket", () => {
    expect(STORAGE_PUBLIC_BASE).toBe(BASE);
  });

  it("projectImageUrl sigue funcionando igual tras el refactor", () => {
    expect(projectImageUrl("soldadura-con-robot", "IMG-20250429-WA0062.webp")).toBe(
      `${BASE}/project/soldadura-con-robot/IMG-20250429-WA0062.webp`
    );
  });
});
