import { useEffect } from "react";

const SITE_TITLE = "Jans Website";

/**
 * Shows the page's name in the browser tab, e.g. "Japan – Jans Website".
 * Without a name (still loading, nothing found) and after leaving the page it is just "Jans Website".
 */
export function usePageTitle(name?: string) {
    useEffect(() => {
        document.title = name ? `${name} - ${SITE_TITLE}` : SITE_TITLE;
        return () => { document.title = SITE_TITLE; };
    }, [name]);
}
