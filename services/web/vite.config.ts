import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { msw } from "msw/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        // Роутер должен идти раньше react(): он генерирует routeTree.gen.ts
        tanstackRouter({
            target: "react",
            routesDirectory: "./src/app/routes",
            generatedRouteTree: "./src/app/routeTree.gen.ts",
            autoCodeSplitting: true,
            quoteStyle: "double"
        }),
        react(),
        tailwindcss(),
        // Только отдаёт mockServiceWorker.js в dev, моки подключаем сами (src/shared/api/mocks)
        { ...msw({ mode: "worker-only" }), apply: "serve" }
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./src")
        }
    },
    server: {
        port: 5173,
        // В dev ходим на бэки напрямую, в prod то же самое делает nginx (infra/nginx)
        proxy: {
            "/api": "http://localhost:8080",
            "/ai": {
                target: "http://localhost:8000",
                rewrite: (p) => p.replace(/^\/ai/, "")
            }
        }
    }
});
