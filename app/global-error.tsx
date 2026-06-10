"use client";

import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-neutral-900 text-white">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-12">
            <span className="text-4xl font-black tracking-tighter text-primary-container font-headline">
              DATZON
            </span>
          </div>
          
          <div className="inline-block bg-primary-container px-4 py-1 mb-6">
            <span className="font-sans font-bold uppercase text-xs tracking-widest text-on-primary-container">
              DATZON // CRITICAL ERROR
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight mb-8 font-headline">
            ERROR CRÍTICO <br />
            <span className="text-white/50">DEL SISTEMA</span>
          </h1>

          <p className="text-white/70 max-w-md mx-auto font-sans text-base md:text-lg mb-10 leading-relaxed">
            Error crítico del sistema. Por favor recarga la página.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="bg-primary-container text-on-primary-container font-black px-10 py-5 text-lg uppercase tracking-tight hover:bg-white hover:text-black transition-all font-headline cursor-pointer"
            >
              RECARGAR SISTEMA
            </button>
            <a
              href="/"
              className="border border-white/30 text-white font-black px-10 py-5 text-lg uppercase tracking-tight hover:bg-white hover:text-black transition-all font-headline text-center"
            >
              VOLVER AL INICIO
            </a>
          </div>
          
          {error.digest && (
            <p className="mt-16 text-xs text-white/30 font-mono">
              Digest: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
