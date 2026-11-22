"use client";

/**
 * Bloque de la demo destacada: título, vídeo bajo demanda (facade de YouTube),
 * texto con tags y enlace de respaldo a YouTube, y una fila de miniaturas
 * cuadradas que abren el lightbox en la foto elegida.
 */

import Image from "next/image";
import YouTubeFacade from "@/components/projects/YouTubeFacade";
import { imageAlt, projectImageUrl, type FeaturedDemo as FeaturedDemoData } from "@/lib/projects";
import { youtubeWatchUrl } from "@/lib/youtube";

type FeaturedDemoProps = {
  demo: FeaturedDemoData;
  /** Abre el lightbox de la demo en la foto i. */
  onOpen: (i: number) => void;
};

/** "Vista del taller" → "vista del taller", para usarlo dentro de una frase. */
function lowerFirst(text: string): string {
  return text.charAt(0).toLocaleLowerCase("es") + text.slice(1);
}

export default function FeaturedDemo({ demo, onOpen }: FeaturedDemoProps) {
  const total = demo.images.length;

  return (
    <article className="feat" aria-labelledby="feat-title">
      <div>
        <span className="kicker">
          Destacado <span className="pill demo">Demo</span>
        </span>
        <h2 id="feat-title">{demo.title}</h2>
      </div>

      <div className="feat-body">
        <YouTubeFacade
          videoId={demo.youtubeId}
          poster={projectImageUrl(demo.slug, demo.poster)}
          title={`${demo.title}, vídeo de la demo`}
        />
        <div className="feat-side">
          <p>{demo.description}</p>
          <ul className="feat-tags" aria-label="Temas">
            {demo.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <a
            className="yt-link"
            href={youtubeWatchUrl(demo.youtubeId)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en YouTube <span aria-hidden="true">↗</span>
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        </div>
      </div>

      <div className="feat-thumbs">
        {demo.images.map((img, i) => (
          <button
            key={img.file}
            type="button"
            className="feat-thumb"
            aria-label={`Ver foto ${i + 1} de ${total}: ${lowerFirst(imageAlt(demo, i))}`}
            onClick={() => onOpen(i)}
          >
            <Image
              src={projectImageUrl(demo.slug, img.file)}
              alt=""
              fill
              sizes="(max-width: 900px) 33vw, 16vw"
              style={{ objectPosition: img.focus }}
            />
          </button>
        ))}
      </div>
    </article>
  );
}
