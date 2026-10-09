/** A number from 0 to 1 that looks random, but is always the same for the same seed and id. */
function lot(seed: number, id: number): number {
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
export function chosenByChance<T extends { id: number }>(items: T[], count: number, seed: number): T[] {
    return [...items].sort((a, b) => lot(seed, a.id) - lot(seed, b.id)).slice(0, count);
}
