import { COOKBOOK_BASE } from "./recipe";
import { OTHER_PAGE } from "./visits";
import { TRAVEL_BASE } from "./travel";

type Day = StatsResponse["days"][number];

/** The visits of the last `count` days (the newest are at the end of the list). */
export function visitsOfLastDays(days: Day[], count: number): number {
    return days.slice(-count).reduce((sum, day) => sum + day.visits, 0);
}

/** "26.10." for a day like "2026-10-26". */
export function shortDay(day: string): string {
    const [, month, date] = day.split("-");
    return `${date}.${month}.`;
}

const FIXED_PAGES: Record<string, string> = {
    "/": "Startseite",
    [COOKBOOK_BASE]: "Kochbuch",
    [TRAVEL_BASE]: "Reisetagebuch",
    "/spiele": "Spiele",
    "/spiele/kreuzwortraetsel": "Kreuzworträtsel",
    "/spiele/kana": "Kana lesen",
    "/spiele/kanji": "Kanji lesen",
    "/datenschutz": "Datenschutz",
    "/lizenzen": "Open-Source-Lizenzen",
    [OTHER_PAGE]: "Andere Adressen",
};

/** A counted page the way a person reads it: "Rezept: Ramen", "Reise: Japan", "Kochbuch". */
export function pageLabel(
    page: string,
    recipes: Pick<Recipe, "id" | "title">[],
    folders: Pick<TravelFolder, "id" | "name">[],
): string {
    if (FIXED_PAGES[page]) return FIXED_PAGES[page];
    const recipeId = /^\/cookbook\/(\d+)$/.exec(page)?.[1];
    if (recipeId) {
        const recipe = recipes.find((r) => r.id === Number(recipeId));
        return recipe ? `Rezept: ${recipe.title}` : `Rezept ${recipeId} (gelöscht)`;
    }
    const folderId = new RegExp(`^${TRAVEL_BASE}/(\\d+)$`).exec(page)?.[1];
    if (folderId) {
        const folder = folders.find((f) => f.id === Number(folderId));
        return folder ? `Reise: ${folder.name}` : `Reise ${folderId} (gelöscht)`;
    }
    return page;
}
