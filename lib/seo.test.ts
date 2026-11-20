import { describe, expect, it } from "vitest";
import { pageMetadata } from "./seo";

describe("pageMetadata", () => {
  it("genera metadata completa para la home dejando que app/opengraph-image.png inyecte la imagen con su hash", () => {
    const meta = pageMetadata({
      description: "Descripción de inicio",
      path: "/",
    });

    expect(meta.title).toBeUndefined();
    expect(meta.description).toBe("Descripción de inicio");
    expect(meta.alternates?.canonical).toBe("/");
    expect(meta.openGraph).toEqual({
      type: "website",
      locale: "es_PE",
      url: "/",
      siteName: "Datzon",
      title: "Datzon | Ingeniería y Automatización Industrial",
      description: "Descripción de inicio",
    });
    expect(meta.twitter).toEqual({
      card: "summary_large_image",
      title: "Datzon | Ingeniería y Automatización Industrial",
      description: "Descripción de inicio",
    });
  });

  it("construye el título compuesto e incluye explícitamente la imagen Open Graph en páginas internas", () => {
    const meta = pageMetadata({
      title: "Robótica",
      description: "Demos de robótica industrial",
      path: "/robotica",
    });

    expect(meta.title).toBe("Robótica");
    expect(meta.alternates?.canonical).toBe("/robotica");
    expect(meta.openGraph).toEqual({
      type: "website",
      locale: "es_PE",
      url: "/robotica",
      siteName: "Datzon",
      title: "Robótica | Datzon",
      description: "Demos de robótica industrial",
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "Datzon Automatización Industrial",
          type: "image/png",
        },
      ],
    });
    expect(meta.twitter).toEqual({
      card: "summary_large_image",
      title: "Robótica | Datzon",
      description: "Demos de robótica industrial",
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "Datzon Automatización Industrial",
          type: "image/png",
        },
      ],
    });
  });
});
