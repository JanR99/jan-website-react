import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "theme";

function systemTheme(): Theme {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme(): Theme | null {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === "light" || value === "dark" ? value : null;
    } catch {
        return null;
    }
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => storedTheme() ?? systemTheme());

    useEffect(() => {
        if (storedTheme()) {
            document.documentElement.dataset.theme = theme;
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((current) => {
            const next: Theme = current === "dark" ? "light" : "dark";
            document.documentElement.dataset.theme = next;
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // ignorieren
            }
            return next;
        });
    }, []);

    return { theme, toggleTheme };
}
