import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // 👈 alias for src folder
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    origin: "https://localhost:5174",
    https: true,
  },
});
