import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-top">
          {/* Col 1 — Logo + descripción */}
          <div className="ft-logo">
            <Image
              src="/logo_datzon.svg"
              alt="Datzon Industrial Automation"
              width={110}
              height={38}
              className="h-[26px] w-auto mb-[18px]"
            />
            <p>
              Ingeniería y automatización industrial de extremo a extremo.
              De la celda robótica al tablero en la nube.
            </p>
          </div>

          {/* Col 2 — Navegación */}
          <div className="ft-col">
            <h4>Navegación</h4>
            <Link href="/">Inicio</Link>
            <Link href="/#soluciones">Soluciones</Link>
            <Link href="/robotica">Robótica</Link>
            <Link href="/proyectos">Proyectos</Link>
            <Link href="/equipo">Equipo</Link>
            <Link href="/#cotizar">Cotizar</Link>
          </div>

          {/* Col 3 — Datos de empresa */}
          <div className="ft-col">
            <h4>Datzon Industrial Automation</h4>
            <span className="block text-muted text-sm py-[5px]">RUC 20615575624</span>
            <span className="block text-muted text-sm py-[5px]">Cal. Mercator 484, Dpto. 101</span>
            <span className="block text-muted text-sm py-[5px]">San Borja, Lima, Perú</span>
            <a
              href="mailto:contacto@datzoncompany.com"
              className="block text-muted text-sm py-[5px] hover:text-lime transition-colors"
            >
              contacto@datzoncompany.com
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
