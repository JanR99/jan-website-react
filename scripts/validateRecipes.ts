import * as fs from "fs";
import path from "path";
import type { Recipe } from "../src/types/Recipe";

const REQUIRED_FIELDS: (keyof Recipe)[] = [
    "title",
    "image",
    "defaultPortions",
    "cuisine",
    "tags",
    "ingredients",
    "preparation"
];

const filePath = path.resolve(process.cwd(), "public/recipes/recipes.json");

const raw = fs.readFileSync(filePath, "utf-8");
const data: unknown = JSON.parse(raw);

if (!Array.isArray(data)) {
    console.error("JSON is no array of recipes");
    process.exit(1);
}

let hasError = false;

data.forEach((recipe, index) => {
    if (typeof recipe !== "object" || recipe === null) {
        console.error(`Recipe ${index} is no object`);
        hasError = true;
        return;
    }

    const r = recipe as Partial<Recipe>;

    REQUIRED_FIELDS.forEach((field) => {
        const value = r[field];

        const isInvalid =
            value === undefined ||
            value === "" ||
            (field !== "tags" && Array.isArray(value) && value.length === 0);

        if (isInvalid) {
            console.error(
                `Recipe ${index} (${r.title ?? "NO TITLE"}) has invalid properties: ${field}`
            );
            hasError = true;
        }
    });

    if (typeof r.defaultPortions !== "number") {
        console.error(
            `Recipe ${index} (${r.title ?? "NO TITLE"}) defaultPortions is no number`
        );
        hasError = true;
    }

    if (r.tags && !Array.isArray(r.tags)) {
        console.error(
            `Recipe ${index} (${r.title ?? "NO TITLE"}) tags is no array`
        );
        hasError = true;
    }
});

if (hasError) {
    console.error("validation failed");
    process.exit(1);
} else {
    console.log("all recipes are valid");
}