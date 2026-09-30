import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, ChefHat, Heart, Plane, ShieldCheck, User } from "lucide-react";
import ProfileSection from "../components/account/ProfileSection";
import FavoritesSection from "../components/account/FavoritesSection";
import RecipeAdminSection from "../components/account/RecipeAdminSection";
import UsersRolesSection from "../components/account/UsersRolesSection";
import type { Permission } from "../types/roles";

export interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
    activePrefixes?: string[];
}

export const MAIN_NAV: NavItem[] = [
    { to: "/", label: "Reisen", icon: Plane, activePrefixes: ["/destination"] },
    { to: "/cookbook", label: "Kochbuch", icon: BookOpen },
];

export interface AccountSection {
    path: string;
    label: string;
    icon: LucideIcon;
    description?: string;
    element: ReactNode;
    showInMenu?: boolean;
    requires?: Permission;
}

export const ACCOUNT_SECTIONS: AccountSection[] = [
    {
        path: "",
        label: "Profil",
        icon: User,
        description: "Deine Kontodaten auf einen Blick.",
        element: <ProfileSection />,
    },
    {
        path: "favoriten",
        label: "Favoriten",
        icon: Heart,
        description: "Rezepte, die du im Kochbuch mit einem Herz markiert hast.",
        element: <FavoritesSection />,
    },
    {
        path: "rezepte",
        label: "Rezepte verwalten",
        icon: ChefHat,
        description: "Rezepte im Kochbuch anlegen, bearbeiten und löschen.",
        element: <RecipeAdminSection />,
        requires: "MANAGE_RECIPES",
    },
    {
        path: "nutzer",
        label: "Nutzer & Rollen",
        icon: ShieldCheck,
        description: "Rollen mit Rechten festlegen und Nutzern zuweisen.",
        element: <UsersRolesSection />,
        requires: "MANAGE_USERS",
    },
];

export const ACCOUNT_BASE = "/konto";

export const accountSectionPath = (section: AccountSection) =>
    section.path ? `${ACCOUNT_BASE}/${section.path}` : ACCOUNT_BASE;

export const visibleAccountSections = (permissions: Permission[] | null) =>
    ACCOUNT_SECTIONS.filter((section) => !section.requires || (permissions?.includes(section.requires) ?? false));
