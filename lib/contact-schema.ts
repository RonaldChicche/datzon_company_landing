import { z } from "zod";

/**
 * Contrato canónico del formulario de contacto. Única definición: la
 * importan ContactForm, ContactModal y el Route Handler. Antes estaba
 * triplicado y divergió (el modal enviaba `disponibilidad`, que el
 * servidor descartaba en silencio).
 */

export const INDUSTRIES = [
  "Minería",
  "Energía & utilities",
  "Manufactura",
  "Alimentos & bebidas",
  "Logística & retail",
  "Agroindustria",
  "Otra",
] as const;

export const contactFieldsSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido (mín. 2 caracteres)"),
  email: z.email("Correo electrónico inválido"),
  mensaje: z.string().min(10, "Describe brevemente tu necesidad (mín. 10 caracteres)"),
  empresa: z.string().optional(),
  telefono: z.string().optional(),
  industria: z.string().optional(),
  // Honeypot: invisible para humanos. Sin max(0) a propósito — si un bot lo
  // rellena debe PASAR la validación para llegar al descarte silencioso del
  // servidor (con max(0) el bot recibía 422 y el honeypot era código muerto).
  website: z.string().optional(),
});

export const contactPayloadSchema = contactFieldsSchema.extend({
  source: z.enum(["home", "modal"]),
});

export type ContactFields = z.infer<typeof contactFieldsSchema>;
export type ContactPayload = z.infer<typeof contactPayloadSchema>;
