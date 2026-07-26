import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description: "Términos y condiciones de uso del sitio web de Datzon.",
};

export default function TermsOfUsePage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-[10px] font-black text-primary-container uppercase tracking-[0.3em] mb-4 font-headline">
            PROTOCOLO · TÉRMINOS
          </p>
          <h1 className="text-5xl font-black uppercase tracking-tighter font-headline mb-4">
            Términos de Uso
          </h1>
          <p className="text-secondary text-sm font-sans">Última actualización: junio 2026</p>
        </div>

        <div className="space-y-10 font-sans text-sm leading-relaxed text-on-surface/80">
          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar el sitio web <em>datzoncompany.com</em> (el "Sitio"), usted acepta quedar vinculado por estos
              Términos de Uso. Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice el Sitio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              2. Propiedad Intelectual
            </h2>
            <p>
              Todo el contenido del Sitio —incluyendo textos, gráficos, logotipos, íconos, imágenes, código fuente y diseño— es
              propiedad exclusiva de <strong>DATZON S.A.C</strong> y está protegido por las leyes de propiedad intelectual
              aplicables. Queda prohibida su reproducción total o parcial sin autorización expresa y por escrito de Datzon.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              3. Uso Permitido
            </h2>
            <p>Usted puede utilizar el Sitio únicamente para:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Consultar información sobre los servicios de Datzon.</li>
              <li>Ponerse en contacto con nuestro equipo comercial o técnico.</li>
              <li>Descargar materiales expresamente habilitados para descarga pública.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              4. Uso Prohibido
            </h2>
            <p>Queda expresamente prohibido:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Utilizar el Sitio para fines ilegales o no autorizados.</li>
              <li>Intentar acceder sin autorización a sistemas o redes de Datzon.</li>
              <li>Transmitir contenido malicioso, spam o virus.</li>
              <li>Reproducir, copiar o distribuir cualquier parte del Sitio con fines comerciales sin autorización.</li>
              <li>Realizar ingeniería inversa o scraping automatizado del contenido del Sitio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              5. Limitación de Responsabilidad
            </h2>
            <p>
              Datzon no garantiza la disponibilidad continua del Sitio ni la exactitud absoluta de la información publicada. En ningún
              caso seremos responsables de daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad
              de uso del Sitio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              6. Enlaces a Terceros
            </h2>
            <p>
              El Sitio puede contener enlaces a sitios web de terceros. Datzon no controla ni es responsable del contenido o las
              prácticas de privacidad de dichos sitios. Le recomendamos revisar los términos y políticas de cada sitio que visite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              7. Modificaciones
            </h2>
            <p>
              Datzon se reserva el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigor
              desde su publicación en el Sitio. El uso continuado del Sitio tras la publicación de cambios constituye la aceptación
              de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              8. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Estos Términos se rigen por las leyes de la República del Perú. Cualquier controversia derivada de su interpretación o
              cumplimiento se someterá a los juzgados y tribunales competentes de la ciudad de Lima, Perú.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-tight font-headline text-on-surface mb-3">
              9. Contacto
            </h2>
            <p>
              Para consultas relacionadas con estos Términos, escríbanos a{" "}
              <a href="mailto:contacto@datzoncompany.com" className="text-primary-container hover:underline">
                contacto@datzoncompany.com
              </a>
              .
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
