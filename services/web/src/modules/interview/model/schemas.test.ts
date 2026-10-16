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
            topics: ""
        });
        expect(result.success).toBe(false);
    });
});
