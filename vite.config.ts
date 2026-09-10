import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // transformers.js pulls model files from the HF CDN at runtime; nothing to bundle.
  optimizeDeps: { exclude: ["@huggingface/transformers"] },
});
