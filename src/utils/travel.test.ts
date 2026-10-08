import { describe, expect, it } from "vitest";
import { Recipe } from "../types/Recipe";
import { TravelFolder, TravelPhoto } from "../types/Travel";
import {
    centralStop,
    cleanCaption,
    crowdedFolders,
    folderCountry,
    folderStops,
    folderRecipes,
    folderSubtitle,
    mapLayout,
    parsePlaces,
    photoCountLabel,
    photoDescription,
    placeName,
    recipeFolders,
    roundPosition,
    sortFolders,
    textParagraphs,
    toMonth,
    travelFolderPath,
    travelPeriod,
    withoutPhoto,
} from "./travel";

function photos(...ids: number[]): TravelPhoto[] {
    return ids.map((id) => ({ id, caption: "" }));
}

function folder(overrides: Partial<TravelFolder> = {}): TravelFolder {
    return {
        id: 1,
        name: "Porto",
        country: "Portugal",
        coverPhotoId: 10,
        stops: [
            { name: "Porto", latitude: 41.1496, longitude: -8.611 },
            { name: "Lissabon", latitude: 38.7223, longitude: -9.1393 },
        ],
        previousFolderId: null,
        startMonth: null,
        endMonth: null,
        text: "",
        cuisine: "",
        photos: photos(10, 11, 12),
        ...overrides,
    };
}

function recipe(id: number, cuisine: string): Recipe {
    return {
        id,
        title: `Rezept ${id}`,
        image: "",
        defaultPortions: 2,
        ingredients: [],
        preparation: [],
        cuisine,
        tags: [],
        relatedRecipeIds: [],
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

    it("puts the newest trip first and the ones without a date after them", () => {
        const sorted = sortFolders([
            folder({ name: "Wien" }),
            folder({ name: "Prag", startMonth: "2023-05" }),
            folder({ name: "Andorra" }),
            folder({ name: "Porto", startMonth: "2024-09", endMonth: "2024-10" }),
            folder({ name: "Athen", startMonth: "2023-05" }),
        ]);
        expect(sorted.map((f) => f.name)).toEqual(["Porto", "Athen", "Prag", "Andorra", "Wien"]);
    });

    it("leaves the given list as it is", () => {
        const folders = [folder({ name: "Prag" }), folder({ name: "Andorra" })];
        sortFolders(folders);
        expect(folders.map((f) => f.name)).toEqual(["Prag", "Andorra"]);
    });
});

