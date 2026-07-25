import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // El código de la app usa el alias "@/" (tsconfig paths); vitest no lee
    // tsconfig, así que se declara aquí también.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
