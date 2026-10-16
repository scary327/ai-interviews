import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Границы слоёв: shared ← modules ← pages ← app (импорт только «вниз»).
 * Подробнее — README.md, раздел «Архитектура».
 */
const restrict = (...patterns) => ({
    "no-restricted-imports": ["error", { patterns }]
});

const noApp = { group: ["@/app/*"], message: "app — верхний слой, его никто не импортирует" };
const noPages = { group: ["@/pages/*"], message: "Страницы импортирует только app/routes" };
const noModules = {
    group: ["@/modules/*"],
    message: "shared не знает о модулях. Нужен общий код — перенеси его в shared"
};
const noModuleInternals = {
    group: ["@/modules/*/*"],
    message: "Импортируй модуль через его index.ts: @/modules/<name>"
};
const noCrossModule = {
    group: ["@/modules/*"],
    message:
        "Модули не импортируют друг друга. Внутри модуля — относительные импорты, общее — в shared, склейка — в pages"
};
const noGenerated = {
    group: ["@/shared/api/generated/*"],
    message: "Бери хуки и типы из @/shared/api"
};

export default defineConfig([
    globalIgnores(["dist", "src/app/routeTree.gen.ts", "src/shared/api/generated"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite
        ],
        languageOptions: {
            globals: globals.browser
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }
            ]
        }
    },

    // --- Границы слоёв ---
    {
        files: ["src/shared/**"],
        ignores: ["src/shared/api/**"],
        rules: restrict(noApp, noPages, noModules, noGenerated)
    },
    { files: ["src/shared/api/**"], rules: restrict(noApp, noPages, noModules) },
    { files: ["src/modules/**"], rules: restrict(noApp, noPages, noCrossModule, noGenerated) },
    { files: ["src/pages/**"], rules: restrict(noApp, noModuleInternals, noGenerated) },
    { files: ["src/app/**"], rules: restrict(noModuleInternals, noGenerated) },

    // shadcn-компоненты экспортируют варианты (cva) рядом с компонентами, роуты — Route
    {
        files: ["src/shared/ui/**", "src/app/routes/**"],
        rules: { "react-refresh/only-export-components": "off" }
    },

    prettier
]);
