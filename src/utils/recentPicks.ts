import { shuffle } from "./chance";

/** How much of a pool is remembered as recent, so a small pool doesn't run out of things to pick. */
const RECENT_SHARE = 0.6;

/**
 * Remembers what the last rounds of this visit used, oldest first, so that a new round takes others
 * where it can. One per game, kept for as long as the page is open.
 */
export function recentPicks() {
    const recent: string[] = [];

    /** Notes what a round used; poolSize is how many there were to choose from. */
    function remember(keys: string[], poolSize: number) {
        recent.push(...keys);
        recent.splice(0, Math.max(0, recent.length - Math.floor(poolSize * RECENT_SHARE)));
    }

    return {
        /** What the last rounds used. */
        recent: () => new Set(recent),
        remember,
        /** Up to `count` items of the pool in a random order, recently used ones only when there are too few others; remembers them. */
        pick<T>(pool: T[], count: number, key: (item: T) => string): T[] {
            const lately = new Set(recent);
            const picked = [
                ...shuffle(pool.filter((item) => !lately.has(key(item)))),
                ...shuffle(pool.filter((item) => lately.has(key(item)))),
            ].slice(0, count);
            remember(picked.map(key), pool.length);
            return picked;
        },
    };
}
