import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 w-full pt-16 pb-10 px-12 border-t border-neutral-800">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        {/* Brand + Legal */}
        <div className="flex flex-col gap-3">
          <span className="text-xl font-black text-white font-headline">DATZON</span>
          <span className="font-sans font-normal text-xs text-neutral-500 uppercase tracking-tight">
            DATZON S.A.C. — RUC 20615575624
          </span>
          <span className="font-sans font-normal text-xs text-neutral-500">
            Cal. Mercator 484, Dpto. 101, San Borja, Lima, Perú
          </span>
          <a
            href="mailto:contacto@datzoncompany.com"
            className="font-sans font-normal text-xs text-neutral-400 hover:text-white transition-colors"
          >
            contacto@datzoncompany.com
          </a>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-x-12 gap-y-4 items-start">
          <Link
            href="/politica-privacidad"
            className="font-sans font-normal text-xs uppercase tracking-tight text-neutral-400 hover:text-primary-container transition-colors"
          >
            Protocolo de Privacidad
          </Link>
          <Link
            href="/terminos-de-uso"
            className="font-sans font-normal text-xs uppercase tracking-tight text-neutral-400 hover:text-primary-container transition-colors"
          >
            Términos de Uso
          </Link>
        </div>

        {/* Social */}
        <div className="flex gap-4 items-start">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn de Datzon"
            className="w-12 h-12 border border-neutral-700 flex items-center justify-center text-white hover:border-primary-container cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Datzon"
            className="w-12 h-12 border border-neutral-700 flex items-center justify-center text-white hover:border-primary-container cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto mt-10 pt-6 border-t border-neutral-800">
        <span className="font-sans font-normal text-xs uppercase tracking-tight text-neutral-600">
          © {new Date().getFullYear()} DATZON S.A.C. INDUSTRIAL AUTOMATION.
        </span>
      </div>
    </footer>
  );
}
