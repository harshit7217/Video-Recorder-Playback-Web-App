import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const backendUrl = "https://video-recorder-playback-web-app.onrender.com";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
      "/static": {
        target: backendUrl,
        changeOrigin: true,
      },
      "/socket.io": {
        target: backendUrl,
        changeOrigin: true,
        ws: true,
      },
      "/api/ip": {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
