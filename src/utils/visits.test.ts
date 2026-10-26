import { describe, expect, it } from "vitest";
import { OTHER_PAGE, statsPage } from "./visits";

describe("statsPage", () => {
    it("counts a recipe by its id", () => {
        expect(statsPage("/cookbook/12-falafel-wrap")).toBe("/cookbook/12");
        expect(statsPage("/cookbook/12")).toBe("/cookbook/12");
    });

    it("keeps the other pages as they are, without a slash at the end", () => {
        expect(statsPage("/")).toBe("/");
        expect(statsPage("/reisen/5/")).toBe("/reisen/5");
        expect(statsPage("/spiele/kanji")).toBe("/spiele/kanji");
    });

    it("doesn't count the account and the password reset", () => {
        expect(statsPage("/konto")).toBeNull();
        expect(statsPage("/konto/statistik")).toBeNull();
        expect(statsPage("/passwort-zuruecksetzen")).toBeNull();
    });

    it("counts an address that is no page of the website as one other page", () => {
        expect(statsPage("/cookbook/käse-spätzle")).toBe(OTHER_PAGE);
    });
});
