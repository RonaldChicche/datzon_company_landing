/** mm:ss para timecodes de vídeo. Números no finitos o negativos: "00:00". */
export function formatTime(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return "00:00";
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
