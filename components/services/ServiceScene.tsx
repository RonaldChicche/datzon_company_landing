"use client";

import { useEffect, useRef } from "react";
import { addTick, buildScene, removeTick, type SceneId } from "./iso-scenes";

/**
 * Animación isométrica de una tarjeta de servicio (decorativa: el texto de la
 * tarjeta lleva el significado y el contenedor tiene su aria-label).
 *
 * - Se dibuja en el navegador; HomeContent la carga con next/dynamic sin SSR
 *   para que su código no pese en la carga inicial del home.
 * - Solo se anima mientras está en pantalla y empieza desde el principio.
 * - Con "reducir movimiento" se queda en un fotograma fijo que ya se entiende.
 */
export default function ServiceScene({ scene }: { scene: SceneId }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const sc = buildScene(scene, svg);
    sc.render(sc.rest, sc.rest * sc.dur);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => svg.replaceChildren();
    }

    let clock = 0;
    const tick = (dt: number) => {
      clock += dt;
      const t = clock % sc.dur;
      sc.render(t / sc.dur, t);
    };
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? addTick(tick) : removeTick(tick)),
      { threshold: 0.15 }
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
