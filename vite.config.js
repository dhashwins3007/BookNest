/* global process */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => {
  const base =
    process.env.GITHUB_ACTIONS === "true"
      ? "/BookNest/"
      : "/";

  const apiURL =
    process.env.VITE_API_URL ||
    (
      command === "build"
        ? "https://booknest-api-k5xx.onrender.com/api"
        : "/api"
    );

  return {
    base,

    define: {
      __API_BASE__: JSON.stringify(apiURL)
    },

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
          start_url: base,
          scope: base,

          icons: [
            {
              src: `${base}android-chrome-192x192.png`,
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: `${base}android-chrome-512x512.png`,
              sizes: "512x512",
              type: "image/png"
            }
          ]
        },

        workbox: {
          globPatterns: [
            "**/*.{js,css,html,png,jpg,jpeg,svg,ico,webp}"
          ],

          navigateFallbackDenylist: [
            /^\/api(?:\/|$)/
          ]
        }
      })
    ],

    server: {
      host: "127.0.0.1",

      proxy: {
        "/api": "http://127.0.0.1:3001"
      }
    },

    preview: {
      host: "127.0.0.1"
    }
  };
});