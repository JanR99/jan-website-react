/**
 * Remembers how far each page of the browser history was scrolled, so that going back (or forward)
 * returns to the place where the page was left. A page opened by a link starts at the top.
 */
export function createScrollMemory() {
    /** by the key of the history entry */
    const positions = new Map<string, number>();
    let scrolledTo = 0;
    let currentPath: string | null = null;

    return {
        /** The visitor scrolled the page that is shown. */
        scrolled(position: number): void {
            scrolledTo = position;
        },

        /** A history entry is left; called before `enter` of the next one. */
        leave(key: string): void {
            positions.set(key, scrolledTo);
        },

        /**
         * A history entry is shown.
         *
         * @param cameBack reached with the back or forward button instead of a link
         * @returns where to scroll to; null to stay, because only the address of the same page changed
         *          (e.g. the search of the cookbook)
         */
        enter(key: string, path: string, cameBack: boolean): number | null {
            const samePage = path === currentPath;
            currentPath = path;
            if (samePage) return null;

            scrolledTo = cameBack ? (positions.get(key) ?? 0) : 0;
            return scrolledTo;
        },
    };
}
