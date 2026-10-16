import "@/app/styles/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/app/App";
import { env } from "@/shared/config/env";

/** В dev с VITE_API_MOCKS=true запросы перехватывает MSW. В prod-сборку моки не попадают */
const enableMocks = async () => {
    if (!import.meta.env.DEV || !env.apiMocks) return;
    const { worker } = await import("@/shared/api/mocks/browser");
    await worker.start({ onUnhandledFrame: "bypass", quiet: true });
};

void enableMocks().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
});
