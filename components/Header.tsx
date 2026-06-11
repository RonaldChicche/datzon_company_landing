"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
      <div className="nav-inner">
        {/* Logo */}
        <Link href="/" className="nav-logo" aria-label="Datzon — inicio">
          <Image
            src="/logo_datzon.svg"
            alt="Datzon Industrial Automation"
            width={140}
            height={48}
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
          <Link href="/#cotizar" className="btn btn-primary">
            Cotizar
          </Link>
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
