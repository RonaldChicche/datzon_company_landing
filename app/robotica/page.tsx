import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import DemoStudio from "@/components/robotica/DemoStudio";
import { APLICACIONES } from "@/lib/robotica-demos";

export const metadata: Metadata = {
  title: "Robótica",
  description:
    "Un robot para cada proceso: demos de paletizado, soldadura y manipulación delicada calculadas con cinemática real. Robótica industrial por Datzon.",
};

export default function RoboticaPage() {
  return (
    <>
      <section className="rb-head">
        <div className="rb-head-glow" aria-hidden="true" />
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link> / Robótica
          </div>
          <h1>
            Un robot para <span className="accent">cada proceso</span>
          </h1>
          <p className="lead">
            Imagina tu planta con <strong>un turno que nunca se cansa</strong>: cajas
            que se apilan solas, cordones perfectos, piezas frágiles intactas. Elige
            una aplicación y mírala en marcha. Todo lo que ves se puede construir en
            tu línea.
          </p>
        </div>
      </section>

      <section className="rb-estudio-seccion">
        <div className="wrap">
          <DemoStudio />
        </div>
      </section>

      <section className="section-light rb-apps">
        <div className="wrap sec">
          <span className="kicker">¿Y en tu planta?</span>
          <h2>Proyecta tu proceso</h2>
          <p className="rb-apps-sub">
            No nos casamos con un modelo: trabajamos con todo tipo de robots
            industriales y elegimos cada uno según tu carga, tu alcance y tu ritmo.
            Estas son las puertas de entrada más habituales:
          </p>
          <div className="rb-apps-grid">
            {APLICACIONES.map((a) => (
              <div key={a.nombre} className="rb-app">
                <div>
                  <h3>{a.nombre}</h3>
                  <p>{a.linea}</p>
                </div>
                <Image src={a.imagen} alt="" width={190} height={190} className="rb-app-ill" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <span className="kicker">¿Cuál de estas celdas se parece a tu proceso?</span>
          <h2>Hablemos de tu línea</h2>
          <p className="rb-cta-p">
            Cuéntanos qué haces a mano hoy y te decimos qué puede hacer un robot
            mañana, con números y no promesas.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/#cotizar" className="btn btn-dark" id="robotica-cta-cotizar">
              Solicitar diagnóstico <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
