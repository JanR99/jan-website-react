import { describe, expect, it } from "vitest";
import { feedbackDate, feedbackPageUrl, githubIssueUrl, issueTitle } from "./feedback";

describe("issueTitle", () => {
    it("takes the first line without spaces around it", () => {
        expect(issueTitle("  Suche findet nichts \nzweite Zeile")).toBe("Suche findet nichts");
    });

    it("shortens a long first line to 70 characters", () => {
        const title = issueTitle("a".repeat(100));
        expect(title).toHaveLength(70);
        expect(title.endsWith("…")).toBe(true);
    });

    it("keeps a first line of exactly 70 characters", () => {
        expect(issueTitle("b".repeat(70))).toBe("b".repeat(70));
    });
});

describe("feedbackDate", () => {
    it("shows day and time the German way", () => {
        expect(feedbackDate("2026-10-08T05:45:00Z", "Europe/Berlin")).toBe("08.10.2026, 07:45");
    });

    it("is empty without a usable date", () => {
        expect(feedbackDate(null)).toBe("");
        expect(feedbackDate("kein Datum")).toBe("");
    });
});

describe("feedbackPageUrl", () => {
    it("builds the # address of the page", () => {
        expect(feedbackPageUrl("/cookbook/Ramen")).toBe("https://jan-website.de/#/cookbook/Ramen");
    });

    it("is null without a page", () => {
        expect(feedbackPageUrl("")).toBeNull();
    });
});

describe("githubIssueUrl", () => {
    const feedback = { text: "Suche findet nichts\n\nBei „Tomate“ kommt nichts.", page: "/cookbook", createdAt: "2026-10-08T05:45:00Z" };

    it("opens the form for a new issue with title and text filled in", () => {
        const url = new URL(githubIssueUrl(feedback, "Europe/Berlin"));
        expect(`${url.origin}${url.pathname}`).toBe("https://github.com/JanR99/jan-website-react/issues/new");
        expect(url.searchParams.get("title")).toBe("Suche findet nichts");
        expect(url.searchParams.get("body")).toBe(
            "Suche findet nichts\n\nBei „Tomate“ kommt nichts.\n\n---\nSeite: https://jan-website.de/#/cookbook\nFeedback vom 08.10.2026, 07:45"
        );
    });

    it("says when the page is not known and leaves out a missing date", () => {
        const body = new URL(githubIssueUrl({ ...feedback, page: "", createdAt: null })).searchParams.get("body");
        expect(body?.endsWith("---\nSeite: unbekannt")).toBe(true);
    });
});
