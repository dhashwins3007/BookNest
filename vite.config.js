import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "BookNest Library",
        short_name: "BookNest",
        description: "Search and borrow library books",
        theme_color: "#182650",
        background_color: "#f4f7fc",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,svg,ico,webp}"],
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
      },
    }),
  ],
  server: { host: "127.0.0.1", proxy: { "/api": "http://127.0.0.1:3001" } },
  preview: { host: "127.0.0.1", proxy: { "/api": "http://127.0.0.1:3001" } },
});
