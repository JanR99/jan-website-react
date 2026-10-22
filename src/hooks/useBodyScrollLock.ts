import { useEffect } from "react";

/**
 * Keeps the page behind an overlay (dialog, cook mode, photo view) from scrolling while `locked` is true,
 * and gives it back the scrolling it had before.
 */
export function useBodyScrollLock(locked = true): void {
    useEffect(() => {
        if (!locked) return;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [locked]);
}
