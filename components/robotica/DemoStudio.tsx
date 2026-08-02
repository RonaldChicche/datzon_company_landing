// components/robotica/DemoStudio.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { DEMOS } from "@/lib/robotica-demos";
import DemoPlayer from "@/components/robotica/DemoPlayer";

export default function DemoStudio() {
  const [activa, setActiva] = useState(DEMOS[0].id);

  return (
    <div className="rb-studio">
      <div className="rb-stage">
        {DEMOS.map((d) => (
          <div key={d.id} className={`rb-scene${d.id === activa ? " on" : ""}`}>
            <DemoPlayer src={d.video} poster={d.poster} etiqueta={d.etiqueta} activo={d.id === activa} />
            <div className="rb-copy">
              <p className="rb-hook">{d.gancho}</p>
              <p>{d.parrafo}</p>
              <div className="rb-variants">
                <p className="rb-variants-titulo">{d.variantesTitulo}</p>
                <div className="rb-chips">
                  {d.variantes.map((v) => (
                    <span key={v} className={`rb-chip${v === "¿El tuyo?" ? " rb-chip--mas" : ""}`}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="rb-rail" aria-label="Selector de demos">
        <p className="rb-rail-cap">Elige tu aplicación</p>
        {DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`rb-chan${d.id === activa ? " on" : ""}`}
            aria-pressed={d.id === activa}
            onClick={() => setActiva(d.id)}
          >
            <Image src={d.poster} alt="" width={96} height={54} className="rb-chan-thumb" />
            <span>
              <span className="rb-chan-nombre">{d.nombre}</span>
              <span className="rb-chan-app">{d.aplicacion}</span>
            </span>
          </button>
        ))}
        <p className="rb-rail-nota">Más demos en camino.<br />¿Quieres ver tu proceso aquí? →</p>
      </aside>
    </div>
  );
}
