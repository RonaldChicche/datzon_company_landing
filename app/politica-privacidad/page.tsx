import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de Datzon. Conoce cómo protegemos tus datos personales conforme a la Ley 29733 de Perú.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-[10px] font-black text-primary-container uppercase tracking-[0.3em] mb-4 font-headline">
            PROTOCOLO · PRIVACIDAD
          </p>
          <h1 className="text-5xl font-black uppercase tracking-tighter font-headline mb-4">
            Política de Privacidad
          </h1>
          <p className="text-secondary text-sm font-sans">Última actualización: junio 2026</p>
        </div>

        <div className="space-y-10 font-sans text-sm leading-relaxed text-on-surface/80">
          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              1. Responsable del Tratamiento
            </h2>
            <p>
              <strong>DATZON S.A.C</strong> (en adelante, "Datzon") es el responsable del tratamiento de los datos personales
              que usted nos facilite a través de este sitio web (<em>datzoncompany.com</em>) o por cualquier otro medio de contacto.
            </p>
            <p className="mt-2">
              Correo de contacto: <a href="mailto:contacto@datzoncompany.com" className="text-primary-container hover:underline">contacto@datzoncompany.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              2. Marco Legal Aplicable
            </h2>
            <p>
              El tratamiento de sus datos personales se rige por la <strong>Ley N.° 29733, Ley de Protección de Datos Personales</strong>{" "}
              de la República del Perú y su Reglamento aprobado por Decreto Supremo N.° 003-2013-JUS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              3. Datos que Recopilamos
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Disponibilidad horaria</li>
              <li>Mensaje de consulta</li>
              <li>Datos de navegación (páginas visitadas, tiempo de sesión) mediante analytics anónimos</li>
            </ul>
            <p className="mt-3">
              No recopilamos datos sensibles ni datos de menores de 18 años. No usamos cookies de rastreo ni publicidad comportamental.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              4. Finalidad del Tratamiento
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Atender consultas comerciales y técnicas enviadas a través del formulario de contacto.</li>
              <li>Enviar información relacionada con nuestros servicios de ingeniería e automatización, previa solicitud.</li>
              <li>Mejorar la experiencia del sitio web mediante métricas de rendimiento agregadas y anónimas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              5. Derechos ARCO
            </h2>
            <p>
              Conforme a la Ley 29733, usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse</strong> (derechos ARCO)
              al tratamiento de sus datos personales. Para ejercer estos derechos, envíe un correo a{" "}
              <a href="mailto:contacto@datzoncompany.com" className="text-primary-container hover:underline">
                contacto@datzoncompany.com
              </a>{" "}
              indicando su nombre completo, el derecho que desea ejercer y adjuntando copia de su documento de identidad.
            </p>
            <p className="mt-2">
              Atenderemos su solicitud en un plazo máximo de <strong>20 días hábiles</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              6. Conservación de Datos
            </h2>
            <p>
              Los datos personales se conservarán únicamente durante el tiempo necesario para atender la finalidad para la que fueron
              recopilados, o hasta que usted solicite su cancelación.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              7. Terceros y Transferencias
            </h2>
            <p>
              Datzon no vende, alquila ni cede datos personales a terceros con fines comerciales. Podemos compartir datos con
              proveedores de servicios tecnológicos (alojamiento, envío de correos) bajo acuerdos de confidencialidad y solo en la
              medida necesaria para prestar el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              8. Seguridad
            </h2>
            <p>
              Aplicamos medidas técnicas y organizativas razonables para proteger sus datos frente a accesos no autorizados, pérdida
              o alteración, incluyendo transmisión cifrada (HTTPS/TLS) y controles de acceso internos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              9. Cambios a esta Política
            </h2>
            <p>
              Nos reservamos el derecho de actualizar esta política. Cualquier cambio relevante será publicado en esta misma página con
              la fecha de actualización correspondiente.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-outline-variant/20">
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-widest text-primary-container hover:underline font-headline"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
