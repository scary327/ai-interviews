import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { appStore, accessTokenAtom } from "@/shared/api";
import { server } from "@/shared/api/mocks/server";
import { renderWithProviders } from "@/test/render";

import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
    it("показывает ошибки валидации и не шлёт запрос", async () => {
        const onSuccess = vi.fn();
        const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />);

        await user.click(screen.getByRole("button", { name: "Войти" }));

        expect(await screen.findByText("Введите корректный email")).toBeInTheDocument();
        expect(screen.getByText("Введите пароль")).toBeInTheDocument();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it("логинит и кладёт токен в сессию", async () => {
        const onSuccess = vi.fn();
        const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />);

        await user.type(screen.getByLabelText("Email"), "demo@ai-interviews.dev");
        await user.type(screen.getByLabelText("Пароль"), "secret123");
        await user.click(screen.getByRole("button", { name: "Войти" }));

        await waitFor(() => expect(onSuccess).toHaveBeenCalled());
        expect(appStore.get(accessTokenAtom)).toEqual(expect.any(String));
    });

    it("показывает ошибку бэкенда", async () => {
        server.use(
            http.post("*/api/auth/login", () =>
                HttpResponse.json({ detail: "Неверный пароль" }, { status: 401 })
            )
        );
        const { user } = renderWithProviders(<LoginForm onSuccess={vi.fn()} />);

        await user.type(screen.getByLabelText("Email"), "demo@ai-interviews.dev");
        await user.type(screen.getByLabelText("Пароль"), "wrong");
        await user.click(screen.getByRole("button", { name: "Войти" }));

        expect(await screen.findByText("Неверный пароль")).toBeInTheDocument();
    });
});
