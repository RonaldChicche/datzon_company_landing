"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteAssetUrl } from "@/lib/site-assets";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/robotica", label: "Robótica" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/equipo", label: "Equipo" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar el menú móvil al navegar. Se ajusta durante el render comparando con
  // el valor anterior, el patrón que React documenta para "resetear estado
  // cuando cambia una prop", en vez de setState dentro de un efecto, que
  // renderiza dos veces en cascada.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
      <div className="nav-inner">
        {/* Logo */}
        <Link href="/" className="nav-logo" aria-label="Datzon, inicio">
          <Image
            src={siteAssetUrl("logo_datzon.svg")}
            alt="Datzon Industrial Automation"
            // Proporción intrínseca del SVG (viewBox 614×120): una proporción
            // equivocada aquí hace que el navegador reserve mal el espacio y
            // el layout salte al cargar (CLS medido en la auditoría).
            width={614}
            height={120}
            className="h-7 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <nav
          className={`nav-links${mobileOpen ? " open" : ""}`}
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA + burger */}
        <div className="nav-cta">
          {pathname === "/" ? (
            <Link href="/#cotizar" className="btn btn-primary">
              Cotizar
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.dispatchEvent(new CustomEvent("open-contact-modal"))}
            >
              Cotizar
            </button>
          )}
          <button
            className="nav-burger"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
