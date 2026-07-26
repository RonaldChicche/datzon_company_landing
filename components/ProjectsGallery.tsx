"use client";

/**
 * Galería de proyectos: grid de tarjetas (portada) que abren un lightbox
 * con todas las fotos del proyecto.
 *
 * - Server-friendly: recibe los datos ya resueltos (no hace fetch).
 * - Accesible: el lightbox es role="dialog" con foco, cierre con Esc y
 *   navegación con flechas ← →.
 * - Respeta prefers-reduced-motion.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { PROJECTS, projectImageUrl } from "@/lib/projects";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];

export default function ProjectsGallery() {
  const reduce = useReducedMotion();

  // Proyecto abierto en el lightbox (índice en PROJECTS) y foto activa.
  const [openProject, setOpenProject] = useState<number | null>(null);
  const [photo, setPhoto] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // El lightbox se monta vía portal en <body> para escapar del stacking
  // context de la sección (si no, el Header lo taparía). Solo en cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const project = openProject !== null ? PROJECTS[openProject] : null;
  const total = project?.images.length ?? 0;

  const open = (projectIndex: number) => {
    setOpenProject(projectIndex);
    setPhoto(0);
  };
  const close = useCallback(() => setOpenProject(null), []);
  const next = useCallback(() => setPhoto((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setPhoto((p) => (p - 1 + total) % total), [total]);

  // Teclado + bloqueo de scroll del body mientras el lightbox está abierto.
  useEffect(() => {
    if (openProject === null) return;

    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openProject, close, next, prev]);

  const cardAnim = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.12 as const },
          transition: { duration: 0.6, ease: EASE, delay: i * 0.08 },
        };

  return (
    <>
      {/* ============ GRID DE TARJETAS ============ */}
      <div className="proj-grid">
        {PROJECTS.map((proj, i) => (
          <motion.button
            key={proj.slug}
            type="button"
            onClick={() => open(i)}
            aria-label={`Ver galería del proyecto: ${proj.title} (${proj.images.length} fotos)`}
            className="proj appearance-none text-left p-0 w-full cursor-pointer"
            {...cardAnim(i)}
          >
            <div style={{ position: "relative", aspectRatio: "16/11", width: "100%" }}>
              <Image
                src={projectImageUrl(proj.slug, proj.images[0])}
                alt={`${proj.title} — portada`}
                fill
                priority
                sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw"
                className="pimg"
                style={{ objectFit: "cover", position: "absolute" }}
              />
              {/* Contador de fotos */}
              <span
                className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-sm bg-bg-2/85 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ink backdrop-blur-sm"
                aria-hidden="true"
              >
                <Images size={13} />
                {proj.images.length}
              </span>
            </div>
            <div className="pbody">
              <div className="ptag">{proj.tag}</div>
              <h3>{proj.title}</h3>
              <p>{proj.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ============ LIGHTBOX (portal a <body>) ============ */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {project && (
              <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              onClick={close}
              className="fixed inset-0 z-[200] bg-bg-2/95 backdrop-blur-sm"
            />

            {/* Capa de contenido. pointer-events-none → los clics en zonas
                vacías "atraviesan" hasta el backdrop y cierran la galería.
                Solo los controles e imagen reactivan pointer-events-auto. */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Galería del proyecto ${project.title}`}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
              className="pointer-events-none fixed inset-0 z-[201] flex flex-col p-4 sm:p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-lime">
                    {project.tag}
                  </p>
                  <h2 className="truncate font-display text-base text-ink sm:text-lg">
                    {project.title}
                  </h2>
                </div>
                <button
                  ref={closeBtnRef}
                  onClick={close}
                  aria-label="Cerrar galería"
                  className="pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-lime text-bg-2 shadow-lg transition-colors hover:bg-lime-2"
                >
                  <X size={24} strokeWidth={2.75} />
                </button>
              </div>

              {/* Imagen principal — centrada y dimensionada a su contenido,
                  de modo que el área alrededor cierra al hacer clic. */}
              <div className="relative flex flex-1 select-none items-center justify-center overflow-hidden">
                {/* Wrapper arrastrable: solo envuelve la imagen, así el área
                    oscura alrededor sigue cerrando al tocar. Drag horizontal
                    (dedo o mouse) → cambia de foto al superar el umbral. */}
                <motion.div
                  key={photo}
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
                    src={projectImageUrl(project.slug, project.images[photo])}
                    alt={`${project.title} — foto ${photo + 1} de ${total}`}
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
                      onClick={prev}
                      aria-label="Foto anterior"
                      className="pointer-events-auto absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm border border-line bg-bg-2/70 text-ink transition-colors hover:bg-surface sm:left-4"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
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
                  {photo + 1} / {total}
                </p>
                {total > 1 && (
                  <div className="flex justify-center gap-2 overflow-x-auto pb-1">
                    {project.images.map((file, idx) => (
                      <button
                        key={file}
                        onClick={() => setPhoto(idx)}
                        aria-label={`Ir a la foto ${idx + 1}`}
                        aria-current={idx === photo}
                        className={`pointer-events-auto relative h-14 w-20 shrink-0 overflow-hidden rounded-sm border transition-opacity ${
                          idx === photo
                            ? "border-lime opacity-100"
                            : "border-line opacity-50 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={projectImageUrl(project.slug, file)}
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
        )}
    </>
  );
}
