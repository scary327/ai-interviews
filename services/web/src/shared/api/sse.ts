import { getAccessToken, refreshSession } from "./session";

export interface SseEvent {
    event: string;
    data: string;
}

/**
 * Инкрементальный парсер text/event-stream.
 * Возвращает функцию, которой скармливаются куски текста по мере прихода.
 */
export const createSseParser = (onEvent: (event: SseEvent) => void) => {
    let buffer = "";

    return (chunk: string) => {
        buffer += chunk.replace(/\r\n?/g, "\n");
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
            let event = "message";
            const data: string[] = [];

            for (const line of block.split("\n")) {
                if (line.startsWith(":")) continue; // комментарий / keep-alive
                const sep = line.indexOf(":");
                const field = sep === -1 ? line : line.slice(0, sep);
                const value = sep === -1 ? "" : line.slice(sep + 1).replace(/^ /, "");

                if (field === "event") event = value;
                if (field === "data") data.push(value);
            }

            if (data.length > 0) onEvent({ event, data: data.join("\n") });
        }
    };
};

export class HttpError extends Error {
    readonly status: number;

    constructor(status: number) {
        super(`HTTP ${status}`);
        this.status = status;
    }
}

interface PostSseOptions {
    signal?: AbortSignal;
    onEvent: (event: SseEvent) => void;
}

/**
 * POST-запрос со стримингом ответа (SSE).
 * EventSource не умеет POST и заголовки, поэтому fetch + ручной парсинг.
 * При 401 один раз обновляет токен и повторяет запрос.
 */
export const postSse = async (url: string, body: unknown, options: PostSseOptions) => {
    const send = () =>
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/event-stream",
                ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {})
            },
            body: JSON.stringify(body),
            credentials: "include",
            signal: options.signal
        });

    let response = await send();
    if (response.status === 401 && (await refreshSession())) {
        response = await send();
    }
    if (!response.ok || !response.body) throw new HttpError(response.status);

    const parse = createSseParser(options.onEvent);
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parse(value);
    }
};
