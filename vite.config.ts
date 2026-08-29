import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { calculatorAssetsPlugin } from "./src/vite-plugin-calculator-assets";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [react(), calculatorAssetsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
