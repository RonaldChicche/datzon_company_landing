/**
 * Utilidades para incrustar vídeos de YouTube.
 * Se valida el id antes de armar cualquier URL: así un valor raro nunca
 * puede inyectar parámetros ni apuntar a otra ruta.
 */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function assertYoutubeId(id: string): void {
  if (!YOUTUBE_ID.test(id)) throw new Error(`Id de YouTube inválido: ${id}`);
}

/** URL del reproductor sin cookies (youtube-nocookie) con autoplay. */
export function youtubeEmbedUrl(id: string): string {
  assertYoutubeId(id);
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
}

/** Enlace normal al vídeo, de respaldo si el iframe no carga. */
export function youtubeWatchUrl(id: string): string {
  assertYoutubeId(id);
  return `https://www.youtube.com/watch?v=${id}`;
}
