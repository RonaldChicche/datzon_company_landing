import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().min(7),
  disponibilidad: z.string().min(2),
  mensaje: z.string().min(10),
  website: z.string().max(0).optional(), // honeypot
});

// In-memory rate limiting: max 5 requests per IP per hour
const rateMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || entry.reset < now) {
    rateMap.set(ip, { count: 1, reset: now + 3_600_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intente más tarde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 422 });
  }

  // Honeypot check
  if (result.data.website) {
    return NextResponse.json({ ok: true }); // silently discard bot submissions
  }

  const { nombre, email, telefono, disponibilidad, mensaje } = result.data;

  // TODO: Replace with Resend integration
  // import { Resend } from "resend";
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: "noreply@datzoncompany.com", to: process.env.CONTACT_EMAIL, ... });
  console.log("[contact-form]", { nombre, email, telefono, disponibilidad, mensaje });

  return NextResponse.json({ ok: true }, { status: 200 });
}
