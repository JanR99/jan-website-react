import { describe, expect, it } from "vitest";
import { pageLabel, shortDay, visitsOfLastDays } from "./stats";

const recipes = [{ id: 12, title: "Ramen" }];
const folders = [{ id: 5, name: "Japan" }];

describe("pageLabel", () => {
    it("names recipes and trips by their title", () => {
        expect(pageLabel("/cookbook/12", recipes, folders)).toBe("Rezept: Ramen");
        expect(pageLabel("/reisen/5", recipes, folders)).toBe("Reise: Japan");
    });

    it("says when a recipe or trip doesn't exist any more", () => {
        expect(pageLabel("/cookbook/99", recipes, folders)).toBe("Rezept 99 (gelöscht)");
        expect(pageLabel("/reisen/7", recipes, folders)).toBe("Reise 7 (gelöscht)");
    });

    it("names the fixed pages and leaves unknown ones as they are", () => {
        expect(pageLabel("/", recipes, folders)).toBe("Startseite");
        expect(pageLabel("/andere", recipes, folders)).toBe("Andere Adressen");
        expect(pageLabel("/foo", recipes, folders)).toBe("/foo");
    });
});

describe("visitsOfLastDays", () => {
    it("adds up the newest days", () => {
        const days = [1, 2, 3].map((visits, i) => ({ day: `2026-10-2${i}`, visits, pageViews: 0 }));
        expect(visitsOfLastDays(days, 2)).toBe(5);
    });
});

describe("shortDay", () => {
    it("is day and month", () => expect(shortDay("2026-10-06")).toBe("06.10."));
});
