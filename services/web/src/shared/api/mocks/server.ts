import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/** MSW для тестов (Vitest, node) */
export const server = setupServer(...handlers);
