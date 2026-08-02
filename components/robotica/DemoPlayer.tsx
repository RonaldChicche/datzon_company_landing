"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/video-time";

type Props = { src: string; poster: string; etiqueta: string; activo: boolean };

export default function DemoPlayer({ src, poster, etiqueta, activo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const [pausado, setPausado] = useState(true);
  const [actual, setActual] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [visible, setVisible] = useState(false);

  // visibilidad del reproductor (no reproducir fuera de pantalla)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // reproducir solo si la demo esta activa, visible y sin reduced motion
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (activo && visible && !reducido) v.play().catch(() => setPausado(true));
    else v.pause();
  }, [activo, visible]);

  const alternar = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setPausado(true));
    else v.pause();
  };

  const buscar = (clientX: number) => {
    const v = videoRef.current, s = scrubRef.current;
    if (!v || !s || !v.duration) return;
    const r = s.getBoundingClientRect();
    v.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * v.duration;
    setActual(v.currentTime);
  };

  const onScrubPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const s = scrubRef.current;
    if (!s) return;
    s.setPointerCapture(e.pointerId);
    buscar(e.clientX);
    const mover = (ev: PointerEvent) => buscar(ev.clientX);
    s.addEventListener("pointermove", mover);
    s.addEventListener("pointerup", () => s.removeEventListener("pointermove", mover), { once: true });
  };

  const onScrubKeyDown = (e: React.KeyboardEvent) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    if (e.key === "ArrowRight") { v.currentTime = Math.min(v.duration, v.currentTime + 1); setActual(v.currentTime); }
    if (e.key === "ArrowLeft") { v.currentTime = Math.max(0, v.currentTime - 1); setActual(v.currentTime); }
  };

  const progreso = duracion ? (actual / duracion) * 100 : 0;

  return (
    <div className="rb-player">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={etiqueta}
        onClick={alternar}
        onPlay={() => setPausado(false)}
        onPause={() => setPausado(true)}
        onTimeUpdate={(e) => setActual(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuracion(e.currentTarget.duration)}
      />
      <span className="rb-player-tag">{etiqueta}</span>
      <div className="rb-player-bar">
        <button
          type="button"
          className="rb-pp"
          aria-label={pausado ? "Reproducir" : "Pausar"}
          onClick={alternar}
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            {pausado
              ? <path d="M2 0l9 6-9 6z" fill="currentColor" />
              : <path d="M1 0h3v12H1zM8 0h3v12H8z" fill="currentColor" />}
          </svg>
        </button>
        <div
          ref={scrubRef}
          className="rb-scrub"
          role="slider"
          aria-label="Posición del vídeo"
          aria-valuemin={0}
          aria-valuemax={Math.round(duracion)}
          aria-valuenow={Math.round(actual)}
          tabIndex={0}
          onPointerDown={onScrubPointerDown}
          onKeyDown={onScrubKeyDown}
        >
          <span className="rb-scrub-track"><i className="rb-scrub-fill" style={{ width: `${progreso}%` }} /></span>
        </div>
        <span className="rb-tc">
          <b>{formatTime(actual)}</b> / {formatTime(duracion)}
        </span>
      </div>
    </div>
  );
}
