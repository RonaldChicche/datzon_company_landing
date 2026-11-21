"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import { HERO_POSTERS, heroVideoSources } from "@/lib/hero-media";

/**
 * Fondo del hero del home: póster (LCP) + vídeo en bucle que aparece encima
 * con un fundido cuando empieza a reproducirse.
 *
 * - El póster va en el HTML del servidor, con fetchpriority alta: es el LCP.
 * - El vídeo no tiene fuentes en el HTML. Se le ponen en el navegador, y se
 *   carga después del `load` de la página para no competir con el póster.
 * - Con "reducir movimiento" o "ahorro de datos" no se carga: queda el póster.
 * - Es decorativo (aria-hidden): el significado lo lleva el titular.
 */
export default function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Chrome/Android expone el modo de ahorro de datos; Safari no (queda undefined).
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    // La versión se elige una vez, al cargar. La misma media query que el póster.
    const orientation = window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
    for (const { src, type } of heroVideoSources(orientation)) {
      const s = document.createElement("source");
      s.src = src;
      s.type = type;
      v.appendChild(s);
    }

    const onPlaying = () => v.classList.add("is-playing");
    v.addEventListener("playing", onPlaying, { once: true });

    const start = () => {
      // React no siempre refleja `muted` como atributo; sin él, el autoplay se bloquea.
      v.muted = true;
      v.load();
      // Si el navegador bloquea el autoplay (p. ej. iOS en modo de bajo consumo),
      // el vídeo sigue invisible y se ve el póster. No es un error.
      v.play().catch(() => {});
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      window.removeEventListener("load", start);
      v.removeEventListener("playing", onPlaying);
      v.pause();
      v.replaceChildren();
    };
  }, []);

  const common = { alt: "", sizes: "100vw", loading: "eager", fetchPriority: "high" } as const;
  const portrait = getImageProps({ ...common, ...HERO_POSTERS.portrait }).props;
  const landscape = getImageProps({ ...common, ...HERO_POSTERS.landscape }).props;

  return (
    <div className="hero-media" aria-hidden="true">
      <picture>
        <source media="(orientation: portrait)" srcSet={portrait.srcSet} sizes={portrait.sizes} />
        {/* <img> generado por getImageProps (patrón de next/image para art direction): conserva la optimización. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text -- el alt="" viene en el spread */}
        <img {...landscape} />
      </picture>
      <video ref={videoRef} muted loop playsInline preload="none" tabIndex={-1} />
    </div>
  );
}
