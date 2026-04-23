"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";

interface HeaderProps {
  onContactSales: () => void;
}

export default function Header({ onContactSales }: HeaderProps) {
  const [lang, setLang] = useState("ESP");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-neutral-900 text-white fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-12 py-4 h-20">
      {/* Logo */}
      <Link 
        href="/"
        className="shrink-0 cursor-pointer group z-10 block"
      >
        <div className="bg-white group-hover:bg-primary-container transition-all duration-300 flex items-center justify-center p-0.5">
          <Image 
            src="/logo.svg" 
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
      <div className="flex items-center gap-6 w-auto shrink-0 justify-end z-10">
        {/* Language Selector */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:border-white/30 transition-all font-headline font-bold text-[10px] tracking-widest text-white/60 hover:text-white"
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <Globe size={14} className="text-primary-container" />
            <span>{lang}</span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isLangOpen && (
            <div className="absolute top-full right-0 mt-2 w-24 bg-neutral-800 border border-white/10 shadow-2xl py-1 z-50">
              <button 
                className={`w-full text-left px-4 py-2 text-[10px] font-black tracking-widest hover:bg-neutral-700 transition-colors ${lang === 'ESP' ? 'text-primary-container' : 'text-white/60'}`}
                onClick={() => { setLang("ESP"); setIsLangOpen(false); }}
              >
                ESP
              </button>
              <button 
                className={`w-full text-left px-4 py-2 text-[10px] font-black tracking-widest hover:bg-neutral-700 transition-colors ${lang === 'ENG' ? 'text-primary-container' : 'text-white/60'}`}
                onClick={() => { setLang("ENG"); setIsLangOpen(false); }}
              >
                ENG
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={onContactSales}
          className="bg-primary-container text-on-primary-container font-headline font-bold uppercase py-2.5 px-6 hover:bg-opacity-90 active:scale-95 transition-all text-xs tracking-tight"
        >
          Contactar Ventas
        </button>
      </div>
    </nav>
  );
}
