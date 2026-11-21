"use client";

import { useEffect, useRef } from "react";
import { addTick, buildScene, removeTick, type Scene, type SceneId } from "./iso-scenes";

/**
 * Animación isométrica de una tarjeta de servicio (decorativa: el texto de la
 * tarjeta lleva el significado y el contenedor tiene su aria-label).
 *
 * - Se dibuja en el navegador; HomeContent la carga con next/dynamic sin SSR
 *   para que su código no pese en la carga inicial del home.
 * - La escena se construye recién cuando la tarjeta se acerca a la pantalla.
 *   Construir las seis al hidratar retrasaba ~300 ms el pintado del titular
 *   del hero (el LCP) en móvil, medido el 2026-11-21.
 * - Solo se anima mientras está en pantalla.
 * - Con "reducir movimiento" se queda en un fotograma fijo que ya se entiende.
 */
export default function ServiceScene({ scene }: { scene: SceneId }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sc: Scene | null = null;
    let clock = 0;
    const tick = (dt: number) => {
      if (!sc) return;
      clock += dt;
      const t = clock % sc.dur;
      sc.render(t / sc.dur, t);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !sc) {
          sc = buildScene(scene, svg);
          sc.render(sc.rest, sc.rest * sc.dur);
        }
        if (!sc || reduce) return;
        if (entry.isIntersecting) addTick(tick);
        else removeTick(tick);
      },
      // Se construye un poco antes de entrar, para que ya esté dibujada al llegar.
      { rootMargin: "120px 0px" }
    );
    io.observe(svg);

    return () => {
      io.disconnect();
      removeTick(tick);
      svg.replaceChildren();
    };
  }, [scene]);

  return <svg ref={ref} viewBox="0 0 320 180" aria-hidden="true" focusable="false" />;
}
