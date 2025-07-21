import path from "node:path";
import react from "@vitejs/plugin-react";
import { createLogger, defineConfig } from "vite";

const isDev = process.env.NODE_ENV !== "production";

// ─────────────────────────────────────────────
// Plugin que permite transformar o index.html.
// Mude o conteúdo da função conforme sua necessidade.
function htmlTransformPlugin() {
  return {
    name: "html-transform",
    transformIndexHtml(html) {
      // Exemplo simples: substitui o placeholder %TITLE%
      return html.replace("%TITLE%", "Meu Título");
    },
  };
}

// ─────────────────────────────────────────────

const logger = createLogger();
const loggerError = logger.error;

logger.error = (msg, options) => {
  if (options?.error?.toString().includes("CssSyntaxError: [postcss]")) {
    return;
  }

  loggerError(msg, options);
};

export default defineConfig({
  customLogger: logger,
  plugins: [react(), htmlTransformPlugin()],
  server: {
    cors: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
    allowedHosts: true,
  },
  resolve: {
    extensions: [".jsx", ".js", ".tsx", ".ts", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        "@babel/parser",
        "@babel/traverse",
        "@babel/generator",
        "@babel/types",
      ],
    },
  },
});
