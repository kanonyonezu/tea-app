import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = process.env.API_PROXY_TARGET || "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": apiTarget,
    },
  },
});
