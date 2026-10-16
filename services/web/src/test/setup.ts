import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { setAccessToken } from "@/shared/api";
import { db } from "@/shared/api/mocks/db";
import { server } from "@/shared/api/mocks/server";

// jsdom не умеет matchMedia — нужен теме и сайдбару
if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false
        }) as MediaQueryList;
}

// scrollRestoration роутера дёргает scrollTo, которого в jsdom нет
window.scrollTo = () => {};

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(() => {
    cleanup();
    server.resetHandlers();
    setAccessToken(null);
    db.loggedIn = false;
    localStorage.clear();
});

afterAll(() => server.close());
