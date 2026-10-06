/** Same values as the backend enum de.jan.role.Permission, with their German labels. */
export const PERMISSIONS = {
    MANAGE_RECIPES: "Rezepte verwalten",
    MANAGE_TRAVEL: "Reisen verwalten",
    MANAGE_USERS: "Nutzer & Rollen verwalten",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export interface RoleDTO {
    id: number;
    name: string;
    permissions: Permission[];
    /** the ADMIN role: always every permission, can't be changed or deleted */
    system: boolean;
}

export interface RoleRequest {
    name: string;
    permissions: Permission[];
}

/** A user in the user management, with their roles. */
export interface UserAdminDTO {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    roleIds: number[];
}

export interface SetRolesRequest {
    email: string;
    roleIds: number[];
}
