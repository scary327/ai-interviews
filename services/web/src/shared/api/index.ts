/**
 * Публичное API слоя запросов.
 * Хуки и типы сгенерированы Orval из contracts/*.yaml (npm run api:gen) — руками не правим.
 */
export * from "./generated/core/endpoints";
export * from "./generated/core/model";
export * from "./generated/ai/endpoints";
export * from "./generated/ai/model";

export { type ErrorType } from "./http";
export { HttpError, postSse, type SseEvent } from "./sse";
export {
    accessTokenAtom,
    appStore,
    ensureSession,
    isAuthenticatedAtom,
    setAccessToken
} from "./session";
