import { describe, expect, it } from "vitest";

import { interviewSetupSchema, parseTopics } from "./schemas";

describe("interviewSetupSchema", () => {
    it("разбирает темы через запятую, выкидывая пустые", () => {
        expect(parseTopics(" Spring, SQL ,, многопоточность ,")).toEqual([
            "Spring",
            "SQL",
            "многопоточность"
        ]);
    });

    it("не пропускает неизвестный уровень", () => {
        const result = interviewSetupSchema.safeParse({
            position: "Java Backend Developer",
            level: "god",
            topics: "",
            resumeText: "",
            vacancyText: ""
        });
        expect(result.success).toBe(false);
    });

    const valid = (texts: { resumeText?: string; vacancyText?: string }) =>
        interviewSetupSchema.safeParse({
            position: "Java Backend Developer",
            level: "junior",
            topics: "",
            resumeText: "",
            vacancyText: "",
            ...texts
        }).success;

    it("пропускает резюме и вакансию ровно на лимите", () => {
        expect(valid({ resumeText: "a".repeat(20_000), vacancyText: "b".repeat(10_000) })).toBe(
            true
        );
    });

    it("не пропускает резюме и вакансию длиннее лимита", () => {
        expect(valid({ resumeText: "a".repeat(20_001) })).toBe(false);
        expect(valid({ vacancyText: "b".repeat(10_001) })).toBe(false);
    });
});
