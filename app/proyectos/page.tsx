import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Proyectos de automatización industrial, robótica, control y datos de Datzon.",
};

const PROJECTS = [
  {
    id: "p1",
    tag: "Robótica · Manufactura",
    title: "Celda de paletizado robotizado",
    desc: "Robot de fin de línea para ordenar y paletizar producto terminado.",
    image: "/images/industrial-robot.jpg",
    imageAlt: "Celda robótica de paletizado",
  },
  {
    id: "p2",
    tag: "Robótica · Metalmecánica",
    title: "Celda robótica de soldadura",
    desc: "Estación de soldadura automatizada con posicionador y control de calidad.",
    image: "/images/industrial-planta.jpg",
    imageAlt: "Celda de soldadura robotizada",
  },
  {
    id: "p3",
    tag: "Control · Minería",
    title: "Tablero eléctrico & PLC",
    desc: "Diseño, fabricación e integración de tableros con programación de PLC.",
    image: "/images/industrial-planta.jpg",
    imageAlt: "Tablero eléctrico industrial",
  },
  {
    id: "p4",
    tag: "Visión · Alimentos",
    title: "Inspección por visión artificial",
    desc: "Control de calidad en línea con cámaras y rechazo automático.",
    image: "/images/industrial-robot.jpg",
    imageAlt: "Sistema de visión artificial en línea",
  },
  {
    id: "p5",
    tag: "Manufactura digital",
    title: "Fabricación CNC & impresión 3D",
    desc: "Piezas, utillajes y repuestos a demanda con modelado y CNC.",
    image: "/images/industrial-planta.jpg",
    imageAlt: "Fabricación CNC y manufactura digital",
  },
  {
    id: "p6",
    tag: "Datos & Nube · Energía",
    title: "Dashboard de OEE en la nube",
    desc: "Datos de planta integrados a ERP con tableros en Power BI.",
    image: "/images/industrial-robot.jpg",
    imageAlt: "Dashboard de métricas industriales en la nube",
  },
];

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
            Una selección de integraciones de automatización, robótica, control
            y datos que hemos ejecutado en distintas industrias del Perú.
          </p>
        </div>
      </section>

      {/* ============ PROJECT GRID ============ */}
      <section className="section-light solid">
        <div className="wrap sec">
          <div className="proj-grid" id="proj-grid">
            {PROJECTS.map((proj) => (
              <article key={proj.id} className="proj">
                <div style={{ position: "relative", aspectRatio: "16/11", width: "100%" }}>
                  <Image
                    src={proj.image}
                    alt={proj.imageAlt}
                    fill
                    sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw"
                    className="pimg"
                    style={{ objectFit: "cover", position: "absolute" }}
                  />
                </div>
                <div className="pbody">
                  <div className="ptag">{proj.tag}</div>
                  <h3>{proj.title}</h3>
                  <p>{proj.desc}</p>
                </div>
              </article>
            ))}
          </div>

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
