import Link from "next/link";
import ProjectsGallery from "@/components/ProjectsGallery";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Proyectos y demos",
  description:
    "Demo de soldadura robotizada y proyectos de Datzon: elevadores hidráulicos, plataforma giratoria y el velero de investigación Pathfinder.",
  path: "/proyectos",
});

export default function ProyectosPage() {
  return (
    <>
      {/* ============ PAGE HEAD ============ */}
      <section className="page-head page-head--deep">
        <div className="watermark" aria-hidden="true">DAT</div>
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link> / Proyectos
          </div>
          <h1>
            Proyectos <span className="accent">y demos</span>
          </h1>
        </div>
      </section>

      {/* ============ PROJECT GRID ============ */}
      <section className="section-light">
        <div className="wrap sec sec--top-tight">
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
