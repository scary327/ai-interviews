import { z } from "zod";

import { InterviewLevel } from "@/shared/api";

export const interviewSetupSchema = z.object({
    position: z.string().trim().min(2, "Укажите позицию"),
    level: z.enum(InterviewLevel),
    /** Через запятую: «Spring, SQL, многопоточность» */
    topics: z.string()
});

export type InterviewSetupValues = z.infer<typeof interviewSetupSchema>;

export const parseTopics = (topics: string) =>
    topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
