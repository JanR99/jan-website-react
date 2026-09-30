/** Same values as the backend enum de.jan.role.Permission, with their German labels. */
export const PERMISSIONS = {
    MANAGE_RECIPES: "Rezepte verwalten",
    MANAGE_USERS: "Nutzer & Rollen verwalten",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];
