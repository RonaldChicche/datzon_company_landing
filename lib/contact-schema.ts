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
  nombre: z
    .string()
    .min(2, "Nombre requerido (mín. 2 caracteres)")
    .max(120, "Nombre demasiado largo (máx. 120 caracteres)"),
  email: z.email("Correo electrónico inválido"),
  mensaje: z
    .string()
    .min(10, "Describe brevemente tu necesidad (mín. 10 caracteres)")
    .max(5000, "Mensaje demasiado largo (máx. 5000 caracteres)"),
  empresa: z.string().max(160, "Empresa demasiado larga (máx. 160 caracteres)").optional(),
  telefono: z.string().max(40, "Teléfono demasiado largo (máx. 40 caracteres)").optional(),
  industria: z.string().max(60, "Industria demasiado larga (máx. 60 caracteres)").optional(),
  // Honeypot: invisible para humanos. Sin max() a propósito — si un bot lo
  // rellena debe PASAR la validación para llegar al descarte silencioso del
  // servidor (con un max, un bot que llene el campo con basura larga recibía
  // 422 y el honeypot era código muerto). El tamaño del body ya lo acota
  // Vercel (~4.5 MB); los demás campos sí llevan tope explícito.
  website: z.string().optional(),
});

export const contactPayloadSchema = contactFieldsSchema.extend({
  source: z.enum(["home", "modal"]),
});

export type ContactFields = z.infer<typeof contactFieldsSchema>;
export type ContactPayload = z.infer<typeof contactPayloadSchema>;
