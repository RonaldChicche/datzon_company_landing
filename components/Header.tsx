"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onContactSales: () => void;
}

export default function Header({ onContactSales }: HeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-neutral-900 text-white fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 md:px-12 py-4 h-20">
      {/* Logo */}
      <Link
        href="/"
        className="shrink-0 cursor-pointer group z-10 block"
      >
        <div className="group-hover:bg-primary-container transition-all duration-300 flex items-center justify-center p-0.5">
          <Image
            src="/logo_datzon.svg"
            alt="DATZON Logo"
            width={240}
            height={82}
            className="w-auto h-12 md:h-14 block"
            priority
          />
        </div>
      </Link>

      {/* Navigation Links - Centered Absolutely */}
      <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <Link
          href="/"
          className={`font-headline font-bold tracking-tight uppercase transition-colors pb-1 border-b-2 ${isActive("/")
            ? "text-primary-container border-primary-container"
            : "text-white/80 hover:text-white border-transparent hover:border-white/20"
            }`}
        >
          Inicio
        </Link>
        <Link
          href="/solutions"
          className={`font-headline font-bold tracking-tight uppercase transition-colors pb-1 border-b-2 ${isActive("/solutions")
            ? "text-primary-container border-primary-container"
            : "text-white/80 hover:text-white border-transparent hover:border-white/20"
            }`}
        >
          Soluciones
        </Link>
        <Link
          href="/equipo"
          className={`font-headline font-bold tracking-tight uppercase transition-colors pb-1 border-b-2 ${isActive("/equipo")
            ? "text-primary-container border-primary-container"
            : "text-white/80 hover:text-white border-transparent hover:border-white/20"
            }`}
        >
          Equipo
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center z-10">
        <button
          onClick={onContactSales}
          className="bg-primary-container text-on-primary-container font-headline font-bold uppercase py-3 px-6 hover:brightness-110 active:scale-95 transition-all text-xs tracking-tight min-h-[48px]"
        >
          Contactar Ventas
        </button>
      </div>
    </nav>
  );
}
