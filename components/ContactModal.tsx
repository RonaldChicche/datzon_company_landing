"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Send, User, Mail, MessageSquare, Phone, Clock } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
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
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white font-headline">PORTAL DE CONSULTAS</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 group"
                >
                  <X size={20} className="text-white/60 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Form Content */}
              <form className="relative z-10 p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="group">
                    <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                      NOMBRE COMPLETO_
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-primary-container transition-colors" />
                      <input 
                        required
                        type="text" 
                        placeholder="IDENTIFICAR REMITENTE"
                        className="w-full bg-black/60 border border-white/10 p-4 pl-10 text-xs font-mono uppercase tracking-tight text-white placeholder:text-white/30 focus:outline-none focus:border-primary-container/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mail Field */}
                    <div className="group">
                      <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                        DIRECCIÓN DE RETORNO_
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-primary-container transition-colors" />
                        <input 
                          required
                          type="email" 
                          placeholder="DIRECCION_PROTOCOLO@DOMINIO.SYS"
                          className="w-full bg-black/60 border border-white/10 p-4 pl-10 text-xs font-mono uppercase tracking-tight text-white placeholder:text-white/30 focus:outline-none focus:border-primary-container/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div className="group">
                      <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                        TELÉFONO_
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-primary-container transition-colors" />
                        <input 
                          required
                          type="tel" 
                          placeholder="+00 (000) 000-0000"
                          className="w-full bg-black/60 border border-white/10 p-4 pl-10 text-xs font-mono uppercase tracking-tight text-white placeholder:text-white/30 focus:outline-none focus:border-primary-container/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Availability Field */}
                  <div className="group">
                    <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                      VENTANA DE DISPONIBILIDAD_
                    </label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-primary-container transition-colors" />
                      <input 
                        required
                        type="text" 
                        placeholder="EJ. LUN-VIE 09:00 - 18:00 EST"
                        className="w-full bg-black/60 border border-white/10 p-4 pl-10 text-xs font-mono uppercase tracking-tight text-white placeholder:text-white/30 focus:outline-none focus:border-primary-container/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="group">
                    <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 font-headline group-focus-within:text-primary-container transition-colors">
                      DESCRIPCIÓN DE LA CONSULTA_
                    </label>
                    <div className="relative">
                      <MessageSquare size={14} className="absolute left-4 top-5 text-white/50 group-focus-within:text-primary-container transition-colors" />
                      <textarea 
                        required
                        rows={4}
                        placeholder="DEFINE TUS REQUERIMIENTOS O PROPUESTA..."
                        className="w-full bg-black/60 border border-white/10 p-4 pl-10 text-xs font-mono uppercase tracking-tight text-white placeholder:text-white/30 focus:outline-none focus:border-primary-container/50 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary-container text-on-primary-container py-5 font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-headline"
                >
                  <Send size={16} /> 
                  TRANSMITIR SOLICITUD
                </button>

                <p className="text-[8px] text-center text-white/20 font-mono uppercase tracking-widest mt-6">
                  TRANSMISIÓN SEGURA PUNTO A PUNTO ACTIVADA // DATZON CO-V4.2
                </p>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
