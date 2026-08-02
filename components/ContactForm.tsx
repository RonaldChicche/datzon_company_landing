"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFieldsSchema, type ContactFields, INDUSTRIES } from "@/lib/contact-schema";

const ERR = { color: "#c0452f", fontSize: "11.5px", marginTop: "5px", display: "block", fontFamily: "var(--font-mono)", letterSpacing: ".03em" } as const;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFields>({ resolver: zodResolver(contactFieldsSchema) });

  const onSubmit = async (data: ContactFields) => {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "home" }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setServerError(body.error ?? "Error al enviar. Intenta de nuevo.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Error de red. Intenta de nuevo.");
    }
  };

  if (submitted) {
    return (
      <div className="form form-success">
        <div className="ico">✓</div>
        <h3>¡Solicitud enviada!</h3>
        <p>Te contactamos en máximo 1 día hábil.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* honeypot, invisible, should remain empty */}
      <input
        {...register("website")}
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: "none" }}
      />

      <div className="grid2">
        <div className="field">
          <label htmlFor="f-nombre">Nombre *</label>
          <input
            id="f-nombre"
            type="text"
            placeholder="Tu nombre"
            aria-invalid={!!errors.nombre}
            {...register("nombre")}
          />
          {errors.nombre && <span style={ERR}>{errors.nombre.message}</span>}
        </div>
        <div className="field">
          <label htmlFor="f-empresa">Empresa</label>
          <input
            id="f-empresa"
            type="text"
            placeholder="Tu empresa"
            {...register("empresa")}
          />
        </div>
      </div>

      <div className="grid2">
        <div className="field">
          <label htmlFor="f-email">Correo *</label>
          <input
            id="f-email"
            type="email"
            placeholder="nombre@empresa.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <span style={ERR}>{errors.email.message}</span>}
        </div>
        <div className="field">
          <label htmlFor="f-telefono">Teléfono</label>
          <input
            id="f-telefono"
            type="tel"
            placeholder="+51 ..."
            {...register("telefono")}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="f-industria">Industria</label>
        <select id="f-industria" {...register("industria")}>
          <option value="">Selecciona una industria</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-mensaje">¿Qué necesitas automatizar? *</label>
        <textarea
          id="f-mensaje"
          placeholder="Describe brevemente el proceso, la línea o el dato que buscas..."
          aria-invalid={!!errors.mensaje}
          {...register("mensaje")}
        />
        {errors.mensaje && <span style={ERR}>{errors.mensaje.message}</span>}
      </div>

      {serverError && (
        <p style={{ ...ERR, marginBottom: "12px" }}>{serverError}</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Enviando…" : <>Enviar solicitud <span className="arr">→</span></>}
      </button>
    </form>
  );
}
