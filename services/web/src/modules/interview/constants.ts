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

export const POSITION_PRESETS = [
    "Java Backend Developer",
    "Python Backend Developer",
    "Frontend Developer (React)",
    "Fullstack Developer",
    "QA Engineer",
    "DevOps Engineer",
    "Data Scientist"
] as const;
