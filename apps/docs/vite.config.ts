import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps asset URLs relative so the site works under Read the Docs' /en/<version>/ prefix.
export default defineConfig({ base: "./", plugins: [react()], build: { outDir: "dist", emptyOutDir: true } });
