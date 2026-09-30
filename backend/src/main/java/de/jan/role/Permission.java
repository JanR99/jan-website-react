package de.jan.role;

/**
 * Everything that can be granted through a role. Checked in the backend with
 * Authorization.with(user).require(...); the German labels live in the frontend (src/types/roles.ts).
 */
public enum Permission {
    /** create, edit and delete recipes, upload images */
    MANAGE_RECIPES,
    /** manage roles and assign them to users */
    MANAGE_USERS
}
