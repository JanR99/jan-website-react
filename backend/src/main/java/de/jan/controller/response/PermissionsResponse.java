package de.jan.controller.response;

/**
 * What the logged-in user may do, so the frontend can show matching UI.
 * Deliberately no general admin flag; every action is still checked in the backend.
 */
public class PermissionsResponse {

    private final boolean canManageRecipes;

    public PermissionsResponse(boolean canManageRecipes) {
        this.canManageRecipes = canManageRecipes;
    }

    public boolean isCanManageRecipes() {
        return canManageRecipes;
    }
}
