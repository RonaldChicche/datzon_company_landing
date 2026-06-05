"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, User, Mail, MessageSquare, Phone, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const contactSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(7, "Teléfono requerido"),
  disponibilidad: z.string().min(2, "Disponibilidad requerida"),
  mensaje: z.string().min(10, "Mensaje demasiado corto"),
  website: z.string().max(0).optional(), // honeypot
});

type ContactFormData = z.infer<typeof contactSchema>;

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
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  useEffect(() => {
    if (isOpen) {
      firstFocusRef.current?.focus();
      setStatus("idle");
    } else {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: ContactFormData) => {
    if (data.website) return; // honeypot triggered
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
                  <p className="text-[10px] font-black text-primary-container uppercase tracking-[0.3em] mb-1 font-headline">PROTOCOLO // CONTACTO</p>
                  <h2 id="contact-modal-title" className="text-2xl font-black uppercase tracking-tighter text-white font-headline">PORTAL DE CONSULTAS</h2>
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
                  <p className="text-primary-container font-black uppercase text-xl mb-4 font-headline">TRANSMISIÓN RECIBIDA</p>
                  <p className="text-white/70 text-sm mb-8">Nos pondremos en contacto contigo en breve.</p>
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
                      <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                        NOMBRE COMPLETO_
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                        <input {...register("nombre")} type="text" placeholder="IDENTIFICAR REMITENTE" className={inputClass} />
                      </div>
                      {errors.nombre && <p className="text-red-400 text-[10px] mt-1">{errors.nombre.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="group">
                        <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                          DIRECCIÓN DE RETORNO_
                        </label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                          <input {...register("email")} type="email" placeholder="CORREO@DOMINIO.COM" className={inputClass} />
                        </div>
                        {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
                      </div>

                      {/* Phone */}
                      <div className="group">
                        <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                          TELÉFONO_
                        </label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                          <input {...register("telefono")} type="tel" placeholder="+00 (000) 000-0000" className={inputClass} />
                        </div>
                        {errors.telefono && <p className="text-red-400 text-[10px] mt-1">{errors.telefono.message}</p>}
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="group">
                      <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                        VENTANA DE DISPONIBILIDAD_
                      </label>
                      <div className="relative">
                        <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                        <input {...register("disponibilidad")} type="text" placeholder="EJ. LUN-VIE 09:00 - 18:00" className={inputClass} />
                      </div>
                      {errors.disponibilidad && <p className="text-red-400 text-[10px] mt-1">{errors.disponibilidad.message}</p>}
                    </div>

                    {/* Message */}
                    <div className="group">
                      <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                        DESCRIPCIÓN DE LA CONSULTA_
                      </label>
                      <div className="relative">
                        <MessageSquare size={14} className="absolute left-4 top-5 text-white/50" />
                        <textarea
                          {...register("mensaje")}
                          rows={4}
                          placeholder="DEFINE TUS REQUERIMIENTOS O PROPUESTA..."
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
                    {status === "loading" ? "TRANSMITIENDO..." : "TRANSMITIR SOLICITUD"}
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
