"use client";

import { motion } from "motion/react";
import { ArrowRight, Share, Network } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="">
        {/* Hero Section */}
        <section className="relative h-[921px] flex items-center justify-center overflow-hidden bg-neutral-900">
          <div className="absolute inset-0 z-0">
            <img
              alt="Sala de servidores ultra-moderna de alta tecnología"
              className="w-full h-full object-cover grayscale opacity-60 mix-blend-luminosity contrast-125"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVaagrJTqfithWWrWKfPFaKj424X8sjko9DABhpPYDGhaGPCpMlmzZheDu0KiucB2TU67r6CIQZz1EBj0Z-Tm7XqB_F8QuhyCvwOX9_hVa68sAMMn_m4OoGPoO7OFy9BdTSmfSpgjNoH0GMbfJSk9-FaUfvIqqRnJR2T-kSMaujCJ9rv4L7vVQ_iSg5jfMQHzN6psuFfJNuRbVnta01Kb8HgdjVil06Fbhe6AIT0WT35QuzNMd30N7DZ210C2MGmyV3nh9ryYbQS2s"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-black/40 to-black/80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(118,185,0,0.05)_0%,transparent_70%)] pointer-events-none"></div>
          </div>
          <div className="relative z-10 text-center max-w-6xl px-6">
            <div className="inline-block bg-primary-container px-4 py-1 mb-6">
              <span className="font-sans font-bold uppercase text-xs tracking-widest text-on-primary-container">KINETIC BLUEPRINT V.2.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none mb-8 font-headline">
              REVOLUCIONANDO <br />
              <span className="text-primary-container">EL FUTURO</span> <br />
               DE LAS INDUSTRIAS
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto font-sans text-lg mb-10 leading-relaxed">
              Claridad sin concesiones en la automatización industrial. Arquitectando sistemas de ingeniería de alto rendimiento que redefinen la precisión y la fiabilidad.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                href="/solutions"
                className="bg-primary-container text-on-primary-container font-black px-10 py-5 text-lg uppercase tracking-tight hover:brightness-110 transition-all font-headline"
              >
                Explorar Infraestructura
              </Link>
              <button className="border border-white/30 text-white font-black px-10 py-5 text-lg uppercase tracking-tight backdrop-blur-md hover:bg-white hover:text-black transition-all font-headline">
                Especificaciones Técnicas
              </button>
            </div>
          </div>
        </section>

        {/* Industrial Partners Marquee */}
        <section className="bg-surface-container-low py-12 overflow-hidden border-y border-outline-variant/10">
          <div className="flex items-center space-x-16 animate-marquee whitespace-nowrap px-6 opacity-40 grayscale">
            <span className="text-2xl font-black tracking-tighter">HYPERION STEEL</span>
            <span className="text-2xl font-black tracking-tighter">VERTEX LOGISTICS</span>
            <span className="text-2xl font-black tracking-tighter">NEXUS ENERGY</span>
            <span className="text-2xl font-black tracking-tighter">CORE ROBOTICS</span>
            <span className="text-2xl font-black tracking-tighter">TITAN HEAVY</span>
            <span className="text-2xl font-black tracking-tighter">OMEGA FAB</span>
            <span className="text-2xl font-black tracking-tighter">HYPERION STEEL</span>
            <span className="text-2xl font-black tracking-tighter">VERTEX LOGISTICS</span>
            <span className="text-2xl font-black tracking-tighter">NEXUS ENERGY</span>
            <span className="text-2xl font-black tracking-tighter">CORE ROBOTICS</span>
            <span className="text-2xl font-black tracking-tighter">TITAN HEAVY</span>
            <span className="text-2xl font-black tracking-tighter">OMEGA FAB</span>
          </div>
        </section>

        {/* Solutions Bento Grid */}
        <section className="py-32 px-12 max-w-screen-2xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl font-black uppercase tracking-tight mb-4 font-headline">Soluciones de Precisión</h2>
            <div className="h-1 w-24 bg-primary-container"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-surface-container-lowest p-12 relative overflow-hidden group">
              <div className="relative z-10">
                <span className="text-sm font-bold text-primary mb-4 block tracking-widest font-sans uppercase">01 / AUTONOMÍA</span>
                <h3 className="text-4xl font-black uppercase mb-6 max-w-md font-headline">Ecosistemas de Fábrica Autónomos</h3>
                <p className="text-secondary max-w-lg mb-8 font-sans">Desplegando clusters de IA y edge-computing para gestionar ciclos de fabricación complejos con cero intervención humana.</p>
                <button className="flex items-center gap-2 font-black uppercase text-sm tracking-widest group-hover:text-primary transition-colors font-headline">
                  Ver Plan Maestro <ArrowRight size={16} />
                </button>
              </div>
              <img
                alt="Vista detallada desde arriba de circuitería de placa base compleja"
                className="absolute top-0 right-0 h-full w-1/2 object-cover opacity-10 group-hover:opacity-20 transition-opacity"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF3OKuXu5P4Lr80oBbyOTqc-l_cX9gsb9DFwGKmWuopCiUGd8rEC1X54rxrKty5YfutC8bKHCbNz2qErt6DA206Rhz29WLTV8jr1klfwK-o29sWOAJMJgxEnRxHqE3VqwIPycg38Dzk59gBCZZ59dnlTBz1x5wxKNguU84rixlfcplWEU--R7R-WKuwNOE3eckDLC0CIeF-nrMlhjoVxMzx9HS-qwuUdM7tCFKcSuPMfA1iYgimCiy1ZrCblwmaCDWZx0CEOFFvnZS"
                referrerPolicy="no-referrer"
            />
            </div>
            <div className="md:col-span-4 bg-inverse-surface text-white p-12 flex flex-col justify-between">
              <div>
                <span className="text-sm font-bold text-primary-container mb-4 block tracking-widest font-sans uppercase">02 / LOGÍSTICA</span>
                <h3 className="text-3xl font-black uppercase mb-4 font-headline">Cadena de Suministro Predictiva</h3>
              </div>
              <Share className="text-6xl text-primary-container w-12 h-12" />
            </div>
            <div className="md:col-span-4 bg-surface-container-low p-12 border-t-4 border-primary-container">
              <span className="text-sm font-bold text-secondary mb-4 block tracking-widest font-sans uppercase">03 / MONITOREO</span>
              <h3 className="text-2xl font-black uppercase mb-4 font-headline">Telemetría en Tiempo Real</h3>
              <p className="text-sm text-secondary font-sans">Cada milisegundo cuenta. Acceso 24/7 a lecturas técnicas de cada nodo activo.</p>
            </div>
            <div className="md:col-span-8 h-80 bg-neutral-200 relative overflow-hidden">
              <img
                alt="Brazo de robot industrial soldador"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwOlTVaJ0PwDSaauH1DFTdQyhTeDFXiqmmZgXtnnxzwFsald-j5Z7EzjGzmlFnlk8fANqpXxmUwwfchocUkc7nhoQn8Z0X_UBI49DidHBc8iwx9D7ZjGXd3uSy_4FzJT3Hpj5seG6RYtlg-zmhBct0xpK_J_AAct52J_DVXasguQkikyYFMgXI2kPTI4gvajX3ad-KJbJSehGUF7xmQ6SbPhAcek2DKml8tyXRt9Oe4TnfbY7YMTDXxo52kw0-Jcr2VsB4ZWEFFeNv"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary-container/20 mix-blend-overlay"></div>
              <div className="absolute bottom-8 left-8 bg-surface-container-lowest/90 backdrop-blur-md p-6 border border-white/20 max-w-xs">
                <p className="text-xs font-black uppercase tracking-widest mb-1 font-sans">Sitio Activo: Nodo-04</p>
                <p className="text-xl font-black font-headline">99.98% de Precisión en Rendimiento</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tecnologías Section */}
        <section className="py-24 bg-surface border-t border-outline-variant/10 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-12 mb-16 text-center">
            <h2 className="text-4xl font-black uppercase tracking-tight text-secondary font-headline">Tecnologías</h2>
            <div className="h-1 w-12 bg-primary-container mx-auto mt-4"></div>
          </div>
          <div className="relative flex items-center overflow-hidden">
            <div className="flex space-x-24 items-center animate-marquee whitespace-nowrap px-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-4">
                <Network size={48} />
                <span className="text-xl font-bold tracking-widest uppercase font-headline">Edge Computing</span>
              </div>
              <div className="flex items-center gap-4">
                <Network size={48} />
                <span className="text-xl font-bold tracking-widest uppercase font-headline">Robótica Neuronal</span>
              </div>
              <div className="flex items-center gap-4">
                <Network size={48} />
                <span className="text-xl font-bold tracking-widest uppercase font-headline">Protocolos Mesh</span>
              </div>
              <div className="flex items-center gap-4">
                <Network size={48} />
                <span className="text-xl font-bold tracking-widest uppercase font-headline">Ciber-Físico</span>
              </div>
              <div className="flex items-center gap-4">
                <Network size={48} />
                <span className="text-xl font-bold tracking-widest uppercase font-headline">Big Data en Tiempo Real</span>
              </div>
              <div className="flex items-center gap-4">
                <Network size={48} />
                <span className="text-xl font-bold tracking-widest uppercase font-headline">Logística Cuántica</span>
              </div>
              {/* Duplicate */}
              <div className="flex items-center gap-4">
                <Network size={48} />
                <span className="text-xl font-bold tracking-widest uppercase font-headline">Edge Computing</span>
              </div>
              <div className="flex items-center gap-4">
                <Network size={48} />
                <span className="text-xl font-bold tracking-widest uppercase font-headline">Robótica Neuronal</span>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specs / Data Section */}
        <section className="bg-inverse-surface py-32">
          <div className="px-12 max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-12 font-headline">
                Diseñado para la <br /> <span className="text-primary-container">Escalabilidad</span>
              </h2>
              <div className="space-y-12">
                <div className="flex gap-8">
                  <span className="text-primary-container font-mono text-4xl font-bold">01</span>
                  <div>
                    <h4 className="text-white font-black uppercase text-xl mb-2 font-headline">Malla de Cero Latencia</h4>
                    <p className="text-white/50 text-sm leading-relaxed font-sans">Protocolos de hardware interconectados que se comunican a velocidades que superan las infraestructuras de red tradicionales.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <span className="text-primary-container font-mono text-4xl font-bold">02</span>
                  <div>
                    <h4 className="text-white font-black uppercase text-xl mb-2 font-headline">Seguridad de Capa Reforzada</h4>
                    <p className="text-white/50 text-sm leading-relaxed font-sans">Capas de cifrado de grado industrial diseñadas para proteger activos críticos de amenazas ambientales y digitales.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative bg-surface/5 aspect-square border border-white/10 p-12">
              <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xl"></div>
              <div className="relative h-full border border-primary-container/30 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-primary-container uppercase tracking-[0.3em] mb-2 font-sans font-bold">Diagnóstico del Sistema</p>
                    <p className="text-white font-mono text-2xl">ESTADO: NOMINAL</p>
                  </div>
                  <Share className="text-primary-container animate-pulse" size={24} />
                </div>
                <div className="space-y-4">
                  <div className="h-1 bg-white/10 w-full overflow-hidden">
                    <div className="h-full bg-primary-container w-3/4"></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-white/40">
                    <span>CONSUMO: 450kW</span>
                    <span>CARGA: 76%</span>
                  </div>
                </div>
                <img
                  alt="Vista macro de hardware de semiconductores"
                  className="w-full h-48 object-cover opacity-50 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdB8mcleoZ2BSk2Xv36bmdY9G4c-58F66HKAzeceshZd73nrTHVB65g4ZpcmcCfPZiXKiO0r-4sNP1-BffIqkNRc5GU-Na93kvfsAzz7urAcorzXTqU45n5sWUhbvseTd6SHOwaFyicYV07ynVpKC1YUexmPULeKdPvRvhgriLCha4WB8miKeqAVb2Blw3X3_Vw2fufBsQZNUvyeXLgTgSULjF5I_BGmuvlOi8P0kvi-K8Clw6-nF0rnWw4t4B3ITBUaKKTk5gCh90"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-48 px-12 text-center bg-surface">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-12 font-headline">Construye el Futuro.</h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto mb-16 leading-relaxed font-sans">
            Contacta a nuestro equipo de ingeniería para integrar los sistemas Datzon en tu infraestructura industrial existente.
          </p>
          <button className="bg-black text-white hover:bg-primary-container hover:text-black transition-all duration-300 font-black px-16 py-8 text-xl uppercase tracking-widest font-headline">
            Iniciar Protocolo
          </button>
        </section>
      </main>
    </div>
  );
}
