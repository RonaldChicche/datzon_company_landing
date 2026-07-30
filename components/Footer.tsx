import Image from "next/image";
import Link from "next/link";
import { WHATSAPP_URL } from "@/lib/contact-links";
import { siteAssetUrl } from "@/lib/site-assets";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-top">
          {/* Col 1 — Logo + descripción */}
          <div className="ft-logo">
            <Image
              src={siteAssetUrl("logo_datzon.svg")}
              alt="Datzon Industrial Automation"
              // Proporción intrínseca del SVG (viewBox 614×120) — ver Header.
              width={614}
              height={120}
              className="h-[26px] w-auto mb-[18px]"
            />
            <p>
              Ingeniería industrial de extremo a extremo.
              Diseñamos, fabricamos y automatizamos.
            </p>
          </div>

          {/* Col 2 — Navegación */}
          <div className="ft-col">
            <h2>Navegación</h2>
            <Link href="/">Inicio</Link>
            <Link href="/#soluciones">Soluciones</Link>
            <Link href="/robotica">Robótica</Link>
            <Link href="/proyectos">Proyectos</Link>
            <Link href="/equipo">Equipo</Link>
            <Link href="/#cotizar">Cotizar</Link>
          </div>

          {/* Col 3 — Datos de empresa */}
          <div className="ft-col">
            <h2>Datzon Industrial Automation</h2>
            <span className="block text-muted text-sm py-[5px]">RUC 20615575624</span>
            <span className="block text-muted text-sm py-[5px]">Cal. Mercator 484, Dpto. 101</span>
            <span className="block text-muted text-sm py-[5px]">San Borja, Lima, Perú</span>
            <a
              href="mailto:contacto@datzoncompany.com"
              className="block text-muted text-sm py-[5px] hover:text-lime transition-colors"
            >
              contacto@datzoncompany.com
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-muted text-sm py-[5px] hover:text-lime transition-colors"
            >
              Escríbenos por WhatsApp
            </a>
            <Link
              href="/politica-privacidad"
              className="block text-muted text-sm py-[5px] hover:text-lime transition-colors"
            >
              Política de privacidad
            </Link>
            <Link
              href="/terminos-de-uso"
              className="block text-muted text-sm py-[5px] hover:text-lime transition-colors"
            >
              Términos de uso
            </Link>
          </div>
        </div>

        <div className="ft-bottom">
          <p>© {year} Datzon S.A.C</p>
          <p>Diseñado y operado desde Lima, Perú</p>
        </div>
      </div>
    </footer>
  );
}
