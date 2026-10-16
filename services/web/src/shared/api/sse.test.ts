import { describe, expect, it, vi } from "vitest";

import { createSseParser } from "./sse";

describe("createSseParser", () => {
    it("собирает событие, пришедшее несколькими кусками", () => {
        const onEvent = vi.fn();
        const parse = createSseParser(onEvent);

        parse('event: delta\ndata: {"te');
        parse('xt":"Привет"}\n');
        expect(onEvent).not.toHaveBeenCalled();

        parse("\n");
        expect(onEvent).toHaveBeenCalledWith({ event: "delta", data: '{"text":"Привет"}' });
    });

    it("разбирает несколько событий, CRLF, многострочный data и комментарии", () => {
        const onEvent = vi.fn();
        const parse = createSseParser(onEvent);

        parse(
            ": keep-alive\r\n\r\ndata: строка 1\r\ndata: строка 2\r\n\r\nevent: done\ndata: {}\n\n"
        );

        expect(onEvent.mock.calls).toEqual([
            [{ event: "message", data: "строка 1\nстрока 2" }],
            [{ event: "done", data: "{}" }]
        ]);
    });
});
