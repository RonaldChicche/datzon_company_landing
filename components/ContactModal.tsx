"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, User, Mail, MessageSquare, Phone, Building2, Factory } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { contactFieldsSchema, type ContactFields, INDUSTRIES } from "@/lib/contact-schema";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFields>({ resolver: zodResolver(contactFieldsSchema) });

  useEffect(() => {
    if (isOpen) {
      firstFocusRef.current?.focus();
      setStatus("idle");
    } else {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: ContactFields) => {
    if (data.website) return; // honeypot triggered
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "modal" }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-black/60 border border-white/10 p-4 pl-10 text-base font-mono uppercase tracking-tight text-white placeholder:text-white/30 focus:outline-none focus:border-primary-container/50 transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[201] p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-neutral-900 border border-white/20 w-full max-w-lg pointer-events-auto shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-20 border-b border-white/10 p-6 flex justify-between items-center bg-black/80 backdrop-blur-md">
                <div>
                  <p className="text-[10px] font-black text-primary-container uppercase tracking-[0.3em] mb-1 font-headline">Contacto</p>
                  <h2 id="contact-modal-title" className="text-2xl font-black uppercase tracking-tighter text-white font-headline">Cuéntanos tu proyecto</h2>
                </div>
                <button
                  ref={firstFocusRef}
                  onClick={onClose}
                  aria-label="Cerrar modal de contacto"
                  className="w-12 h-12 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 group"
                >
                  <X size={20} className="text-white/60 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Form Content */}
              {status === "success" ? (
                <div className="p-8 text-center">
                  <p className="text-primary-container font-black uppercase text-xl mb-4 font-headline">¡Solicitud enviada!</p>
                  <p className="text-white/70 text-sm mb-8">Te contactamos en máximo 1 día hábil.</p>
                  <button
                    onClick={onClose}
                    className="bg-primary-container text-on-primary-container py-4 px-8 font-black uppercase text-xs tracking-widest hover:brightness-110 font-headline"
                  >
                    CERRAR
                  </button>
                </div>
              ) : (
                <form className="relative z-10 p-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Honeypot - hidden from humans */}
                  <input type="text" {...register("website")} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="group">
                      <label
                        htmlFor="cm-nombre"
                        className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors"
                      >
                        NOMBRE COMPLETO_
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                        <input id="cm-nombre" {...register("nombre")} type="text" placeholder="Tu nombre" className={inputClass} />
                      </div>
                      {errors.nombre && <p className="text-red-400 text-[10px] mt-1">{errors.nombre.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="group">
                        <label
                          htmlFor="cm-email"
                          className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors"
                        >
                          CORREO_
                        </label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                          <input id="cm-email" {...register("email")} type="email" placeholder="tu@empresa.com" className={inputClass} />
                        </div>
                        {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
                      </div>

                      {/* Phone */}
                      <div className="group">
                        <label
                          htmlFor="cm-telefono"
                          className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors"
                        >
                          TELÉFONO_
                        </label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                          <input id="cm-telefono" {...register("telefono")} type="tel" placeholder="+51 ..." className={inputClass} />
                        </div>
                        {errors.telefono && <p className="text-red-400 text-[10px] mt-1">{errors.telefono.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Empresa (opcional) */}
                      <div className="group">
                        <label
                          htmlFor="cm-empresa"
                          className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors"
                        >
                          EMPRESA_
                        </label>
                        <div className="relative">
                          <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                          <input
                            id="cm-empresa"
                            {...register("empresa")}
                            type="text"
                            placeholder="Tu empresa"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {/* Industria (opcional) */}
                      <div className="group">
                        <label
                          htmlFor="cm-industria"
                          className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors"
                        >
                          INDUSTRIA_
                        </label>
                        <div className="relative">
                          <Factory size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                          <select
                            id="cm-industria"
                            {...register("industria")}
                            className={`${inputClass} appearance-none cursor-pointer`}
                            defaultValue=""
                          >
                            <option value="">Selecciona</option>
                            {INDUSTRIES.map((ind) => (
                              <option key={ind} value={ind}>
                                {ind.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="group">
                      <label
                        htmlFor="cm-mensaje"
                        className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors"
                      >
                        TU PROYECTO_
                      </label>
                      <div className="relative">
                        <MessageSquare size={14} className="absolute left-4 top-5 text-white/50" />
                        <textarea
                          id="cm-mensaje"
                          {...register("mensaje")}
                          rows={4}
                          placeholder="Describe brevemente el proceso o la línea que quieres automatizar"
                          className="w-full bg-black/60 border border-white/10 p-4 pl-10 text-base font-mono uppercase tracking-tight text-white placeholder:text-white/30 focus:outline-none focus:border-primary-container/50 transition-all resize-none"
                        />
                      </div>
                      {errors.mensaje && <p className="text-red-400 text-[10px] mt-1">{errors.mensaje.message}</p>}
                    </div>
                  </div>

                  {status === "error" && (
                    <p className="text-red-400 text-[10px] text-center">
                      Error al enviar. Por favor escríbenos directamente a contacto@datzoncompany.com
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-primary-container text-on-primary-container py-5 font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-headline disabled:opacity-70 min-h-[48px]"
                  >
                    <Send size={16} />
                    {status === "loading" ? "Enviando…" : "Enviar solicitud"}
                  </button>

                  <p className="text-[10px] text-center text-white/30 font-mono mt-2">
                    Al enviar aceptas nuestra{" "}
                    <Link href="/politica-privacidad" className="text-primary-container hover:underline" target="_blank">
                      Política de Privacidad
                    </Link>
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
