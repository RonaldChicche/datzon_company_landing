import { Share, Network } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 w-full py-16 px-12 flex flex-col md:flex-row justify-between items-center border-t border-neutral-800">
      <div className="flex flex-col mb-8 md:mb-0">
        <span className="text-xl font-black text-white mb-4 font-headline">DATZON</span>
        <span className="font-sans font-normal text-xs uppercase tracking-tight text-neutral-500">
          © 2024 DATZON KINETIC. DISEÑADO PARA LA PRECISIÓN.
        </span>
      </div>
      <div className="flex flex-wrap gap-x-12 gap-y-4">
        <a className="font-sans font-normal text-xs uppercase tracking-tight text-neutral-400 hover:text-primary-container transition-colors" href="#">Protocolo de Privacidad</a>
        <a className="font-sans font-normal text-xs uppercase tracking-tight text-neutral-400 hover:text-primary-container transition-colors" href="#">Documentación Técnica</a>
        <a className="font-sans font-normal text-xs uppercase tracking-tight text-neutral-400 hover:text-primary-container transition-colors" href="#">Infraestructura Global</a>
      </div>
      <div className="mt-8 md:mt-0 flex gap-4">
        <div className="w-10 h-10 border border-neutral-700 flex items-center justify-center text-white hover:border-primary-container cursor-pointer transition-colors">
          <Share size={14} />
        </div>
        <div className="w-10 h-10 border border-neutral-700 flex items-center justify-center text-white hover:border-primary-container cursor-pointer transition-colors">
          <Network size={14} />
        </div>
      </div>
    </footer>
  );
}
