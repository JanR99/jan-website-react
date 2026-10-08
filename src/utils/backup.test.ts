import { describe, expect, it } from "vitest";
import { backupFileName, fileSizeLabel, restoreProblems, restoreSummary } from "./backup";

describe("backupFileName", () => {
    it("has the local day in it, month and day with two digits", () => {
        expect(backupFileName(new Date(2026, 9, 7, 23, 59))).toBe("jan-website-backup-2026-10-07.zip");
        expect(backupFileName(new Date(2027, 0, 3))).toBe("jan-website-backup-2027-01-03.zip");
    });
});

describe("fileSizeLabel", () => {
    it("shows small files in KB, at least 1", () => {
        expect(fileSizeLabel(0)).toBe("1 KB");
        expect(fileSizeLabel(870_400)).toBe("850 KB");
    });

    it("shows files from 1 MB on in MB with a comma", () => {
        expect(fileSizeLabel(1024 * 1024)).toBe("1,0 MB");
        expect(fileSizeLabel(24_536_678)).toBe("23,4 MB");
    });
});

describe("restoreSummary", () => {
    const nothingSkipped = { skippedRecipes: [], skippedFolders: [], skippedPhotos: 0 };

    it("counts recipes, trips and photos", () => {
        expect(restoreSummary({ recipes: 104, folders: 6, photos: 213, ...nothingSkipped }))
            .toBe("104 Rezepte, 6 Reisen und 213 Fotos eingespielt.");
        expect(restoreSummary({ recipes: 0, folders: 0, photos: 0, ...nothingSkipped }))
            .toBe("0 Rezepte, 0 Reisen und 0 Fotos eingespielt.");
    });

    it("uses the singular for one", () => {
        expect(restoreSummary({ recipes: 1, folders: 1, photos: 1, ...nothingSkipped }))
            .toBe("1 Rezept, 1 Reise und 1 Foto eingespielt.");
    });
});

describe("restoreProblems", () => {
    const restored = { recipes: 2, folders: 1, photos: 5 };

    it("is empty if everything was restored", () => {
        expect(restoreProblems({ ...restored, skippedRecipes: [], skippedFolders: [], skippedPhotos: 0 })).toEqual([]);
    });

    it("names the recipes and trips and counts the photos that were left out", () => {
        expect(restoreProblems({ ...restored, skippedRecipes: ["Pesto", "Ramen"], skippedFolders: ["Japan"], skippedPhotos: 2 }))
            .toEqual([
                "Nicht eingespielte Rezepte: Pesto, Ramen",
                "Nicht oder nur teilweise eingespielte Reisen: Japan",
                "2 Fotos nicht eingespielt",
            ]);
        expect(restoreProblems({ ...restored, skippedRecipes: [], skippedFolders: [], skippedPhotos: 1 }))
            .toEqual(["1 Foto nicht eingespielt"]);
    });
});
