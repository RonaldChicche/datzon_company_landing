"use client";

import { motion } from "motion/react";
import { ArrowRight, Eye, RefreshCcw, DatabaseZap, Settings } from "lucide-react";

export default function SolutionsPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans">
      <main className="min-h-screen">
        {/* HERO SECTION: Engineered Solutions */}
        <section className="relative px-12 py-32 overflow-hidden technical-grid min-h-[600px] flex items-center">
          <div className="max-w-screen-2xl mx-auto w-full flex justify-between items-center">
            <div className="max-w-3xl relative z-10">
              <div className="inline-block bg-primary-container px-3 py-1 mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-primary-container font-headline">SISTEMAS INTEGRATIVOS V1.1</span>
              </div>
              <h1 className="text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8 font-headline">
                SOLUCIONES <br />
                <span className="text-primary-container italic inline-block">DE INGENIERÍA</span>
              </h1>
              <p className="text-secondary text-xl leading-relaxed max-w-2xl font-sans font-medium">
                Infraestructura industrial de alto rendimiento que cierra la brecha entre la precisión del hardware y la inteligencia digital.
              </p>
            </div>
          </div>
          {/* Vertical Watermark */}
          <div className="absolute right-12 top-0 bottom-0 flex items-center pointer-events-none">
            <span className="text-[320px] font-black text-black/[0.06] uppercase tracking-[-0.1em] rotate-90 origin-center whitespace-nowrap leading-none select-none font-headline">
              D A T
            </span>
          </div>
        </section>

        {/* SECTION 1: Automated Mechanical Solutions */}
        <section className="py-20 px-12 max-w-screen-2xl mx-auto border-t border-outline-variant/20 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="flex flex-col bg-surface-container-lowest p-8 border border-outline-variant/10 h-full justify-center">
              <p className="text-[10px] font-black text-primary-container uppercase tracking-[0.3em] mb-3 font-sans">MÓDULO_01 // MECÁNICA</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 font-headline leading-tight text-on-surface">
                Soluciones Mecánicas <br /> Automatizadas
              </h2>
              <p className="text-secondary text-sm leading-relaxed mb-8 font-sans max-w-lg">
                Sistemas de transportadores de rodillos a medida diseñados para logística de alto rendimiento. Nuestras arquitecturas basadas en PLC garantizan una sincronización de latencia cero.
              </p>
              
              <div className="space-y-3 mb-10">
                <div className="bg-surface-container-low border-l-[4px] border-primary-container p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DatabaseZap size={16} className="text-on-surface" />
                    <h4 className="font-black uppercase text-xs tracking-widest font-headline">INTEGRACIÓN DE MONITOREO REST API</h4>
                  </div>
                  <p className="text-secondary text-[10px] leading-relaxed font-mono uppercase tracking-tight">
                    Accesibilidad total a endpoints para extracción de telemetría en tiempo real.
                  </p>
                </div>
                <div className="bg-surface-container-low border-l-[4px] border-primary-container p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings size={16} className="text-on-surface" />
                    <h4 className="font-black uppercase text-xs tracking-widest font-headline">RETROALIMENTACIÓN PLC EN TIEMPO REAL</h4>
                  </div>
                  <p className="text-secondary text-[10px] leading-relaxed font-mono uppercase tracking-tight">
                    Precisión de milisegundos en el bucle de retorno para el torque del motor y la velocidad de la cinta.
                  </p>
                </div>
              </div>
              
              <button className="bg-primary-container text-on-primary-container px-6 py-4 font-black uppercase tracking-tight text-xs flex items-center justify-between gap-8 hover:brightness-110 transition-all font-headline w-full">
                VER ESPECIFICACIONES TÉCNICAS <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="relative group overflow-hidden aspect-square h-full max-h-[500px] w-full mx-auto md:ml-auto">
              <div className="absolute inset-0 bg-neutral-900/10 mix-blend-multiply z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800&h=800"
                alt="Línea de rodillos industriales"
                className="w-full h-full object-cover grayscale brightness-90 contrast-125 transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border border-black/20 z-20"></div>
              {/* Overlay data tag */}
              <div className="absolute bottom-6 right-6 bg-neutral-900 text-white p-4 font-mono text-[9px] leading-tight flex flex-col gap-2 z-30 shadow-2xl">
                 <div className="flex justify-between gap-6">
                   <span className="text-white/40">NODO</span>
                   <span className="text-primary-container font-black">SYNC_01</span>
                 </div>
                 <div className="flex justify-between gap-6">
                   <span className="text-white/40">TASA</span>
                   <span>1.2K UNIDADES/H</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Data & Analytics Ecosystems */}
        <section className="bg-neutral-900 py-20 px-12 overflow-hidden relative border-t border-white/5">
          {/* Black Grid Background */}
          <div className="absolute inset-0 technical-grid opacity-80 contrast-200 brightness-150 mix-blend-overlay"></div>
          
          <div className="max-w-screen-2xl mx-auto relative z-10 flex flex-col justify-center min-h-[500px]">
            <div className="text-center mb-16">
              <p className="text-[10px] font-black text-primary-container uppercase tracking-[0.3em] mb-4 font-sans">MÓDULO 02 // ANALÍTICA</p>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter font-headline">
                ECOSISTEMAS DE DATOS Y ANALÍTICA
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              {/* Left: Dashboard Mockup */}
              <div className="md:col-span-7 bg-black/80 border border-white/10 p-6 rounded-none backdrop-blur-xl shadow-2xl relative">
                <div className="flex gap-2 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/80"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/80"></div>
                  <span className="ml-3 font-mono text-[9px] text-white/40 uppercase tracking-widest">S_ANALYTICS_V4.0 // LIVE</span>
                </div>
                
                <div className="grid grid-cols-4 gap-3 mb-10">
                  <div className="bg-white/10 p-3 border-l-[3px] border-primary-container">
                    <p className="text-[7px] text-white/50 uppercase mb-1 font-sans font-bold">EFICIENCIA</p>
                    <p className="text-xl font-black text-primary-container font-headline leading-none">98.4%</p>
                  </div>
                  <div className="bg-white/10 p-3 border-l-[3px] border-white/20">
                    <p className="text-[7px] text-white/30 uppercase mb-1 font-sans font-bold">INACTIVIDAD</p>
                    <p className="text-xl font-black text-white font-headline leading-none">0.02h</p>
                  </div>
                  <div className="bg-white/10 p-3 border-l-[3px] border-white/20">
                    <p className="text-[7px] text-white/30 uppercase mb-1 font-sans font-bold">NODOS</p>
                    <p className="text-xl font-black text-white font-headline leading-none">42</p>
                  </div>
                  <div className="bg-white/10 p-3 border-l-[3px] border-white/20">
                    <p className="text-[7px] text-white/30 uppercase mb-1 font-sans font-bold">BOTS</p>
                    <p className="text-xl font-black text-white font-headline leading-none">16</p>
                  </div>
                </div>

                <div className="h-40 flex items-end gap-1.5 px-2">
                  {[40, 65, 35, 55, 45, 80, 100, 60, 40, 70, 85, 30].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.03 }}
                      className={`flex-1 ${i === 6 ? 'bg-primary-container shadow-[0_0_15px_rgba(118,185,0,0.5)]' : 'bg-primary-container/40'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Feature List */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 group hover:bg-black/60 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-4 bg-primary-container shadow-[0_0_8px_rgba(118,185,0,0.4)]"></div>
                    <h4 className="text-white font-black uppercase text-xs tracking-widest font-headline group-hover:text-primary-container transition-colors">INTEGRACIÓN ERP/NUBE</h4>
                  </div>
                  <p className="text-white/80 text-[11px] leading-relaxed font-sans pl-4">Tunelización de datos sin fisuras desde la planta de fabricación hasta las plataformas ERP corporativas.</p>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 group hover:bg-black/60 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-4 bg-primary-container shadow-[0_0_8px_rgba(118,185,0,0.4)]"></div>
                    <h4 className="text-white font-black uppercase text-xs tracking-widest font-headline group-hover:text-primary-container transition-colors">SOPORTE DE DECISIONES</h4>
                  </div>
                  <p className="text-white/80 text-[11px] leading-relaxed font-sans pl-4">Algoritmos de mantenimiento predictivo impulsados por IA que reducen el tiempo de inactividad no planificado en un 35%.</p>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 group hover:bg-black/60 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-4 bg-primary-container shadow-[0_0_8px_rgba(118,185,0,0.4)]"></div>
                    <h4 className="text-white font-black uppercase text-xs tracking-widest font-headline group-hover:text-primary-container transition-colors">GESTIÓN DE KPI</h4>
                  </div>
                  <p className="text-white/80 text-[11px] leading-relaxed font-sans pl-4">Paneles técnicos personalizables optimizados para monitoreo móvil y de escritorio en tiempo real.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Industrial Robotics & Palletizing */}
        <section className="py-20 px-12 max-w-screen-2xl mx-auto relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="order-2 md:order-1 relative group aspect-square h-full max-h-[500px]">
              <img 
                src="https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&q=80&w=800&h=800"
                alt="Brazo robótico industrial"
                className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-105 shadow-2xl border border-outline-variant/20"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-0 right-0 p-6 font-mono text-[8px] text-black/20 uppercase tracking-[0.4em] font-bold">NODE_B_SERIES_004.X</div>
            </div>
            
            <div className="order-1 md:order-2 flex flex-col justify-center h-full bg-surface-container-lowest/80 backdrop-blur-sm p-8 border border-outline-variant/10">
              <p className="text-[10px] font-black text-primary-container uppercase tracking-[0.3em] mb-3 font-sans">MÓDULO 03 // ROBÓTICA</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 font-headline leading-tight">
                ROBÓTICA INDUSTRIAL Y <br /> PALETIZADO
              </h2>
              <p className="text-secondary text-sm leading-relaxed mb-8 font-sans max-w-lg">
                Sistemas robóticos modulares de fin de línea que automatizan tareas complejas de paletizado con precisión de nivel micrón.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center border border-primary-container text-primary-container">
                    <Eye size={18} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-[11px] tracking-widest mb-1 font-headline">MONITOREO AVANZADO</h4>
                    <p className="text-secondary text-[10px] leading-relaxed font-sans max-w-sm">Matrices de visión multi-ángulo para zonificación de seguridad y detección de defectos de productos.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-primary-container text-on-primary-container">
                    <RefreshCcw size={18} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-[11px] tracking-widest mb-1 font-headline">AUTOMATIZACIÓN DE FIN DE LÍNEA</h4>
                    <p className="text-secondary text-[10px] leading-relaxed font-sans max-w-sm">Bucle de retroalimentación directa entre paletizadores y sistemas de gestión de almacenes.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-surface-container-low p-5 border border-outline-variant/30 text-center">
                  <p className="text-2xl font-black font-headline mb-0.5 text-on-surface">24/7</p>
                  <p className="text-[7px] font-black uppercase tracking-widest text-secondary/60 font-sans">TIEMPO DE ACTIVIDAD</p>
                </div>
                <div className="flex-1 bg-surface-container-low p-5 border border-outline-variant/30 text-center">
                  <p className="text-2xl font-black font-headline mb-0.5 text-on-surface">0.2mm</p>
                  <p className="text-[7px] font-black uppercase tracking-widest text-secondary/60 font-sans">REPLICABILIDAD</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
