import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "cloudflare-pages",
    output: {
      dir: "dist",
      serverDir: "dist",   // _worker.js vai para dist/ diretamente
      publicDir: "dist",   // assets também em dist/
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});