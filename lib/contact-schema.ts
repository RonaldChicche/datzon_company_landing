import { z } from "zod";

/**
 * Contrato canónico del formulario de contacto. Única definición: la
 * importan ContactForm, ContactModal y el Route Handler. Antes estaba
 * triplicado y divergió (el modal enviaba `disponibilidad`, que el
 * servidor descartaba en silencio).
 */

// Los topes de este archivo y este catálogo también los impone la base
// (CHECK en landing.leads). Si cambian aquí, hace falta una migración.
export const INDUSTRIES = [
  "Minería",
  "Energía & utilities",
  "Manufactura",
  "Alimentos & bebidas",
  "Logística & retail",
  "Agroindustria",
  "Otra",
] as const;

/**
 * Campo de una sola línea. Rechaza:
 * - \p{Cc} (CR, LF, tab, NUL...): nombre y empresa terminan en el asunto del
 *   email, que es una cabecera; un CR/LF ahí permitiría colar cabeceras
 *   nuevas como "Bcc:".
 * - \p{Cf}, \p{Zl}, \p{Zp} (U+202E, U+200B, U+2028, U+2029, BOM...): no
 *   inyectan cabeceras, pero invierten u ocultan texto o parten la línea en
 *   algunos clientes de correo, y falsean lo que el operador lee.
 * El mensaje NO usa esto: va al cuerpo y los saltos de línea son legítimos.
 */
const SIN_CONTROL = /^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]*$/u;
const unaLinea = () => z.string().regex(SIN_CONTROL, "Usa una sola línea, sin saltos de línea");

export const contactFieldsSchema = z.object({
  nombre: unaLinea()
    .min(2, "Nombre requerido (mín. 2 caracteres)")
    .max(120, "Nombre demasiado largo (máx. 120 caracteres)"),
  email: z.email("Correo electrónico inválido"),
  mensaje: z
    .string()
    .min(10, "Describe brevemente tu necesidad (mín. 10 caracteres)")
    .max(5000, "Mensaje demasiado largo (máx. 5000 caracteres)"),
  empresa: unaLinea().max(160, "Empresa demasiado larga (máx. 160 caracteres)").optional(),
  telefono: unaLinea().max(40, "Teléfono demasiado largo (máx. 40 caracteres)").optional(),
  // Solo el catálogo del desplegable. "" es la opción "Selecciona" (sin elegir).
  industria: z.union([z.enum(INDUSTRIES), z.literal("")]).optional(),
  // Honeypot: invisible para humanos. Sin max() a propósito, si un bot lo
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
