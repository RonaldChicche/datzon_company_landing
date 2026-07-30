"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { siteAssetUrl } from "@/lib/site-assets";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];

const teamMembers = [
  {
    name: "Danilo Luque",
    role: "Ing. Mecatrónico",
    bio: "Ingeniero especializado en diseño y certificación de equipos industriales bajo normativas internacionales.",
    image: siteAssetUrl("equipo/danilo-luque.webp"),
    objectPosition: "center top",
  },
  {
    name: "Jeffry Huanca",
    role: "Ing. Mecatrónico",
    bio: "Proyectista en integración de sistemas, implementación en planta y validación de soluciones industriales.",
    image: siteAssetUrl("equipo/jeffry-huanca.webp"),
    objectPosition: "center top",
  },
  {
    name: "Jose Zamora",
    role: "Ing. Mecatrónico",
    bio: "Especialista en diseño de sistemas automatizados y desarrollo de soluciones electromecánicas para optimización de procesos productivos.",
    image: siteAssetUrl("equipo/jose-zamora.webp"),
    objectPosition: "center top",
  },
  {
    name: "John Ojeda",
    role: "Ing. Electrónico",
    bio: "Ingeniero especialista en proyectos industriales con más de 25 años de experiencia en minería y plantas de proceso, especializado en ejecución y puesta en marcha de sistemas industriales.",
    image: siteAssetUrl("equipo/john-ojeda.webp"),
    objectPosition: "center top",
  },
  {
    name: "Ronald Chicche",
    role: "Ing. Mecatrónico",
    bio: "Especialista en automatización, integración digital, análisis de datos e inteligencia aplicada a procesos industriales.",
    image: siteAssetUrl("equipo/ronald-chicche.webp"),
    objectPosition: "center 15%",
  },
];

export default function TeamContent() {
  const reduced = useReducedMotion() ?? false;

  const rv = (delay = 0) => ({
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 as const },
    transition: { duration: reduced ? 0 : 0.6, ease: EASE, delay: reduced ? 0 : delay },
  });

  return (
    <>
      {/* ============ PAGE HEAD ============ */}
      <section className="page-head page-head--light">
        <div className="grid-bg" />
        <div className="watermark" aria-hidden="true">DAT</div>
        <div className="wrap">
          <motion.div {...rv(0)} className="breadcrumb">
            <Link href="/">Inicio</Link> / Equipo
          </motion.div>
          <motion.h1 {...rv(0.08)}>
            Las mentes detrás<br />
            <span className="accent">de la precisión</span>
          </motion.h1>
          <motion.p {...rv(0.16)} className="lead">
            Nuestro equipo multidisciplinario combina sólida experiencia en
            robótica, automatización industrial y sistemas de control para
            diseñar e implementar soluciones de alta confiabilidad.
          </motion.p>
        </div>
      </section>

      {/* ============ TEAM GRID ============ */}
      <section className="section-light solid">
        <div className="wrap sec">
          <div className="team-grid cols-3">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                {...rv(i * 0.1)}
                className="member"
              >
                {/* Photo — B/N → colour on hover via .member CSS class */}
                <div className="photo" style={{ position: "relative" }}>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 680px) 100vw, (max-width: 980px) 50vw, 33vw"
                    // Los retratos son el contenido más escrutado de la página:
                    // a la calidad por defecto (75) la recompresión se nota.
                    quality={90}
                    style={{ objectFit: "cover", objectPosition: member.objectPosition }}
                  />
                  {/* Bio panel — slides up on hover via .bio-panel CSS */}
                  <div className="bio-panel">
                    <p>{member.bio}</p>
                  </div>
                </div>

                <div className="barline" />
                <h3>{member.name}</h3>
                <div className="role">{member.role}</div>
                <p className="bio">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="cta-band">
        <div className="wrap">
          <span className="kicker">Carreras</span>
          <h2>Únete a la vanguardia</h2>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="mailto:contacto@datzoncompany.com?subject=Carreras%20en%20Datzon"
              className="btn btn-dark"
              id="equipo-cta-carreras"
            >
              Escríbenos <span className="arr">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
