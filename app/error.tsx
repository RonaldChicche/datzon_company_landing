"use client";


export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  return (
    <div className="bg-inverse-surface min-h-[calc(100vh-4rem)] flex items-center justify-center text-on-surface py-20">
      <main className="text-center max-w-6xl px-6 relative z-10">
        <div className="inline-block bg-primary-container px-4 py-1 mb-6">
          <span className="font-sans font-bold uppercase text-xs tracking-widest text-on-primary-container">
            DATZON · ERROR 500
          </span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none mb-8 font-headline">
          ERROR DE <br />
          <span className="text-primary-container">SISTEMA</span>
        </h1>
        
        <p className="text-white/70 max-w-2xl mx-auto font-sans text-lg mb-10 leading-relaxed">
          Se produjo un fallo interno. Nuestro equipo ha sido notificado. Intenta nuevamente o contacta soporte técnico.
        </p>
        
        <div className="flex justify-center items-center">
          <button
            onClick={() => reset()}
            className="bg-primary-container text-on-primary-container font-black px-10 py-5 text-lg uppercase tracking-tight hover:bg-white hover:text-black transition-all font-headline cursor-pointer"
          >
            REINTENTAR
          </button>
        </div>

        {error.digest && (
          <p className="mt-16 text-xs text-white/30 font-mono">
            Digest: {error.digest}
          </p>
        )}
      </main>
    </div>
  );
}
