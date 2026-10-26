import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import StatsController from "../controller/StatsController";
import { statsPage } from "../utils/visits";

const VISIT_KEY = "jan-website-visit";
/** when the browser's storage isn't available, a visit lasts as long as the page is open */
let visitCountedHere = false;

/** True once per visit: the first time in this tab (sessionStorage), afterwards false. */
function startsVisit(): boolean {
    try {
        if (sessionStorage.getItem(VISIT_KEY)) return false;
        sessionStorage.setItem(VISIT_KEY, "1");
        return true;
    } catch {
        if (visitCountedHere) return false;
        visitCountedHere = true;
        return true;
    }
}

/**
 * Counts every page opened (and once per tab the visit) for the admin area "Statistik". Admins who can see
 * the statistics aren't counted; for a logged-in user the count waits until it is known what they may do.
 * Used once, by Layout.
 */
export function useVisitCounter(): void {
    const { pathname } = useLocation();
    const { isAuthenticated, permissions } = useAuth();
    const counted = useRef<string | null>(null);
    const known = !isAuthenticated || permissions !== null;
    const isAdmin = permissions?.includes("VIEW_STATS") ?? false;

    useEffect(() => {
        if (!known || counted.current === pathname) return;
        counted.current = pathname;
        const page = statsPage(pathname);
        if (page === null || isAdmin) return;
        StatsController.recordVisit({ page, newVisit: startsVisit() }).catch(() => {
            // only a statistic: a visit that couldn't be counted is no reason to bother the visitor
        });
    }, [pathname, known, isAdmin]);
}
