package de.jan.controller.response;

/**
 * What the logged-in user may do, so the frontend can show matching UI.
 * Deliberately no general admin flag; every action is still checked in the backend.
 */
public class PermissionsResponse {

    private final boolean canManageRecipes;
    private final boolean canManageUsers;

    public PermissionsResponse(boolean canManageRecipes, boolean canManageUsers) {
        this.canManageRecipes = canManageRecipes;
        this.canManageUsers = canManageUsers;
    }

    public boolean isCanManageRecipes() {
        return canManageRecipes;
    }

    public boolean isCanManageUsers() {
        return canManageUsers;
    }
}
