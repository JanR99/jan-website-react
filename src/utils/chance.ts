/** A number from 0 to 1 that looks random, but is always the same for the same seed and id. */
export function lot(seed: number, id: number): number {
    const mixed = Math.sin(id * 12.9898 + seed * 78.233) * 43758.5453;
    return mixed - Math.floor(mixed);
}

/**
 * A few of the given things chosen by chance, for the home page. Each one draws a lot that only depends
 * on the seed and its id, and the smallest lots win. So the choice changes with the seed, but stays as
 * it is while the same things are loaded again.
 *
 * @param items the items to choose from
 * @param count the maximum number
 * @param seed a random number from 0 to 1, drawn once per visit
 */
/** A copy of the items in a random order (Fisher-Yates). @param random a function like Math.random, replaceable for tests */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function chosenByChance<T extends { id: number }>(items: T[], count: number, seed: number): T[] {
    return [...items].sort((a, b) => lot(seed, a.id) - lot(seed, b.id)).slice(0, count);
}
