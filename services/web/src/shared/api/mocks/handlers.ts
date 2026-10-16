import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

import { getFinishInterviewResponseMock } from "../generated/ai/endpoints.msw";
import { getLoginResponseMock } from "../generated/core/endpoints.msw";
import type { CreateInterviewRequest, Interview, SendMessageRequest } from "../index";
import { createMessage, db, MOCK_QUESTIONS } from "./db";

/**
 * Моки бэкендов для разработки без запущенных сервисов (VITE_API_MOCKS=true) и для тестов.
 *
 * Сгенерированные Orval хендлеры (getCoreApiMock/getAiServiceMock) отдают случайные данные —
 * удобно для вёрстки. Здесь поверх них — хендлеры с состоянием, чтобы сценарий
 * «залогинился → создал собес → поговорил → получил результат» работал целиком.
 */

const unauthorized = () => HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
const token = () => getLoginResponseMock({ expiresIn: 900 });

const findInterview = (id: string) => db.interviews.find((i) => i.id === id);

const authHandlers = [
    http.post("*/api/auth/login", async () => {
        await delay();
        db.loggedIn = true;
        return HttpResponse.json(token());
    }),
    http.post("*/api/auth/register", async ({ request }) => {
        await delay();
        const body = (await request.json()) as { email: string; name?: string };
        db.user = { ...db.user, email: body.email, name: body.name };
        db.loggedIn = true;
        return HttpResponse.json(token(), { status: 201 });
    }),
    http.post("*/api/auth/refresh", () =>
        db.loggedIn ? HttpResponse.json(token()) : unauthorized()
    ),
    http.post("*/api/auth/logout", () => {
        db.loggedIn = false;
        return new HttpResponse(null, { status: 204 });
    }),
    http.get("*/api/users/me", () => HttpResponse.json(db.user))
];

const interviewHandlers = [
    http.get("*/api/interviews", async () => {
        await delay();
        return HttpResponse.json(db.interviews);
    }),
    http.post("*/api/interviews", async ({ request }) => {
        await delay();
        const body = (await request.json()) as CreateInterviewRequest;
        const interview: Interview = {
            id: faker.string.uuid(),
            ...body,
            status: "IN_PROGRESS",
            createdAt: new Date().toISOString(),
            result: null
        };
        db.interviews.unshift(interview);
        return HttpResponse.json(interview, { status: 201 });
    }),
    http.get("*/api/interviews/:id", async ({ params }) => {
        await delay();
        const interview = findInterview(String(params.id));
        return interview ? HttpResponse.json(interview) : new HttpResponse(null, { status: 404 });
    })
];

const chatHandlers = [
    http.get("*/ai/interviews/:id/messages", async ({ params }) => {
        await delay();
        return HttpResponse.json(db.messages.get(String(params.id)) ?? []);
    }),

    // Стрим ответа интервьюера: отдаём текст кусками, как LLM
    http.post("*/ai/interviews/:id/messages", async ({ params, request }) => {
        const id = String(params.id);
        const { text } = (await request.json()) as SendMessageRequest;
        const history = db.messages.get(id) ?? [];
        const asked = history.filter((m) => m.role === "interviewer").length;

        const reply =
            (asked === 0 ? "Привет! Давай начнём. " : "Понял, спасибо. Следующий вопрос: ") +
            MOCK_QUESTIONS[asked % MOCK_QUESTIONS.length];

        const answer = createMessage("interviewer", reply);
        db.messages.set(id, [...history, createMessage("candidate", text), answer]);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                for (const word of reply.split(/(?<= )/)) {
                    await delay(40);
                    const data = JSON.stringify({ text: word });
                    controller.enqueue(encoder.encode(`event: delta\ndata: ${data}\n\n`));
                }
                const done = JSON.stringify({ messageId: answer.id });
                controller.enqueue(encoder.encode(`event: done\ndata: ${done}\n\n`));
                controller.close();
            }
        });

        return new HttpResponse(stream, { headers: { "Content-Type": "text/event-stream" } });
    }),

    http.post("*/ai/interviews/:id/finish", async ({ params }) => {
        await delay(1200);
        const interview = findInterview(String(params.id));
        const evaluation = getFinishInterviewResponseMock({
            score: faker.number.int({ min: 40, max: 95 }),
            summary: "Уверенный уровень, но стоит подтянуть работу с транзакциями.",
            strengths: ["Структурированные ответы", "Знание коллекций"],
            weaknesses: ["Транзакции в Spring", "Оптимизация SQL"]
        });

        if (interview) {
            interview.status = "FINISHED";
            interview.result = evaluation;
        }
        return HttpResponse.json(evaluation);
    })
];

export const handlers = [...authHandlers, ...interviewHandlers, ...chatHandlers];
