"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import ContactForm from "@/components/ContactForm";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];

const BRANDS = [
  "AWS", "Microsoft Azure", "Google Cloud", "Siemens", "SAP",
  "Rockwell", "Schneider Electric", "ABB", "FANUC", "Databricks", "Power BI",
];

const SERVICES = [
  {
    num: "01", title: "Automatización de procesos",
    desc: "Líneas automatizadas de paletizado, clasificación de objetos, pintura y soldadura, diseñadas a la medida de tu producción.",
    tags: ["Paletizado", "Clasificación", "Pintura", "Soldadura"],
  },
  {
    num: "02", title: "Robótica industrial",
    desc: "Celdas robóticas de paletizado y soldadura: selección, integración, programación y puesta en marcha de robots industriales.",
    tags: ["Celdas robóticas", "Integración", "Programación"],
  },
  {
    num: "03", title: "Control & tableros eléctricos",
    desc: "Diseño y fabricación de tableros eléctricos, integración y programación de PLC, y arquitecturas de control confiables.",
    tags: ["Tableros", "Integración PLC", "SCADA"],
  },
  {
    num: "04", title: "Visión artificial & analítica",
    desc: "Inspección por visión, control de calidad automatizado y analítica de procesos para detectar desvíos antes de que cuesten.",
    tags: ["Visión artificial", "Calidad", "Analítica"],
  },
  {
    num: "05", title: "Manufactura digital",
    desc: "Modelado e impresión 3D, fabricación CNC y prototipado rápido para piezas, utillajes y repuestos a demanda.",
    tags: ["Impresión 3D", "CNC", "Prototipado"],
  },
  {
    num: "06", title: "Datos, IoT & nube",
    desc: "Integración con ERP/SAP, IoT industrial, Azure · AWS · GCP, Power BI, Databricks y agentes de IA aplicados a la operación.",
    tags: ["ERP/SAP", "Power BI", "Databricks", "Agentes IA"],
  },
];

export default function HomeContent() {
  const reduced = useReducedMotion() ?? false;

  // Hero: animate on mount
  const fd = (delay: number) => ({
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.5, ease: EASE, delay: reduced ? 0 : delay },
  });

  // Sections: animate on scroll-into-view
  const rv = (delay = 0) => ({
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 as const },
    transition: { duration: reduced ? 0 : 0.6, ease: EASE, delay: reduced ? 0 : delay },
  });

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero-full">
        {/* Full-bleed B/N photo */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src="/images/industrial-planta.jpg"
            alt="Planta industrial automatizada"
            fill
            priority
            sizes="100vw"
            className="object-cover grayscale"
          />
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <motion.span {...fd(0)} className="chip" style={{ display: "inline-block" }}>
            Industrial Automation
          </motion.span>

          <motion.h1 {...fd(0.1)}>
            Revolucionando<br />
            <span className="accent">el futuro</span><br />
            de las industrias
          </motion.h1>

          <motion.p {...fd(0.2)} className="lead">
            Diseño, fabricación e integración de sistemas industriales automatizados.
            Robótica, PLC, SCADA, visión artificial y datos para optimizar la producción de tu planta.
          </motion.p>

          <motion.div {...fd(0.3)} className="hero-cta">
            <Link href="#soluciones" className="btn btn-primary">
              Explorar soluciones <span className="arr">→</span>
            </Link>
            <Link href="/robotica" className="btn btn-ghost">
              Ver la robótica en vivo
            </Link>
          </motion.div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <span className="ln" />
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <section className="marquee" aria-label="Tecnologías y plataformas">
        <div className="marquee-track">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span key={i} className="brand">{brand}</span>
          ))}
        </div>
      </section>

      {/* ============ SOLUCIONES ============ */}
      <section className="section-light" id="soluciones">
        <div className="watermark" aria-hidden="true">DAT</div>
        <div className="wrap sec">
          <div className="sec-head split">
            <div>
              <motion.span {...rv(0)} className="kicker" style={{ display: "inline-flex" }}>
                Soluciones de ingeniería industrial
              </motion.span>
              <motion.h2 {...rv(0.08)}>
                Una sola ingeniería,<br />
                <span className="it">de extremo a extremo</span>
              </motion.h2>
            </div>
            <motion.p {...rv(0.16)} className="right">
              Infraestructura industrial de alto rendimiento que cierra la brecha entre la precisión del hardware y la inteligencia digital.
            </motion.p>
          </div>

          <div className="svc-grid">
            {SERVICES.map((svc, i) => (
              <motion.div key={svc.num} {...rv(i * 0.07)} className="svc">
                <div className="bar" />
                <div className="num">{svc.num}</div>
                <h3>{svc.title}</h3>
                <p>{svc.desc}</p>
                <div className="tags">
                  {svc.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="stats section-dark">
        <div className="wrap">
          <div className="stats-grid">
            {[
              { n: <><b>6</b></>, l: "Dominios de ingeniería integrados, de la celda robótica al dato" },
              { n: <>3 <b>nubes</b></>, l: "Soluciones sobre Azure, AWS y Google Cloud" },
              { n: <><b>24/7</b></>, l: "Monitoreo y soporte de líneas y sistemas críticos" },
              { n: <><b>0</b> silos</>, l: "Planta, PLC y ERP/SAP conectados en un mismo flujo" },
            ].map((stat, i) => (
              <motion.div key={i} {...rv(i * 0.08)} className="stat">
                <div className="n">{stat.n}</div>
                <div className="l">{stat.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COTIZAR ============ */}
      <section className="sec contact section-dark" id="cotizar">
        <div className="wrap contact-inner">
          <motion.div {...rv(0)}>
            <span className="kicker on-dark">¿Listo para automatizar?</span>
            <h2 style={{ margin: "18px 0 22px" }}>
              Hablemos de<br />tu planta
            </h2>
            <p className="lead">
              Cuéntanos qué proceso quieres automatizar o qué dato necesitas ver.
              Te respondemos con una propuesta concreta en un día hábil.
            </p>

            <div style={{ marginTop: "32px" }}>
              <div className="info-row">
                <div className="k">Empresa</div>
                <div className="v">
                  DATZON S.A.C.
                  <span>RUC 20615575624 · Industrial Automation</span>
                </div>
              </div>
              <div className="info-row">
                <div className="k">Oficina</div>
                <div className="v">
                  Cal. Mercator 484, Dpto. 101
                  <span>San Borja, Lima, Perú</span>
                </div>
              </div>
              <div className="info-row">
                <div className="k">Correo</div>
                <div className="v">
                  <a href="mailto:contacto@datzoncompany.com">contacto@datzoncompany.com</a>
                  <span>Respuesta en 1 día hábil</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...rv(0.12)}>
            <ContactForm />
          </motion.div>
        </div>
      </section>
    </>
  );
}
