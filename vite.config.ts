import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  define: {
    global: 'globalThis',
  },
  server: {
    host: "::",
    port: 8000,
    proxy: {
      '/api': {
        target: 'https://bandchu.o-r.kr',  // 로컬 백엔드로 변경
        changeOrigin: true,
        secure: false,  // HTTP이므로 false
      },
      '/ws-chat': {
        target: 'https://bandchu.o-r.kr',  // 로컬 백엔드로 변경
        changeOrigin: true,
        secure: false,  // HTTP이므로 false
        ws: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));