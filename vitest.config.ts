import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "jsdom", include: ["packages/**/*.test.{ts,tsx}"], setupFiles: ["./vitest.setup.ts"] } });