describe("withoutPhoto", () => {
    it("removes the photo and keeps the cover", () => {
        expect(withoutPhoto(folder(), 11)).toMatchObject({ photos: photos(10, 12), coverPhotoId: 10 });
    });

    it("makes the first remaining photo the cover if the cover was removed", () => {
        expect(withoutPhoto(folder(), 10)).toMatchObject({ photos: photos(11, 12), coverPhotoId: 11 });
    });

    it("has no cover once the last photo is gone", () => {
        expect(withoutPhoto(folder({ photos: photos(10) }), 10)).toMatchObject({ photos: [], coverPhotoId: null });
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

describe("folderStops", () => {
    it("are the stops of the folder in their order", () => {
        expect(folderStops(folder()).map((stop) => stop.name)).toEqual(["Porto", "Lissabon"]);
    });

    it("know a place on the equator and the prime meridian", () => {
        expect(folderStops(folder({ stops: [{ name: "Null", latitude: 0, longitude: 0 }] }))).toHaveLength(1);
    });

    it("are empty for a folder without a place", () => {
        expect(folderStops(folder({ stops: [] }))).toEqual([]);
    });

    it("leave out stops that are out of range", () => {
        const stops = [
            { name: "zu weit", latitude: 91, longitude: 0 },
            { name: "auch", latitude: 0, longitude: -181 },
            { name: "kaputt", latitude: Number.NaN, longitude: 0 },
            { name: "gut", latitude: 10, longitude: 10 },
        ];
        expect(folderStops(folder({ stops })).map((stop) => stop.name)).toEqual(["gut"]);
    });
});

describe("mapLayout", () => {
    const madrid = { name: "Madrid", latitude: 40.4168, longitude: -3.7038 };
    const sevilla = { name: "Sevilla", latitude: 37.3891, longitude: -5.9845 };
    const valencia = { name: "Valencia", latitude: 39.4699, longitude: -0.3763 };
    const porto = { name: "Porto", latitude: 41.1496, longitude: -8.611 };
    const lissabon = { name: "Lissabon", latitude: 38.7223, longitude: -9.1393 };
    const point = ({ latitude, longitude }: { latitude: number; longitude: number }) => ({ latitude, longitude });
    const none = new Set<number>();

    it("has a pin for every stop and a line through the stops of a folder", () => {
        const { pins, lines } = mapLayout([folder({ stops: [porto, lissabon] })], none);
        expect(pins.map((pin) => [pin.key, pin.stop.name, pin.wholeFolder])).toEqual([["1-0", "Porto", false], ["1-1", "Lissabon", false]]);
        expect(lines).toEqual([[point(porto), point(lissabon)]]);
    });

    it("starts the line at the last stop of the folder the trip came from", () => {
        const portugal = folder({ id: 1, stops: [porto, lissabon] });
        const spanien = folder({ id: 2, stops: [sevilla, madrid], previousFolderId: 1 });
        expect(mapLayout([spanien, portugal], none).lines).toEqual([
            [point(lissabon), point(sevilla), point(madrid)],
            [point(porto), point(lissabon)],
        ]);
    });

    it("connects a single stop to the folder before, but draws no line for it alone", () => {
        const portugal = folder({ id: 1, stops: [lissabon] });
        const spanien = folder({ id: 2, stops: [madrid], previousFolderId: 1 });
        expect(mapLayout([portugal, spanien], none).lines).toEqual([[point(lissabon), point(madrid)]]);
    });

    it("ignores a previous folder that is not there or has no stops", () => {
        const empty = folder({ id: 1, stops: [] });
        expect(mapLayout([empty, folder({ id: 2, stops: [madrid], previousFolderId: 1 })], none).lines).toEqual([]);
        expect(mapLayout([folder({ id: 2, stops: [madrid], previousFolderId: 99 })], none).lines).toEqual([]);
    });

    it("shows a crowded folder as one pin at its central stop, without a line of its own", () => {
        const spanien = folder({ id: 2, stops: [sevilla, madrid, valencia] });
        const { pins, lines } = mapLayout([spanien], new Set([2]));
        expect(pins.map((pin) => [pin.key, pin.stop.name, pin.wholeFolder])).toEqual([["2-all", "Madrid", true]]);
        expect(lines).toEqual([]);
    });

    it("keeps the line from country to country while the countries are one pin each", () => {
        const coimbra = { name: "Coimbra", latitude: 40.2033, longitude: -8.4103 };
        const portugal = folder({ id: 1, stops: [porto, coimbra, lissabon] });
        const spanien = folder({ id: 2, stops: [sevilla, madrid, valencia], previousFolderId: 1 });
        expect(mapLayout([portugal, spanien], new Set([1, 2])).lines).toEqual([[point(coimbra), point(madrid)]]);
        // only Portugal is one pin: from it to the first stop in Spain and on
        expect(mapLayout([portugal, spanien], new Set([1])).lines).toEqual([
            [point(coimbra), point(sevilla), point(madrid), point(valencia)],
        ]);
    });
});

describe("centralStop", () => {
    it("is the stop closest to the middle of all stops", () => {
        const stops = [
            { name: "West", latitude: 0, longitude: 0 },
            { name: "Mitte", latitude: 1, longitude: 4.5 },
            { name: "Ost", latitude: 0, longitude: 10 },
        ];
        expect(centralStop(stops).name).toBe("Mitte");
    });

    it("is the only stop of one", () => {
        expect(centralStop([{ name: "Prag", latitude: 50, longitude: 14 }]).name).toBe("Prag");
    });
});

describe("crowdedFolders", () => {
    // one degree is ten pixels
    const toPoint = ({ latitude, longitude }: { latitude: number; longitude: number }) => ({ x: longitude * 10, y: -latitude * 10 });

    it("finds the folders with two stops closer than the distance", () => {
        const close = folder({ id: 1, stops: [{ name: "a", latitude: 0, longitude: 0 }, { name: "b", latitude: 0, longitude: 2 }] });
        const apart = folder({ id: 2, stops: [{ name: "a", latitude: 0, longitude: 0 }, { name: "b", latitude: 5, longitude: 0 }] });
        const single = folder({ id: 3, stops: [{ name: "a", latitude: 0, longitude: 0 }] });
        expect(crowdedFolders([close, apart, single], toPoint, 30)).toEqual(new Set([1]));
    });

    it("also finds two stops that are not next to each other in the trip", () => {
        const stops = [
            { name: "a", latitude: 0, longitude: 0 },
            { name: "b", latitude: 0, longitude: 10 },
            { name: "c", latitude: 0, longitude: 1 },
        ];
        expect(crowdedFolders([folder({ id: 4, stops })], toPoint, 30)).toEqual(new Set([4]));
    });
});

describe("placeName", () => {
    it("takes the first part of the label", () => {
        expect(placeName("Sevilla, Andalusien, Spanien")).toBe("Sevilla");
        expect(placeName("  Prag ")).toBe("Prag");
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

describe("photoDescription", () => {
    it("is the caption of the photo", () => {
        expect(photoDescription("Porto", { caption: " Blick auf den Douro " }, 0)).toBe("Blick auf den Douro");
    });

    it("is the folder and the number of the photo if there is no caption", () => {
        expect(photoDescription("Porto", { caption: "" }, 2)).toBe("Porto 3");
        expect(photoDescription("Porto", { caption: "  " }, 0)).toBe("Porto 1");
    });
});

describe("cleanCaption", () => {
    it("removes the spaces around it and repeated ones inside", () => {
        expect(cleanCaption("  Blick   auf den\tDouro \n")).toBe("Blick auf den Douro");
    });

    it("is empty if there are only spaces", () => {
        expect(cleanCaption("   ")).toBe("");
    });
});

describe("travelPeriod", () => {
    it("is the month and the year of a trip within one month", () => {
        expect(travelPeriod({ startMonth: "2024-05", endMonth: null })).toBe("Mai 2024");
        expect(travelPeriod({ startMonth: "2024-03", endMonth: "2024-03" })).toBe("März 2024");
    });

    it("names the year once if the trip ended in the same year", () => {
        expect(travelPeriod({ startMonth: "2024-05", endMonth: "2024-06" })).toBe("Mai – Juni 2024");
    });

    it("names both years of a trip over the turn of the year", () => {
        expect(travelPeriod({ startMonth: "2023-12", endMonth: "2024-01" })).toBe("Dezember 2023 – Januar 2024");
    });

    it("is null if it is not known when the trip was", () => {
        expect(travelPeriod({ startMonth: null, endMonth: null })).toBeNull();
        expect(travelPeriod({ startMonth: "Mai 2024", endMonth: null })).toBeNull();
    });
});

describe("folderSubtitle", () => {
    it("is the country and the time of the trip", () => {
        expect(folderSubtitle(folder({ startMonth: "2024-09" }))).toBe("Portugal · September 2024");
    });

    it("is only what is known", () => {
        expect(folderSubtitle(folder())).toBe("Portugal");
        expect(folderSubtitle(folder({ name: "Andorra", country: "Andorra", startMonth: "2022-08" }))).toBe("August 2022");
    });

    it("is null if nothing is known", () => {
        expect(folderSubtitle(folder({ country: "" }))).toBeNull();
    });
});

describe("toMonth", () => {
    it("joins year and month", () => {
        expect(toMonth("2024", "05")).toBe("2024-05");
        expect(toMonth(" 2024 ", "12")).toBe("2024-12");
    });

    it("is null if nothing is filled in", () => {
        expect(toMonth("", "")).toBeNull();
        expect(toMonth("  ", "")).toBeNull();
    });

    it("is undefined if only one part is filled in", () => {
        expect(toMonth("2024", "")).toBeUndefined();
        expect(toMonth("", "05")).toBeUndefined();
    });

    it("is undefined if the year is none", () => {
        expect(toMonth("24", "05")).toBeUndefined();
        expect(toMonth("20245", "05")).toBeUndefined();
        expect(toMonth("1024", "05")).toBeUndefined();
    });
});

describe("folderRecipes", () => {
    const recipes = [recipe(1, "japanisch"), recipe(2, "italienisch"), recipe(3, "japanisch")];

    it("returns the recipes of the cuisine of the trip in their order", () => {
        expect(folderRecipes(folder({ cuisine: "japanisch" }), recipes).map((r) => r.id)).toEqual([1, 3]);
    });

    it("does not care how the cuisine is written", () => {
        expect(folderRecipes(folder({ cuisine: " Japanisch " }), recipes).map((r) => r.id)).toEqual([1, 3]);
    });

    it("returns nothing for a trip without a cuisine, also for recipes without one", () => {
        expect(folderRecipes(folder({ cuisine: "" }), [...recipes, recipe(4, "")])).toEqual([]);
    });

    it("returns nothing if no recipe has the cuisine", () => {
        expect(folderRecipes(folder({ cuisine: "spanisch" }), recipes)).toEqual([]);
    });
});

describe("recipeFolders", () => {
    const folders = [
        folder({ id: 1, name: "Japan", cuisine: "japanisch" }),
        folder({ id: 2, name: "Porto" }),
        folder({ id: 3, name: "Tokio", cuisine: "Japanisch" }),
    ];

    it("returns the trips with the cuisine of the recipe in the order of the folders", () => {
        expect(recipeFolders(recipe(1, "japanisch"), folders).map((f) => f.name)).toEqual(["Japan", "Tokio"]);
    });

    it("returns nothing if no trip has the cuisine", () => {
        expect(recipeFolders(recipe(1, "italienisch"), folders)).toEqual([]);
    });

    it("returns nothing for a recipe without a cuisine, also for trips without one", () => {
        expect(recipeFolders(recipe(1, ""), folders)).toEqual([]);
    });
});

describe("textParagraphs", () => {
    it("splits the text at empty lines and keeps the line breaks inside a paragraph", () => {
        expect(textParagraphs("Erster Absatz.\n\nZweiter Absatz,\nzweite Zeile.\n \n\nDritter.")).toEqual([
            "Erster Absatz.",
            "Zweiter Absatz,\nzweite Zeile.",
            "Dritter.",
        ]);
    });

    it("is empty for a folder without a text", () => {
        expect(textParagraphs("")).toEqual([]);
        expect(textParagraphs(" \n ")).toEqual([]);
    });
});
