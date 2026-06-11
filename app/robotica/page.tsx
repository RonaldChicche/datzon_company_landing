import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PalletizerSim from "@/components/PalletizerSim";

export const metadata: Metadata = {
  title: "Robótica",
  description:
    "Simulación de paletizado robotizado: configura el arreglo y observa la celda en operación. Robótica industrial por Datzon.",
};

const APPS = [
  { name: "Paletizado", desc: "fin de línea · alto volumen" },
  { name: "Soldadura", desc: "MIG/TIG · repetibilidad" },
  { name: "Pick & place", desc: "clasificación · empaque" },
  { name: "Pintura", desc: "acabado uniforme" },
  { name: "Manipulación", desc: "cargas pesadas" },
  { name: "Inspección", desc: "visión + robot" },
];

export default function RoboticaPage() {
  return (
    <>
      {/* ============ PAGE HEAD ============ */}
      <section className="page-head page-head--light">
        <div className="grid-bg" />
        <div className="watermark" aria-hidden="true">DAT</div>
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link> / Robótica
          </div>
          <h1>
            Celda de paletizado<br />
            <span className="accent">en operación</span>
          </h1>
          <p className="lead">
            Así trabaja una celda que diseñamos: el cobot recoge cada caja de
            la faja, arma el arreglo que tú configures sobre la parihuela y la
            línea se la lleva. Elige el patrón y observa el ciclo completo.
          </p>
        </div>
      </section>

      {/* ============ SIMULACIÓN ============ */}
      <section className="section-light solid">
        <div className="wrap sec" style={{ paddingTop: 64 }}>
          <Suspense
            fallback={
              <div
                style={{
                  minHeight: 580,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted-d)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                Cargando simulación…
              </div>
            }
          >
            <PalletizerSim />
          </Suspense>

          {/* ====== APLICACIONES ====== */}
          <div className="sec-head split" style={{ marginTop: 88 }}>
            <div>
              <span className="kicker">Aplicaciones</span>
              <h2>
                Del modelo<br />a la planta
              </h2>
            </div>
            <p className="right">
              Seleccionamos, integramos y programamos robots industriales para
              tareas repetitivas, peligrosas o de alta precisión — con
              seguridad y trazabilidad.
            </p>
          </div>

          <div className="ind-grid">
            {APPS.map((app) => (
              <div key={app.name} className="ind">
                <div className="dot" />
                <div>
                  <h3>{app.name}</h3>
                  <p>{app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="cta-band">
        <div className="wrap">
          <span className="kicker">¿Una celda robótica para tu línea?</span>
          <h2>Automaticemos el movimiento</h2>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/#cotizar" className="btn btn-dark" id="robotica-cta-cotizar">
              Solicitar cotización <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
