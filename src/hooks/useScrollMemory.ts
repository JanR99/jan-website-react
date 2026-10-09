import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { createScrollMemory } from "../utils/scrollMemory";

const memory = createScrollMemory();

/**
 * Scrolls on every page change: to the top for a page opened by a link, back to where the page
 * was left for the back and forward buttons. Used once, by Layout.
 */
export function useScrollMemory(): void {
    const { key, pathname } = useLocation();
    const cameBack = useNavigationType() === "POP";

    useEffect(() => {
        // the browser would restore the position itself, but does so before the page is rendered
        history.scrollRestoration = "manual";

        const onScroll = () => memory.scrolled(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // as a layout effect: the place must be noted and set before the browser reacts to the new page's height
    useLayoutEffect(() => {
        const position = memory.enter(key, pathname, cameBack);
        if (position !== null) window.scrollTo(0, position);
        return () => memory.leave(key);
    }, [key, pathname, cameBack]);
}
