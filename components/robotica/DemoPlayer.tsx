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
  const [cargadoPorInterseccion, setCargadoPorInterseccion] = useState(false);
  // derivado, no estado propio: cuando activo es true ya sabemos desde el
  // primer render (sin esperar a un efecto) que hay que cargar, así que no
  // hace falta duplicar esa señal en un setState dentro de un efecto.
  const cargado = cargadoPorInterseccion || activo;

  // visibilidad del reproductor (no reproducir fuera de pantalla) y arranque
  // diferido de la carga: la demo activa carga src/poster desde el primer
  // render (ver `cargado` arriba), porque su poster es la candidata a LCP
  // (Largest Contentful Paint) y no conviene retrasarla. Las demos inactivas
  // sí difieren la carga hasta el primer hit del IntersectionObserver o
  // hasta activarse.
  // Acoplado a que DemoStudio oculta las escenas inactivas con
  // `.rb-scene { display: none }`: solo la escena activa intersecta al
  // montar. Si eso cambiara a opacity/visibility, este observer dispararía
  // también para escenas no activas.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setCargadoPorInterseccion(true);
      },
      { threshold: 0.35 }
    );
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
    if (!cargado) {
      // defensa: en la práctica activo ya implica cargado (ver arriba), pero
      // si algún día deja de ser así, un clic no debe quedar sin efecto.
      // El efecto de autoplay se encarga de reproducir en cuanto el <video>
      // tenga src asignado.
      setCargadoPorInterseccion(true);
      return;
    }
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
    // lostpointercapture es el único punto de limpieza: se dispara tanto tras
    // pointerup como tras pointercancel (arrastre interrumpido por el SO, un
    // gesto del sistema, etc.). Si solo escucháramos pointerup, un
    // pointercancel dejaría "mover" vivo y el simple hover del cursor sobre
    // la barra seguiría haciendo seek de forma fantasma.
    s.addEventListener("lostpointercapture", () => s.removeEventListener("pointermove", mover), { once: true });
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
        src={cargado ? src : undefined}
        poster={cargado ? poster : undefined}
        muted
        loop
        playsInline
        preload="none"
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
