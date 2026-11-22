"use client";

/**
 * Galería de proyectos: grid de tarjetas (portada) que abren un lightbox
 * con todas las fotos del proyecto.
 *
 * - Server-friendly: recibe los datos ya resueltos (no hace fetch).
 * - El lightbox vive en components/projects/Lightbox.tsx.
 * - Respeta prefers-reduced-motion.
 */

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Images } from "lucide-react";
import { PROJECTS, projectImageUrl, type Project } from "@/lib/projects";
import Lightbox from "@/components/projects/Lightbox";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];

export default function ProjectsGallery() {
  const reduce = useReducedMotion();

  // Proyecto abierto en el lightbox y foto activa.
  const [open, setOpen] = useState<{ project: Project; index: number } | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const setIndex = useCallback(
    (index: number) => setOpen((o) => (o ? { ...o, index } : o)),
    [],
  );

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
            onClick={() => setOpen({ project: proj, index: 0 })}
            aria-label={`Ver galería del proyecto: ${proj.title} (${proj.images.length} fotos)`}
            className="proj appearance-none text-left p-0 w-full cursor-pointer"
            {...cardAnim(i)}
          >
            <div style={{ position: "relative", aspectRatio: "16/11", width: "100%" }}>
              <Image
                src={projectImageUrl(proj.slug, proj.images[0].file)}
                alt={`${proj.title}, portada`}
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
              <div className="ptag">Proyecto</div>
              <h3>{proj.title}</h3>
              <p>{proj.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <Lightbox
        project={open?.project ?? null}
        index={open?.index ?? 0}
        onIndex={setIndex}
        onClose={close}
      />
    </>
  );
}
