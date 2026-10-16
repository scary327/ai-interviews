import { defineConfig } from "orval";

/**
 * Генерация клиента из contracts/*.yaml: npm run api:gen
 * На выходе: react-query хуки + типы + MSW-моки (faker).
 * Сгенерированный код коммитим (Docker-сборка web не видит папку contracts).
 */
const service = (name: "core" | "ai", spec: string, mutator: string) => ({
    input: { target: spec },
    output: {
        mode: "split" as const,
        target: `./src/shared/api/generated/${name}/endpoints.ts`,
        schemas: `./src/shared/api/generated/${name}/model`,
        client: "react-query" as const,
        httpClient: "axios" as const,
        mock: true,
        clean: true,
        prettier: true,
        override: {
            mutator: { path: "./src/shared/api/http.ts", name: mutator },
            // SSE-эндпоинт стримится руками (modules/interview), хук для него не нужен
            operations: { sendMessage: { query: { useQuery: false, useMutation: false } } }
        }
    }
});

export default defineConfig({
    core: service("core", "../../contracts/core-api.yaml", "coreHttp"),
    ai: service("ai", "../../contracts/ai-service.yaml", "aiHttp")
});
