"use client";

/**
 * Lightbox compartido por la demo destacada y las tarjetas de proyecto.
 *
 * - Se monta vía portal en <body> para escapar del stacking context de la
 *   sección (si no, el Header lo taparía).
 * - Accesible: role="dialog" con foco en "Cerrar", cierre con Esc,
 *   navegación con flechas ← → y, al cerrar, el foco vuelve al botón que
 *   abrió la galería.
 * - Deslizar (dedo o mouse) cambia de foto.
 * - Respeta prefers-reduced-motion.
 */

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { imageAlt, projectImageUrl, type Project } from "@/lib/projects";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];

const KIND_LABEL: Record<Project["kind"], string> = {
  proyecto: "Proyecto",
  demo: "Demo",
};

type LightboxProps = {
  /** Proyecto abierto, o null si el lightbox está cerrado. */
  project: Project | null;
  /** Foto activa dentro de project.images. */
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

export default function Lightbox({ project, index, onIndex, onClose }: LightboxProps) {
  const reduce = useReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  // Elemento que tenía el foco al abrir: se le devuelve al cerrar.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // useSyncExternalStore es la forma idiomática de preguntar "¿ya estoy en el
  // cliente?": devuelve false en el servidor y true en el navegador, sin
  // setState dentro de un efecto (que provoca un render en cascada).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isOpen = project !== null;
  const total = project?.images.length ?? 0;

  const next = useCallback(() => onIndex((index + 1) % total), [onIndex, index, total]);
  const prev = useCallback(() => onIndex((index - 1 + total) % total), [onIndex, index, total]);

  // Al abrir: guarda el foco previo, enfoca "Cerrar" y bloquea el scroll del
  // body. Al cerrar: restaura el scroll y devuelve el foco. Depende solo de
  // isOpen para no robar el foco cada vez que cambia la foto.
  useEffect(() => {
    if (!isOpen) return;

    const active = document.activeElement;
    returnFocusRef.current = active instanceof HTMLElement ? active : null;
    closeBtnRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      const el = returnFocusRef.current;
      returnFocusRef.current = null;
      if (el && el.isConnected) el.focus();
    };
  }, [isOpen]);

  // Teclado mientras el lightbox está abierto.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, next, prev]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-bg-2/95 backdrop-blur-sm"
          />

          {/* Capa de contenido. pointer-events-none → los clics en zonas
              vacías "atraviesan" hasta el backdrop y cierran la galería.
              Solo los controles e imagen reactivan pointer-events-auto. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Galería: ${project.title}`}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
            className="pointer-events-none fixed inset-0 z-[201] flex flex-col p-4 sm:p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4">
              <div className="min-w-0">
                <span className="pill on-dark">{KIND_LABEL[project.kind]}</span>
                <h2 className="mt-2 truncate font-display text-base text-ink sm:text-lg">
                  {project.title}
                </h2>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar galería"
                className="pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-lime text-bg-2 shadow-lg transition-colors hover:bg-lime-2"
              >
                <X size={24} strokeWidth={2.75} />
              </button>
            </div>

            {/* Imagen principal, centrada y dimensionada a su contenido,
                de modo que el área alrededor cierra al hacer clic. */}
            <div className="relative flex flex-1 select-none items-center justify-center overflow-hidden">
              {/* Wrapper arrastrable: solo envuelve la imagen, así el área
                  oscura alrededor sigue cerrando al tocar. Drag horizontal
                  (dedo o mouse) → cambia de foto al superar el umbral. */}
              <motion.div
                key={index}
                drag={total > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  const swipe =
                    Math.abs(info.offset.x) > 80 ||
                    Math.abs(info.velocity.x) > 500;
                  if (!swipe) return;
                  if (info.offset.x < 0) next();
                  else prev();
                }}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
                className={`pointer-events-auto flex max-h-full max-w-full items-center justify-center ${
                  total > 1 ? "cursor-grab active:cursor-grabbing" : ""
                }`}
              >
                <Image
                  src={projectImageUrl(project.slug, project.images[index].file)}
                  alt={imageAlt(project, index)}
                  width={0}
                  height={0}
                  sizes="100vw"
                  priority
                  draggable={false}
                  className="h-auto max-h-full w-auto max-w-full object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </motion.div>

              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Foto anterior"
                    className="pointer-events-auto absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm border border-line bg-bg-2/70 text-ink transition-colors hover:bg-surface sm:left-4"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Foto siguiente"
                    className="pointer-events-auto absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm border border-line bg-bg-2/70 text-ink transition-colors hover:bg-surface sm:right-4"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Contador + miniaturas */}
            <div className="pt-4">
              <p className="mb-3 text-center font-mono text-[11px] uppercase tracking-wider text-muted">
                {index + 1} / {total}
              </p>
              {total > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto pb-1">
                  {project.images.map((img, idx) => (
                    <button
                      key={img.file}
                      type="button"
                      onClick={() => onIndex(idx)}
                      aria-label={`Ir a la foto ${idx + 1}`}
                      aria-current={idx === index}
                      className={`pointer-events-auto relative h-14 w-20 shrink-0 overflow-hidden rounded-sm border transition-opacity ${
                        idx === index
                          ? "border-lime opacity-100"
                          : "border-line opacity-50 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={projectImageUrl(project.slug, img.file)}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
