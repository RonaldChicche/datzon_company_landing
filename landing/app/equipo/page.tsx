"use client";

import { motion } from "motion/react";

const teamMembers = [
  {
    name: "Dr. Aris Varma",
    role: "Arquitecto Jefe de Robótica",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    name: "Elena Rossi",
    role: "Jefa de Integración de Sistemas",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    name: "Marcus Chen",
    role: "Ingeniero Principal de Hardware",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    name: "Sofia Khalid",
    role: "Especialista en Edge Computing",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    name: "Liam O'Connor",
    role: "Oficial de Seguridad Industrial",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400",
  },
];

export default function TeamPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans">
      <main className="pb-24 px-12 max-w-screen-2xl mx-auto pt-24">
        {/* Header */}
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-8 font-headline leading-none">
              Las Mentes Detrás de la <br /> <span className="text-primary-container tracking-tighter italic">Precisión.</span>
            </h1>
            <p className="text-secondary text-lg leading-relaxed max-w-xl">
              Nuestro equipo multidisciplinario combina décadas de experiencia en robótica, infraestructura y seguridad ciber-física para entregar los sistemas de automatización más fiables del mundo.
            </p>
          </div>
        </header>

        {/* Team Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 pb-32">
          {teamMembers.map((member, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer relative"
            >
              {/* Card Container */}
              <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 transition-all duration-500 group-hover:border-primary-container/30 group-hover:shadow-[0_20px_50px_rgba(118,185,0,0.05)]">
                <div className="aspect-[4/5] bg-surface-container-low overflow-hidden mb-8 relative">
                  {/* Technical Overlays */}
                  <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[8px] font-black text-white bg-black/80 px-2 py-1 tracking-widest font-mono uppercase">NODO_{i+1}_ACTIVO</span>
                  </div>
                  
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-100 transition-all duration-1000 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Gradient & Border FX */}
                  <div className="absolute inset-0 bg-neutral-900/10 mix-blend-multiply transition-opacity group-hover:opacity-0"></div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute inset-0 border border-white/5 group-hover:border-primary-container/20 transition-colors"></div>
                </div>

                <div className="relative pl-2 border-l-2 border-outline-variant/30 group-hover:border-primary-container transition-colors">
                  <p className="text-[9px] font-black text-primary-container uppercase tracking-[0.3em] mb-2 font-headline">{member.role}</p>
                  <h3 className="text-3xl font-black uppercase tracking-tighter font-headline flex items-center justify-between">
                    {member.name}
                    <motion.div 
                      className="w-8 h-[1px] bg-primary-container scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500"
                    />
                  </h3>
                </div>
              </div>

              {/* Background Accent */}
              <div className="absolute -z-10 top-2 left-2 inset-0 border border-primary-container opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3"></div>
            </motion.div>
          ))}
        </section>

        {/* Recruitment CTA */}
        <section className="mt-40 border-t-2 border-outline-variant/30 py-24 flex flex-col items-center text-center">
          <div className="mb-8">
            <span className="bg-surface-container-high px-4 py-1 text-[10px] font-black uppercase tracking-widest text-secondary border border-outline-variant">Protocolos Abiertos</span>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 font-headline">Únete a la Vanguardia.</h2>
          <p className="text-secondary max-w-lg mb-12">
            Siempre estamos buscando ingenieros excepcionales apasionados por los sistemas de alta precisión. Revisa nuestras vacantes activas.
          </p>
          <button className="bg-inverse-surface text-inverse-on-surface px-12 py-4 font-black uppercase tracking-widest text-sm hover:bg-primary transition-colors font-headline">
            Ver Carreras
          </button>
        </section>
      </main>
    </div>
  );
}
