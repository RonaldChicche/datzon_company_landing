"use client";

/**
 * Facade de YouTube: hasta que el usuario hace clic solo se muestra un póster
 * (next/image) con un botón de reproducir. El iframe, que pesa cientos de KB
 * de JS de terceros, se crea recién al hacer clic y recibe el foco. Nunca se
 * renderiza en el servidor: el estado inicial es siempre "sin reproducir".
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { youtubeEmbedUrl } from "@/lib/youtube";

type YouTubeFacadeProps = {
  videoId: string;
  /** URL del póster. */
  poster: string;
  /** Título accesible del iframe. */
  title: string;
  /** Etiqueta accesible del botón de reproducir. */
  playLabel: string;
};

export default function YouTubeFacade({ videoId, poster, title, playLabel }: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // El botón desaparece al hacer clic: el foco pasa al reproductor para que
  // quien navega con teclado no lo pierda.
  useEffect(() => {
    if (playing) iframeRef.current?.focus();
  }, [playing]);

  return (
    <div className="yt-facade">
      {playing ? (
        <iframe
          ref={iframeRef}
          src={youtubeEmbedUrl(videoId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          className="yt-btn"
          aria-label={playLabel}
          onClick={() => setPlaying(true)}
        >
          <Image
            src={poster}
            alt=""
            fill
            preload
            sizes="(max-width: 900px) 100vw, 60vw"
          />
          <span className="yt-play" aria-hidden="true">
            <span>
              <svg viewBox="0 0 24 24">
                <path d="M6 4l14 8-14 8z" />
              </svg>
            </span>
          </span>
          <span className="yt-label" aria-hidden="true">Vídeo de la demo</span>
        </button>
      )}
    </div>
  );
}
