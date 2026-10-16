import { faker } from "@faker-js/faker";

import type { Interview, Message, User } from "../index";

/**
 * In-memory «база» для моков: чтобы созданный собес появлялся в истории,
 * а после завершения у него был результат. Живёт до перезагрузки вкладки.
 */
export const db = {
    loggedIn: false,
    user: {
        id: faker.string.uuid(),
        email: "demo@ai-interviews.dev",
        name: "Демо Кандидат"
    } as User,
    interviews: [
        {
            id: faker.string.uuid(),
            position: "Java Backend Developer",
            level: "junior",
            status: "FINISHED",
            createdAt: faker.date.recent({ days: 7 }).toISOString(),
            topics: ["Java Core", "Spring"],
            result: {
                score: 72,
                summary: "Хорошая база по Java Core, но есть пробелы в транзакциях Spring.",
                strengths: ["Коллекции и их сложность", "Понимание ООП"],
                weaknesses: ["@Transactional и propagation", "Индексы в PostgreSQL"]
            }
        }
    ] as Interview[],
    messages: new Map<string, Message[]>()
};

export const createMessage = (role: Message["role"], text: string): Message => ({
    id: faker.string.uuid(),
    role,
    text,
    createdAt: new Date().toISOString()
});

export const MOCK_QUESTIONS = [
    "Расскажи, чем `HashMap` отличается от `TreeMap`, и когда что выбирать?",
    "Что произойдёт, если вызвать метод с `@Transactional` из того же класса?",
    "Как бы ты нашёл медленный запрос в PostgreSQL? Какие инструменты используешь?",
    "Объясни разницу между `equals` и `==`. Зачем переопределять `hashCode`?"
];
