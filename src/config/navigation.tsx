import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Heart, Plane, User } from "lucide-react";
import ProfileSection from "../components/account/ProfileSection";
import FavoritesSection from "../components/account/FavoritesSection";

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
];

export const ACCOUNT_BASE = "/konto";

export const accountSectionPath = (section: AccountSection) =>
    section.path ? `${ACCOUNT_BASE}/${section.path}` : ACCOUNT_BASE;

export const visibleAccountSections = () => ACCOUNT_SECTIONS;
