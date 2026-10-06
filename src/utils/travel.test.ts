import { describe, expect, it } from "vitest";
import { TravelFolder } from "../types/Travel";
import { folderCountry, photoCountLabel, sortFolders, travelFolderPath, withoutPhoto } from "./travel";

function folder(overrides: Partial<TravelFolder> = {}): TravelFolder {
    return { id: 1, name: "Porto", country: "Portugal", coverPhotoId: 10, photoIds: [10, 11, 12], ...overrides };
}

describe("travelFolderPath", () => {
    it("uses the id of the folder", () => {
        expect(travelFolderPath(folder({ id: 42 }))).toBe("/reisen/42");
    });
});

describe("sortFolders", () => {
    it("sorts by name the German way, umlauts next to their base letter", () => {
        const sorted = sortFolders([folder({ name: "Zürich" }), folder({ name: "Österreich" }), folder({ name: "Oslo" })]);
        expect(sorted.map((f) => f.name)).toEqual(["Oslo", "Österreich", "Zürich"]);
    });

    it("leaves the given list as it is", () => {
        const folders = [folder({ name: "Prag" }), folder({ name: "Andorra" })];
        sortFolders(folders);
        expect(folders.map((f) => f.name)).toEqual(["Prag", "Andorra"]);
    });
});

describe("withoutPhoto", () => {
    it("removes the photo and keeps the cover", () => {
        expect(withoutPhoto(folder(), 11)).toMatchObject({ photoIds: [10, 12], coverPhotoId: 10 });
    });

    it("makes the first remaining photo the cover if the cover was removed", () => {
        expect(withoutPhoto(folder(), 10)).toMatchObject({ photoIds: [11, 12], coverPhotoId: 11 });
    });

    it("has no cover once the last photo is gone", () => {
        expect(withoutPhoto(folder({ photoIds: [10] }), 10)).toMatchObject({ photoIds: [], coverPhotoId: null });
    });

    it("changes nothing for a photo of another folder", () => {
        expect(withoutPhoto(folder(), 99)).toEqual(folder());
    });
});

describe("folderCountry", () => {
    it("returns the country", () => {
        expect(folderCountry({ name: "Porto", country: "Portugal" })).toBe("Portugal");
    });

    it("returns null if the country only repeats the name", () => {
        expect(folderCountry({ name: "Andorra", country: " andorra " })).toBeNull();
    });

    it("returns null without a country", () => {
        expect(folderCountry({ name: "Roadtrip", country: "" })).toBeNull();
    });
});

describe("photoCountLabel", () => {
    it("handles none, one and several photos", () => {
        expect(photoCountLabel(0)).toBe("Noch keine Fotos");
        expect(photoCountLabel(1)).toBe("1 Foto");
        expect(photoCountLabel(16)).toBe("16 Fotos");
    });
});
