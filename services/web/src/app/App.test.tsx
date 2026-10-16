import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

/** Смоук-тест всего приложения: роутер + guard'ы + MSW-моки */
describe("App", () => {
    it("неавторизованного уводит на логин, после входа возвращает назад", async () => {
        window.history.pushState({}, "", "/interviews");
        const user = userEvent.setup();
        render(<App />);

        expect(await screen.findByText("Вход")).toBeInTheDocument();
        expect(window.location.pathname).toBe("/login");

        await user.type(screen.getByLabelText("Email"), "demo@ai-interviews.dev");
        await user.type(screen.getByLabelText("Пароль"), "secret123");
        await user.click(screen.getByRole("button", { name: "Войти" }));

        expect(await screen.findByRole("heading", { name: "История" })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/interviews");
        expect(await screen.findByText("Java Backend Developer")).toBeInTheDocument();
    });
});
