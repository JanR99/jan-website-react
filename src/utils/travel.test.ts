import { describe, expect, it } from "vitest";
import { TravelFolder } from "../types/Travel";
import {
    folderCountry,
    folderPosition,
    parsePlaces,
    photoCountLabel,
    roundPosition,
    sortFolders,
    travelFolderPath,
    withoutPhoto,
} from "./travel";

function folder(overrides: Partial<TravelFolder> = {}): TravelFolder {
    return {
        id: 1,
        name: "Porto",
        country: "Portugal",
        coverPhotoId: 10,
        latitude: 41.1496,
        longitude: -8.611,
        photoIds: [10, 11, 12],
        ...overrides,
    };
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

describe("folderPosition", () => {
    it("is the place of the folder", () => {
        expect(folderPosition(folder())).toEqual({ latitude: 41.1496, longitude: -8.611 });
    });

    it("knows a place on the equator and the prime meridian", () => {
        expect(folderPosition(folder({ latitude: 0, longitude: 0 }))).toEqual({ latitude: 0, longitude: 0 });
    });

    it("is null for a folder without a place", () => {
        expect(folderPosition(folder({ latitude: null, longitude: null }))).toBeNull();
    });

    it("is null if one of the two values is missing or out of range", () => {
        expect(folderPosition(folder({ longitude: null }))).toBeNull();
        expect(folderPosition(folder({ latitude: 91 }))).toBeNull();
        expect(folderPosition(folder({ longitude: -181 }))).toBeNull();
        expect(folderPosition(folder({ latitude: Number.NaN }))).toBeNull();
    });
});

describe("roundPosition", () => {
    it("keeps five decimals", () => {
        expect(roundPosition(41.14961234, -8.61099876)).toEqual({ latitude: 41.14961, longitude: -8.611 });
    });
});

describe("parsePlaces", () => {
    it("reads label and coordinates of every hit", () => {
        const body = [
            { lat: "41.1494512", lon: "-8.6107884", display_name: "Porto, Portugal" },
            { lat: "42.5069391", lon: "1.5212467", display_name: " Andorra la Vella, Andorra " },
        ];
        expect(parsePlaces(body)).toEqual([
            { label: "Porto, Portugal", latitude: 41.14945, longitude: -8.61079 },
            { label: "Andorra la Vella, Andorra", latitude: 42.50694, longitude: 1.52125 },
        ]);
    });

    it("leaves out hits without a name or usable coordinates", () => {
        const body = [
            { lat: "41.1", lon: "-8.6" },
            { lat: "abc", lon: "-8.6", display_name: "Nirgendwo" },
            { lat: "95", lon: "-8.6", display_name: "Zu weit im Norden" },
            null,
            { lat: "50.0755", lon: "14.4378", display_name: "Prag" },
        ];
        expect(parsePlaces(body)).toEqual([{ label: "Prag", latitude: 50.0755, longitude: 14.4378 }]);
    });

    it("is empty if the answer is no list", () => {
        expect(parsePlaces({ error: "Unable to geocode" })).toEqual([]);
        expect(parsePlaces(null)).toEqual([]);
    });
});
