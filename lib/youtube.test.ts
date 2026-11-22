// lib/youtube.test.ts
import { describe, expect, it } from "vitest";
import { youtubeEmbedUrl, youtubeWatchUrl } from "./youtube";

describe("youtube", () => {
  it("arma la URL sin cookies con autoplay", () => {
    expect(youtubeEmbedUrl("zvhX8jre5Nk")).toBe("https://www.youtube-nocookie.com/embed/zvhX8jre5Nk?autoplay=1&rel=0");
  });
  it("arma el enlace de respaldo", () => {
    expect(youtubeWatchUrl("zvhX8jre5Nk")).toBe("https://www.youtube.com/watch?v=zvhX8jre5Nk");
  });
  it("rechaza ids que no son de YouTube", () => {
    expect(() => youtubeEmbedUrl("abc")).toThrow();
    expect(() => youtubeEmbedUrl("zvhX8jre5Nk&x=1")).toThrow();
  });
});
