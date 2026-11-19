import type { InterviewLevel, InterviewStatus } from "@/shared/api";

export const LEVEL_LABELS: Record<InterviewLevel, string> = {
    intern: "Intern",
    junior: "Junior",
    middle: "Middle",
    senior: "Senior"
};

export const STATUS_LABELS: Record<InterviewStatus, string> = {
    CREATED: "Создано",
    IN_PROGRESS: "В процессе",
    FINISHED: "Завершено"
};

/** Как в контракте core-api */
export const RESUME_MAX_LENGTH = 20_000;
export const VACANCY_MAX_LENGTH = 10_000;
export const RESUME_FILE_MAX_BYTES = 5 * 1024 * 1024;

export const POSITION_PRESETS = [
    "Java Backend Developer",
    "Python Backend Developer",
    "Frontend Developer (React)",
    "Fullstack Developer",
    "QA Engineer",
    "DevOps Engineer",
    "Data Scientist"
] as const;
