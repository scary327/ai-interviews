import { z } from "zod";

import { InterviewLevel } from "@/shared/api";

import { RESUME_MAX_LENGTH, VACANCY_MAX_LENGTH } from "../constants";

const tooLong = (limit: number) =>
    `Не больше ${limit.toLocaleString("ru-RU")} символов — сократите текст`;

export const interviewSetupSchema = z.object({
    position: z.string().trim().min(2, "Укажите позицию"),
    level: z.enum(InterviewLevel),
    /** Через запятую: «Spring, SQL, многопоточность» */
    topics: z.string(),
    resumeText: z.string().trim().max(RESUME_MAX_LENGTH, tooLong(RESUME_MAX_LENGTH)),
    vacancyText: z.string().trim().max(VACANCY_MAX_LENGTH, tooLong(VACANCY_MAX_LENGTH))
});

export type InterviewSetupValues = z.infer<typeof interviewSetupSchema>;

export const parseTopics = (topics: string) =>
    topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
