import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "cloudflare-pages",
    output: {
      dir: "dist",
      serverDir: "dist",
      publicDir: "dist",
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});