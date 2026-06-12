import type { Metadata } from "next";
import Link from "next/link";
import ProjectsGallery from "@/components/ProjectsGallery";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Proyectos reales de automatización industrial, robótica, fabricación y sistemas embebidos ejecutados por Datzon.",
};

export default function ProyectosPage() {
  return (
    <>
      {/* ============ PAGE HEAD ============ */}
      <section className="page-head page-head--light">
        <div className="grid-bg" />
        <div className="watermark" aria-hidden="true">DAT</div>
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link> / Proyectos
          </div>
          <h1>
            Proyectos<br />
            <span className="accent">en planta</span>
          </h1>
          <p className="lead">
            Una selección de trabajos de automatización, robótica, fabricación y
            sistemas embebidos que hemos ejecutado. Haz clic en una tarjeta para
            ver la galería completa.
          </p>
        </div>
      </section>

      {/* ============ PROJECT GRID ============ */}
      <section className="section-light solid">
        <div className="wrap sec">
          <ProjectsGallery />

          {/* ====== CTA INLINE ====== */}
          <div
            style={{
              marginTop: 60,
              borderTop: "1px solid var(--line-d)",
              paddingTop: 48,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "clamp(24px,3vw,36px)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  color: "var(--ink-d)",
                }}
              >
                ¿Tienes un reto<br />de automatización?
              </h3>
            </div>
            <Link href="/#cotizar" className="btn btn-primary" id="proyectos-cta">
              Solicitar cotización <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
