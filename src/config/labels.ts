/** Same values as the backend enum de.jan.recipe.RecipeTag, with their German labels. */
export const RECIPE_TAGS = {
    VEGETARIAN: "vegetarisch",
    VEGAN: "vegan",
} as const satisfies Record<RecipeTag, string>;

/** Same values as the backend enum de.jan.role.Permission, with their German labels. */
export const PERMISSIONS = {
    MANAGE_RECIPES: "Rezepte verwalten",
    MANAGE_TRAVEL: "Reisen verwalten",
    MANAGE_USERS: "Nutzer & Rollen verwalten",
    EXPORT_DATA: "Daten exportieren",
    MANAGE_FEEDBACK: "Feedback verwalten",
} as const satisfies Record<Permission, string>;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];
