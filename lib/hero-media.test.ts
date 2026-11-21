import { describe, it, expect } from "vitest";
import { HERO_POSTERS, heroVideoSources } from "./hero-media";

const BASE =
  "https://adnvzdcqcneqjemxneht.supabase.co/storage/v1/object/public/landing/site/hero/v8";

describe("heroVideoSources", () => {
  it("en horizontal da la versión 16:9, WebM primero y MP4 de respaldo", () => {
    expect(heroVideoSources("landscape")).toEqual([
      { src: `${BASE}/hero-16x9.webm`, type: "video/webm" },
      { src: `${BASE}/hero-16x9.mp4`, type: "video/mp4" },
    ]);
  });

  it("en vertical da la versión 9:16", () => {
    expect(heroVideoSources("portrait").map((s) => s.src)).toEqual([
      `${BASE}/hero-9x16.webm`,
      `${BASE}/hero-9x16.mp4`,
    ]);
  });
});

describe("HERO_POSTERS", () => {
  it("apunta a los pósters de la misma versión, con sus dimensiones reales", () => {
    expect(HERO_POSTERS.landscape).toEqual({ src: `${BASE}/hero-16x9-poster.webp`, width: 1920, height: 1080 });
    expect(HERO_POSTERS.portrait).toEqual({ src: `${BASE}/hero-9x16-poster.webp`, width: 1080, height: 1920 });
  });
});
