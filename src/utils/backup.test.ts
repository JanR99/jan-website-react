import { describe, expect, it } from "vitest";
import { backupFileName, fileSizeLabel } from "./backup";

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
