import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    allowedHosts: ["beyond-identity-web.onrender.com", ".onrender.com"]
  },
  preview: {
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    allowedHosts: ["beyond-identity-web.onrender.com", ".onrender.com"]
  }
});