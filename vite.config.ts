import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ssr: false,
    }),
    tsconfigPaths(),
  ],
  server: {
    host: "0.0.0.0",
    port: 12000,
    cors: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
  },
});